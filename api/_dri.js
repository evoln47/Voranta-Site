// Research Conversion Index data, server-side scoring, and email rendering.
//
// Underscore-prefixed so Vercel does not treat this as a route or function; it
// is imported by api/lead.js and bundled in at build time. Keeping the bulk
// (and the large embedded HTML document) out of the function entrypoint keeps
// api/lead.js small enough for zero-config function detection to pick it up.
//
// Security: the result is derived here from the submitted answers only, so the
// emails can contain Voranta's own authored copy and never client-supplied text.
// Mirrors assessment/framework.mjs + assessment/scoring.mjs. Keep in sync.

const BOOKING_URL = 'https://calendly.com/evoln47/30min';

// ONE question per dimension. The six option values (0,20,40,60,80,100) ARE the
// dimension /100 scores; choiceIndex selects one. Mirrors framework.mjs.
const OPTION_VALUES = [0, 20, 40, 60, 80, 100];
const QUESTIONS = {
  pov: { dimension: 'pointOfView', points: OPTION_VALUES },
  sensing: { dimension: 'buyerResearchSensing', points: OPTION_VALUES },
  conv: { dimension: 'conversionSurface', points: OPTION_VALUES },
  trust: { dimension: 'trustAtCapture', points: OPTION_VALUES },
  signal: { dimension: 'signalToSales', points: OPTION_VALUES },
};

// Scoring weights, sum 1.00. Mirrors assessment/scoring.mjs WEIGHTS.
const WEIGHTS = {
  pointOfView: 0.30,
  buyerResearchSensing: 0.20,
  conversionSurface: 0.20,
  trustAtCapture: 0.16,
  signalToSales: 0.14,
};

// Archetype thresholds on the /100-as-fraction scale. The DOWNSTREAM epsilon is
// load-bearing: a downstream cluster like (1.0,1.0,0.0) means a hair below 2/3 in
// floating point and must still classify high.
const UPSTREAM_HIGH_FRAC = 0.70;
const DOWNSTREAM_HIGH_FRAC = 2 / 3 - 1e-9;
const HIGH_BAND_100 = 75; // /100 band cut: high = >= 75.

// [key, label, gap blurb, edge blurb] in the demand-funnel order ties break by.
// gap = deficit framing (low/mid focus); edge = opportunity framing (high focus).
// Mirrors assessment/framework.mjs dimensions[] exactly. Keep in sync.
const DIMENSIONS = [
  ['pointOfView', 'Point of View',
    "Buyers research the problem using a framework someone else named. Every piece of content you publish builds authority for that framework, not yours. A proprietary, opinionated framework the market associates with your brand changes that. It turns your competitors' positioning pressure into evidence for a category point of view only you can claim.",
    'Your point of view is already reaching buyers and shaping how they think about the problem. The next step is formalizing it into a named, structured framework the market associates with your brand. That move lifts a content strength into a category position a competitor cannot replicate by outspending you.'],
  ['buyerResearchSensing', 'Buyer Research Sensing',
    'You are publishing without a reliable read on what your buyers are actually researching. The market moves and your positioning does not follow, because nothing systematically tells it to. A measured loop, where buyer research behavior is captured and feeds back into what you publish and how you frame the problem, turns guesswork into a steering signal for the whole engine.',
    'You already read what buyers are researching and let it shape your marketing. The next step is closing the loop fully, so buyer behavior does not just inform a campaign but continuously revises the framework itself. That is what keeps your point of view current as the category moves, instead of aging into yesterday\'s answer.'],
  ['conversionSurface', 'Conversion Surface',
    'You earn attention, but the action you ask for leaks it. Buyers who were ready to engage step off the path before you can identify them. A lower-friction, relevant next step tied to clear measurement closes that leak and turns earned attention into attributable pipeline.',
    'Your conversion surface is working. Buyers who engage are becoming identifiable contacts at a measurable rate. The next step is precision: tighter paths and sharper measurement so every point of earned attention becomes attributable pipeline, not just most of it.'],
  ['trustAtCapture', 'Trust at Capture',
    'What you ask for and what you give back are out of balance. Buyers tolerate the exchange rather than value it. When the first thing a buyer receives is a diagnosis specific to their situation, giving you their information stops feeling like a toll and starts being worth it on its own terms.',
    'The exchange at capture already earns its keep. Buyers get real value the moment they engage and the hand-raise pays for itself. The next step is specificity: making what buyers receive so precisely matched to their situation that the first interaction sets up every conversation that follows.'],
  ['signalToSales', 'Signal to Sales',
    'Your reps start from scratch on every first call. Delivering a prioritized, account-specific brief to the right rep before they dial means the first conversation opens on the actual gap in that account, not on introductory discovery.',
    'Reps already have meaningful context before the first call. The next step is sharpening the brief and the routing so every rep opens every conversation on the account-specific gap, not just when the system fires cleanly.'],
];

const ARCHETYPES = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Buyers read your content, then research the problem using someone else's framework. That framework sets the vocabulary, shapes the shortlist, and earns the referral. Until you own the framework buyers research against and read what they are researching, your content spend builds authority for whoever does." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You have built real strategy: a point of view the market engages with and a read on what your buyers are researching. The gap is downstream. The path from earned attention to identifiable, sales-ready pipeline is not closing the distance the strategy has already opened.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'You have built a broadly strong downstream engine. The structural gap is upstream. You compete on a framework someone else defined, and you are not systematically reading what buyers research, which means a well-resourced rival can claim the category position you are currently borrowing.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own the framework buyers research against, you read what they are researching and feed it back, and the rest of your engine is broadly strong. That combination is hard to build and harder to sustain. The question is how quickly you can deepen the position before a well-resourced rival makes it worth challenging.' },
};

// Re-derive the full result from answers. Mirrors assessment/scoring.mjs.
// Returns null if the submission is not a complete, valid set of answers.
//
// RESULT SHAPE (mirrors assessment/scoring.mjs scoreAnswers):
//   score            RCI 0-100, round(weighted sum of the five dimension values),
//                    rounded ONCE from the full-precision weighted sum (the five
//                    displayed dimension /100s do not always average to this; that
//                    is intended).
//   dimensionScores  { <dimKey>: <0-100> } the chosen option value per dimension.
//   dimensionRaw     { <dimKey>: <0-100> } identical to dimensionScores (one item
//                    per dimension, so there is no separate raw scale).
//   archetype, focus, evenTier as before.
function scoreAnswers(answers) {
  if (!Array.isArray(answers)) return null;
  const dimensionScores = {};

  for (const id of Object.keys(QUESTIONS)) {
    const q = QUESTIONS[id];
    const a = answers.find((x) => x && x.questionId === id);
    if (!a) return null; // every question must be answered
    const idx = a.choiceIndex;
    if (!Number.isInteger(idx) || idx < 0 || idx >= q.points.length) return null;
    // One question per dimension: the chosen option value is the dimension /100.
    dimensionScores[q.dimension] = q.points[idx];
  }

  // dimensionRaw kept identical for any consumer that reads it.
  const dimensionRaw = { ...dimensionScores };

  // RCI /100: weighted sum of the five dimension values (each already 0..100),
  // rounded ONCE. Same operation order as assessment/scoring.mjs so float parity
  // holds at .5 edges.
  let weighted = 0;
  for (const [key] of DIMENSIONS) weighted += WEIGHTS[key] * dimensionScores[key];
  const score = Math.round(weighted);

  // Archetype is DIMENSION-DEFINED, not score-defined, so it can never contradict
  // the #1 gap (the lowest dimension). A clean 2x2 over two cluster means on the
  // /100-as-fraction scale:
  //   - UPSTREAM (strategy): mean(pointOfView, buyerResearchSensing) >= 0.70.
  //   - DOWNSTREAM (execution): mean(conversionSurface, trustAtCapture,
  //     signalToSales) >= 2/3 (with the float epsilon).
  // Authority/Publisher require upstreamHigh (an upstream floor); Renter/Operator
  // require upstream low (an upstream ceiling). Mirrors assessment/scoring.mjs
  // pickArchetype() exactly. Keep in sync.
  //
  //                       downstream low      downstream high
  //   upstream high          Publisher           Authority
  //   upstream low           Renter              Operator
  const upstreamMean = (dimensionScores.pointOfView / 100 + dimensionScores.buyerResearchSensing / 100) / 2;
  const downstreamMean = (dimensionScores.conversionSurface / 100 + dimensionScores.trustAtCapture / 100 + dimensionScores.signalToSales / 100) / 3;
  const upstreamHigh = upstreamMean >= UPSTREAM_HIGH_FRAC;
  const downstreamHigh = downstreamMean >= DOWNSTREAM_HIGH_FRAC;
  let archetype;
  if (upstreamHigh) archetype = downstreamHigh ? ARCHETYPES.authority : ARCHETYPES.publisher;
  else archetype = downstreamHigh ? ARCHETYPES.operator : ARCHETYPES.renter;

  // FOCUS is the single dimension to act on next, ALWAYS surfaced unless all five
  // dimensions are exactly equal. Lowest UNWEIGHTED /100 wins; the scoring weights
  // do NOT affect gap selection. Ties break by DIMENSIONS order (the demand-funnel
  // sequence). tier is set by the focus dimension's own band using the same HIGH =
  // 75 cut as band() below: < 75 -> 'deficit' (gap to close), >= 75 -> 'edge' (next
  // lever to extend). A high-band lowest is an edge, never a deficit. null only when
  // all five are equal (the sole no-focus state); evenTier then reports high vs low.
  // Mirrors assessment/scoring.mjs pickFocus()/evenTier() exactly. Keep in sync.
  const dimValues = DIMENSIONS.map(([key]) => dimensionScores[key]);
  const dimMin = Math.min(...dimValues);
  const dimMax = Math.max(...dimValues);
  let focus = null;
  let evenTier = null;
  if (dimMin !== dimMax) {
    for (const [key, label, gapBlurb, edgeBlurb] of DIMENSIONS) {
      if (focus === null || dimensionScores[key] < focus.value) focus = { dimension: key, label, gapBlurb, edgeBlurb, value: dimensionScores[key] };
    }
    const tier = focus.value >= HIGH_BAND_100 ? 'edge' : 'deficit';
    const blurb = tier === 'edge' ? focus.edgeBlurb : focus.gapBlurb;
    focus = { dimension: focus.dimension, label: focus.label, tier, blurb };
  } else {
    evenTier = dimMin >= HIGH_BAND_100 ? 'high' : 'low';
  }

  return {
    score,
    dimensionScores,
    dimensionRaw,
    archetype: { key: archetype.key, label: archetype.label, blurb: archetype.blurb },
    focus,
    evenTier,
  };
}

// Band on the /100 scale: low < 50, mid 50..<75, high >= 75. dimensionScores
// now holds /100 values, so this feeds the edge-vs-gap first-sentence pick.
function band(value) {
  if (value < 50) return 'low';
  if (value < 75) return 'mid';
  return 'high';
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Email-only copy constants (not used by scoreAnswers; safe to add without
// affecting parity). Keyed by result.archetype.key.

const PREHEADER = {
  renter:    'The framework buyers use to research your category belongs to someone else. Here is what your score means and what to do about it.',
  publisher: 'You have built real upstream strategy: a point of view the market engages with and a read on what your buyers are researching. The leak is downstream. Here is your full breakdown.',
  operator:  'Your demand engine is broadly strong. What it is missing is a lens you own. Here is your full breakdown.',
  authority: 'You hold the position. The question is how fast you can extend it before a rival catches up. Here is your full breakdown.',
};

// LEAD_IN: one sentence after archetype label, before archetype.blurb.
// Interpolated at render time with result.score.
const LEAD_IN = {
  renter:    (score) => `A score of ${score} places you in the largest group of B2B software marketing teams: reaching buyers who then research the problem on someone else's terms.`,
  publisher: (score) => `A score of ${score} reflects real upstream strategy with a gap in what comes after the read.`,
  operator:  (score) => `A score of ${score} reflects a broadly capable demand engine that competes on borrowed authority.`,
  authority: (score) => `A score of ${score} reflects a demand engine with a genuine structural advantage over most of your peers.`,
};

// DIMENSION_FIRST_SENTENCE: keyed by dimension key, gap (low/mid) and edge (high).
const DIMENSION_FIRST_SENTENCE = {
  pointOfView:          { gap: 'Buyers research the problem using a framework someone else named.',    edge: 'Your point of view is already reaching buyers and shaping how they think about the problem.' },
  buyerResearchSensing: { gap: 'You are publishing without a reliable read on what your buyers are actually researching.', edge: 'You already read what buyers are researching and let it shape your marketing.' },
  conversionSurface: { gap: 'You earn attention, but the action you ask for leaks it.', edge: 'Your conversion surface is working.' },
  trustAtCapture:    { gap: 'What you ask for and what you give back are out of balance.', edge: 'The exchange at capture already earns its keep.' },
  signalToSales:     { gap: 'Your reps start from scratch on every first call.',    edge: 'Reps already have meaningful context before the first call.' },
};

// POSITIONING: one paragraph per archetype. evenLow uses renter, evenHigh uses authority.
// These paragraphs are cluster-silent for renter, operator, and authority per spec.
const POSITIONING = {
  renter:    'The Authority position requires two things: a framework the market names and researches against, and a funnel that turns that interest into identifiable, sales-ready pipeline. Your result shows open ground on both. That is not an unusual starting point. Most B2B software marketing teams compete on borrowed frameworks and measure pipeline loosely, if at all. What separates teams that close the gap is sequencing: they build the point of view first, because a proprietary framework gives the funnel something worth running on. The same funnel running on a rented framework sends buyers back to whoever owns it.',
  publisher: 'You have built the harder thing to build. A proprietary point of view grounded in a read on what buyers research cannot be bought quickly or replicated by outspending you. What separates The Publisher from The Authority is not the upstream strategy: it is what connects to that strategy downstream. The strongest Publisher-to-Authority moves share a pattern: the same framework that earns the read becomes the mechanism that qualifies the hand-raise and briefs the rep. The point of view stops being a content asset and starts being the architecture that turns interest into pipeline.',
  operator:  'You have built the downstream infrastructure most teams lack. Your funnel is working at a level where adding a proprietary framework would compound immediately, because you have the machinery to act on the authority it generates. The risk is not your funnel. It is that a well-funded competitor builds the category framework first and your funnel starts feeding their pipeline. The Operator-to-Authority move is the most direct path: one structural gap to close, with the rest of the build already in place.',
  authority: 'You own the framework buyers research against and the funnel behind it is broadly strong. That is a structural position most teams in your category do not have and cannot acquire quickly. The pattern among teams that sustain it is aggressive deepening, not coasting: they make the framework harder to reverse-engineer by building proprietary research, named constructs, and published methodology that take years to replicate. The risk is not a rival outperforming you operationally. It is a rival publishing a credible competing framework before you have locked the category\'s vocabulary.',
};

// CTA_FRAMING: sentence before the booking button, keyed on archetype key.
// evenHigh uses authority, evenLow uses renter (same as POSITIONING key).
const CTA_FRAMING = {
  renter:    'Your score shows where the build starts. In 30 minutes, Voranta can map the sequence so you are building in the right order.',
  publisher: 'The upstream strategy is the hard part, and you have it. A 30-minute call with Voranta pinpoints the specific gap between your content and the pipeline it should be generating.',
  operator:  'Your funnel is ready to compound a framework you own. A 30-minute call with Voranta scopes what that framework looks like for your category and how quickly you can move.',
  authority: 'You have the position. A 30-minute call with Voranta identifies the specific move that makes it structurally harder to challenge before a rival decides to try.',
};

// Returns the email subject line for the visitor email.
// NOTE: api/lead.js:115 still builds the subject inline with the old format.
// That line must be updated to call buildVisitorSubject(result) for this subject
// to ship. That one-line wiring change is in api/lead.js, outside the edit scope
// for this task.
function buildVisitorSubject(result) {
  return `Your Research Conversion Index: ${result.score}/100. You are ${result.archetype.label}.`;
}

// Section head labels for the focus block.
// tier 'deficit' = a gap to close; tier 'edge' = the next lever to extend.
// evenTier labels are inline in buildVisitorText/buildVisitorHtml.
function focusLabel(focus) {
  if (!focus) return 'Your focus';
  return focus.tier === 'edge' ? 'Your strongest next move' : 'Where you are leaking';
}

function buildLeadText(email, result) {
  const ds = result.dimensionScores;
  const f = result.focus;
  return [
    'New Research Conversion Index lead',
    '',
    `Email: ${email}`,
    `Score: ${result.score}/100`,
    `Archetype: ${result.archetype.label}`,
    `Focus: ${f ? `${f.label} (${f.tier})` : `none, all dimensions even (${result.evenTier})`}`,
    '',
    'Dimension scores (/100):',
    ...DIMENSIONS.map(([key, label]) => `  ${label}: ${ds[key]}`),
  ].join('\n');
}

function buildVisitorText(result) {
  const ds = result.dimensionScores;
  const f = result.focus;
  const archetypeKey = result.archetype.key;

  // Section 2: eyebrow + score
  // Section 3: archetype label, lead-in, blurb
  // Section 4: dimension breakdown rows
  const dimRows = DIMENSIONS.map(([key, label]) => {
    const raw = ds[key];
    const b = band(raw);
    const firstSentence = b === 'high'
      ? DIMENSION_FIRST_SENTENCE[key].edge
      : DIMENSION_FIRST_SENTENCE[key].gap;
    return `  ${label}: ${raw} / 100  [${b}]  ${firstSentence}`;
  });

  // Section 5: PRIORITY focus callout
  let priorityLabel;
  let priorityBody;
  if (f) {
    priorityLabel = f.tier === 'deficit' ? 'Priority: where you are leaking' : 'Priority: your strongest next move';
    priorityBody = f.blurb;
  } else if (result.evenTier === 'high') {
    priorityLabel = 'Strong across every dimension';
    priorityBody = 'All five dimensions score in the high band. That is a real structural position. The priority now is to deepen the lead before a competitor decides it is worth building against.';
  } else {
    priorityLabel = 'A systemic opportunity';
    priorityBody = 'No single dimension is pulling the others down, which means there is no one fix to isolate. The opportunity is to build deliberately and in the right order. Voranta can scope that sequence in 30 minutes.';
  }

  // Section 6: positioning paragraph (evenLow -> renter, evenHigh -> authority)
  const positioningKey = !f && result.evenTier === 'high' ? 'authority' : !f ? 'renter' : archetypeKey;
  const positioning = POSITIONING[positioningKey];

  // Section 7: CTA
  const ctaKey = !f && result.evenTier === 'high' ? 'authority' : !f ? 'renter' : archetypeKey;
  const ctaFraming = CTA_FRAMING[ctaKey];
  let buttonLabel;
  if (f && f.tier === 'edge') buttonLabel = 'Book a call to extend your lead';
  else if (f) buttonLabel = 'Book a call to close the gap';
  else if (result.evenTier === 'high') buttonLabel = 'Book a call to extend your lead';
  else buttonLabel = 'Book a call to sequence the build';
  const ctaLine = `${buttonLabel}: ${BOOKING_URL}`;

  return [
    'DEMAND RESEARCH INDEX',
    `${result.score} / 100`,
    '',
    result.archetype.label,
    LEAD_IN[archetypeKey](result.score),
    result.archetype.blurb,
    '',
    'WHERE YOU STAND',
    ...dimRows,
    '',
    '--- PRIORITY ---',
    priorityLabel,
    priorityBody,
    '---',
    '',
    'WHERE YOU STAND IN THE FRAMEWORK',
    positioning,
    '',
    ctaFraming,
    ctaLine,
    '',
    'You took the Research Conversion Index at voranta.co. Reply to this email and it reaches us directly.',
  ].join('\n');
}

function buildVisitorHtml(result) {
  const ds = result.dimensionScores;
  const f = result.focus;
  const archetypeKey = result.archetype.key;

  // Section 4: five dimension rows with /100 score, band, first-sentence read, and score bar.
  const dimRows = DIMENSIONS.map(([key, label]) => {
    const score100 = ds[key];
    const b = band(score100);
    const firstSentence = b === 'high'
      ? DIMENSION_FIRST_SENTENCE[key].edge
      : DIMENSION_FIRST_SENTENCE[key].gap;
    // Score bar: filled cell is cyan (#0891B2), track remainder is light grey (#E3E8E4).
    // font-size:0;line-height:0 ensures 0-width cells collapse cleanly.
    const filledWidth = score100;
    const trackWidth = 100 - score100;
    return `
              <tr><td style="padding:12px 0 0;border-bottom:1px solid #E3E8E4;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:15px;font-weight:600;color:#0A0908;font-family:system-ui,'Segoe UI',Helvetica,Arial,sans-serif;">${escapeHtml(label)}</td>
                    <td align="right" style="font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#6B6E6B;white-space:nowrap;">${escapeHtml(score100)}&nbsp;/&nbsp;100&nbsp;&nbsp;${escapeHtml(b)}</td>
                  </tr>
                  <tr><td colspan="2" style="padding-top:6px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="${filledWidth}%" style="height:4px;background:#0891B2;font-size:0;line-height:0;">&nbsp;</td>
                        <td width="${trackWidth}%" style="height:4px;background:#E3E8E4;font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                    </table>
                  </td></tr>
                  <tr>
                    <td colspan="2" style="padding-top:6px;padding-bottom:12px;font-size:14px;line-height:1.5;color:#3F3F3D;font-family:system-ui,'Segoe UI',Helvetica,Arial,sans-serif;">${escapeHtml(firstSentence)}</td>
                  </tr>
                </table>
              </td></tr>`;
  }).join('');

  // Section 5: PRIORITY callout
  let priorityLabel;
  let priorityBody;
  if (f) {
    priorityLabel = f.tier === 'deficit' ? 'Priority: where you are leaking' : 'Priority: your strongest next move';
    priorityBody = f.blurb;
  } else if (result.evenTier === 'high') {
    priorityLabel = 'Strong across every dimension';
    priorityBody = 'All five dimensions score in the high band. That is a real structural position. The priority now is to deepen the lead before a competitor decides it is worth building against.';
  } else {
    priorityLabel = 'A systemic opportunity';
    priorityBody = 'No single dimension is pulling the others down, which means there is no one fix to isolate. The opportunity is to build deliberately and in the right order. Voranta can scope that sequence in 30 minutes.';
  }

  // Section 6: positioning paragraph (evenLow -> renter, evenHigh -> authority)
  const positioningKey = !f && result.evenTier === 'high' ? 'authority' : !f ? 'renter' : archetypeKey;
  const positioning = POSITIONING[positioningKey];

  // Section 7: CTA
  const ctaKey = !f && result.evenTier === 'high' ? 'authority' : !f ? 'renter' : archetypeKey;
  const ctaFraming = CTA_FRAMING[ctaKey];
  let buttonLabel;
  if (f && f.tier === 'edge') buttonLabel = 'Book a call to extend your lead';
  else if (f) buttonLabel = 'Book a call to close the gap';
  else if (result.evenTier === 'high') buttonLabel = 'Book a call to extend your lead';
  else buttonLabel = 'Book a call to sequence the build';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:#ECF1ED;color-scheme:light;">
  <!-- Section 1: hidden preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#ECF1ED;line-height:1px;">${escapeHtml(PREHEADER[archetypeKey])}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECF1ED;">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;font-family:system-ui,'Segoe UI',Helvetica,Arial,sans-serif;color:#0A0908;">

        <!-- Masthead: text wordmark, no image -->
        <tr><td style="padding-bottom:16px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-weight:500;letter-spacing:-0.025em;font-size:22px;color:#0A0908;">Voranta<span style="color:#0891B2;font-size:10px;vertical-align:4px;">*</span></span>
        </td></tr>
        <tr><td style="border-bottom:1px solid #CDD3CE;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr><td style="height:24px;line-height:24px;font-size:1px;">&nbsp;</td></tr>

        <!-- Dark score hero: eyebrow + score + archetype -->
        <tr><td style="background:#0A0908;padding:28px 24px;border-radius:8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0891B2;font-weight:600;padding-bottom:12px;">Research Conversion Index</td></tr>
            <tr><td>
              <span style="font-size:56px;font-weight:600;line-height:1;color:#ECF1ED;">${escapeHtml(result.score)}</span><span style="font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:20px;color:#CDD3CE;"> / 100</span>
            </td></tr>
            <tr><td style="height:16px;line-height:16px;font-size:1px;">&nbsp;</td></tr>
            <tr><td style="font-size:20px;font-weight:600;color:#ECF1ED;padding-bottom:6px;">${escapeHtml(result.archetype.label)}</td></tr>
            <tr><td style="font-size:15px;line-height:1.55;color:#CDD3CE;padding-bottom:6px;">${escapeHtml(LEAD_IN[archetypeKey](result.score))}</td></tr>
            <tr><td style="font-size:15px;line-height:1.55;color:#CDD3CE;">${escapeHtml(result.archetype.blurb)}</td></tr>
          </table>
        </td></tr>

        <!-- Spacer -->
        <tr><td style="height:28px;line-height:28px;font-size:1px;">&nbsp;</td></tr>

        <!-- Section 4: dimension scorecard -->
        <tr><td style="border-top:1px solid #CDD3CE;padding:20px 0 8px;font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6B6E6B;font-weight:600;">Where you stand</td></tr>
        ${dimRows}

        <!-- Spacer -->
        <tr><td style="height:20px;line-height:20px;font-size:1px;">&nbsp;</td></tr>

        <!-- Section 5: PRIORITY focus callout -->
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="border-left:3px solid #0891B2;background:#E0EFF1;padding:16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#0891B2;font-weight:600;padding-bottom:8px;">${escapeHtml(priorityLabel)}</td></tr>
                <tr><td style="font-size:15px;line-height:1.55;color:#155E75;font-family:system-ui,'Segoe UI',Helvetica,Arial,sans-serif;">${escapeHtml(priorityBody)}</td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Spacer -->
        <tr><td style="height:28px;line-height:28px;font-size:1px;">&nbsp;</td></tr>

        <!-- Section 6: positioning paragraph -->
        <tr><td style="border-top:1px solid #CDD3CE;padding-top:20px;font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6B6E6B;font-weight:600;padding-bottom:8px;">Where you stand in the framework</td></tr>
        <tr><td style="padding-bottom:24px;font-size:15px;line-height:1.6;color:#3F3F3D;font-family:system-ui,'Segoe UI',Helvetica,Arial,sans-serif;">${escapeHtml(positioning)}</td></tr>

        <!-- Section 7: CTA block -->
        <tr><td style="padding-bottom:16px;font-size:15px;line-height:1.55;color:#3F3F3D;font-family:system-ui,'Segoe UI',Helvetica,Arial,sans-serif;">${escapeHtml(ctaFraming)}</td></tr>
        <tr><td style="padding-bottom:32px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#0891B2;border-radius:8px;padding:13px 24px;">
              <a href="${BOOKING_URL}" style="display:block;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;font-family:system-ui,'Segoe UI',Helvetica,Arial,sans-serif;">${escapeHtml(buttonLabel)}</a>
            </td>
          </tr></table>
        </td></tr>

        <!-- Section 8: structured footer -->
        <tr><td style="border-top:1px solid #CDD3CE;padding-top:20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:13px;line-height:1.55;color:#6B6E6B;padding-bottom:4px;">You took the Research Conversion Index at voranta.co.</td></tr>
            <tr><td style="font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:13px;line-height:1.55;color:#6B6E6B;padding-bottom:12px;">Questions? Reply here or email evan@voranta.co.</td></tr>
            <tr><td style="font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:11px;color:#A8ACA8;">Voranta</td></tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { scoreAnswers, buildLeadText, buildVisitorText, buildVisitorHtml, buildVisitorSubject };
