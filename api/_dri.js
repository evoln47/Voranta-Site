// Demand Research Index data, server-side scoring, and email rendering.
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

// 3 questions per dimension, options 0/1/2 points. Mirrors framework.mjs.
const QUESTIONS = {
  pov1: { dimension: 'pointOfView', points: [0, 1, 2] },
  pov2: { dimension: 'pointOfView', points: [0, 1, 2] },
  pov3: { dimension: 'pointOfView', points: [0, 1, 2] },
  conv1: { dimension: 'conversionSurface', points: [0, 1, 2] },
  conv2: { dimension: 'conversionSurface', points: [0, 1, 2] },
  conv3: { dimension: 'conversionSurface', points: [0, 1, 2] },
  trust1: { dimension: 'trustAtCapture', points: [0, 1, 2] },
  trust2: { dimension: 'trustAtCapture', points: [0, 1, 2] },
  trust3: { dimension: 'trustAtCapture', points: [0, 1, 2] },
  signal1: { dimension: 'signalToSales', points: [0, 1, 2] },
  signal2: { dimension: 'signalToSales', points: [0, 1, 2] },
  signal3: { dimension: 'signalToSales', points: [0, 1, 2] },
};

// maxPerDim = 3 questions * 2 = 6. Per-dimension raw runs 0..6.
const MAX_PER_DIM = 6;
// Fraction thresholds mirror assessment/scoring.mjs. The EXEC epsilon is
// load-bearing: the all-strong exec cluster mean lands a hair below 2/3 in
// floating point and must still classify high.
const POV_HIGH_FRAC = 0.75;
const EXEC_HIGH_FRAC = 2 / 3 - 1e-9;
const HIGH_BAND_100 = 75; // /100 band cut: high = >= 75.

// [key, label, gap blurb, edge blurb] in the demand-funnel order ties break by.
// gap = deficit framing (low/mid focus); edge = opportunity framing (high focus).
// Mirrors assessment/framework.mjs dimensions[] exactly. Keep in sync.
const DIMENSIONS = [
  ['pointOfView', 'Point of View',
    "You are renting the lens buyers research against. Every piece of content you publish builds authority for a framework someone else named. A proprietary, opinionated framework the market associates with your brand makes that lens yours and turns competitors' positioning pressure into evidence for your category.",
    'Your point of view is your sharpest commercial asset. Buyers are already finding and using it. The next lever is structuring it into a named, opinionated framework the market associates with your brand. That move converts a content strength into a category position competitors cannot replicate by outspending you.'],
  ['conversionSurface', 'Conversion Surface',
    'You earn attention but the primary action you ask for leaks it. Buyers who would have converted step off the path before you can identify them. A lower-friction, specifically relevant next step tied to real conversion measurement closes that gap and turns earned attention into attributable pipeline.',
    'Your conversion surface already works. Buyers who engage are converting to identifiable contacts at a measurable rate. The next lever is precision: sharper paths and tighter measurement so every point of earned attention becomes attributable pipeline, not just most of it.'],
  ['trustAtCapture', 'Trust at Capture',
    'What you ask for and what you give in return are out of balance. Buyers tolerate the exchange rather than value it. When the first thing a buyer receives is a diagnosis tailored to their specific situation, the act of raising a hand becomes the beginning of the engagement rather than the price of admission.',
    'Capture already earns trust. Buyers get real value at the moment of exchange and the hand-raise pays for itself. The next lever is specificity: making what buyers receive so precisely calibrated to their situation that the first interaction positions every subsequent touchpoint as a continuation, not a follow-up.'],
  ['signalToSales', 'Signal to Sales',
    'Your reps start from scratch on every first call. A hand-off that delivers a prioritized, account-specific brief to the right rep before they dial means the first call opens on the actual gap in the account, not on introductory discovery.',
    'Your hand-off already gives reps meaningful context before the first call. The next lever is sharpening the brief and the routing so every rep opens every call on the account-specific gap, not just when the system fires cleanly.'],
];

const ARCHETYPES = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Your content reaches buyers who then research the problem using someone else's framework. The lead goes to whoever owns that lens, and right now that is not you. Owning the framework the market researches against is what turns your content into pipeline you can claim." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You have built a genuine point of view and buyers read it. The leak is what happens next. The conversion path, the value at capture, or the hand-off to sales is not closing the gap between earned attention and identifiable pipeline.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'You have built a broadly strong demand engine. What it is missing is the lens. You compete on a framework someone else defined, which means a well-resourced rival can outspend you on the category point of view you are currently renting.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own the lens buyers use to research the problem, and the rest of your demand engine is broadly strong. That combination is hard to build and easy to copy once it is visible. The question is how quickly you can extend the lead before a rival reverse-engineers it.' },
};

// Re-derive the full result from answers. Mirrors assessment/scoring.mjs.
// Returns null if the submission is not a complete, valid set of answers.
//
// RESULT SHAPE (mirrors assessment/scoring.mjs scoreAnswers):
//   score            DRI 0-100, round(mean(dimFrac)*100), rounded ONCE from
//                    full-precision fractions (the four displayed dimension /100s
//                    do not always average to this; that is intended).
//   dimensionScores  { <dimKey>: <0-100> } per-dimension /100 for display/email.
//   dimensionRaw     { <dimKey>: <0-6> } raw points per dimension.
//   points           total raw points across all 12 questions (0..24).
//   archetype, focus, evenTier as before.
function scoreAnswers(answers) {
  if (!Array.isArray(answers)) return null;
  const dimensionRaw = { pointOfView: 0, conversionSurface: 0, trustAtCapture: 0, signalToSales: 0 };
  let points = 0;

  for (const id of Object.keys(QUESTIONS)) {
    const q = QUESTIONS[id];
    const a = answers.find((x) => x && x.questionId === id);
    if (!a) return null; // every question must be answered
    const idx = a.choiceIndex;
    if (!Number.isInteger(idx) || idx < 0 || idx >= q.points.length) return null;
    const p = q.points[idx];
    points += p;
    dimensionRaw[q.dimension] += p;
  }

  // Full-precision fractions per dimension, then /100 display scores.
  const dimFrac = {
    pointOfView: dimensionRaw.pointOfView / MAX_PER_DIM,
    conversionSurface: dimensionRaw.conversionSurface / MAX_PER_DIM,
    trustAtCapture: dimensionRaw.trustAtCapture / MAX_PER_DIM,
    signalToSales: dimensionRaw.signalToSales / MAX_PER_DIM,
  };
  const dimensionScores = {
    pointOfView: Math.round(dimFrac.pointOfView * 100),
    conversionSurface: Math.round(dimFrac.conversionSurface * 100),
    trustAtCapture: Math.round(dimFrac.trustAtCapture * 100),
    signalToSales: Math.round(dimFrac.signalToSales * 100),
  };

  // DRI /100: mean of the four full-precision fractions, rounded ONCE. Same
  // operation order as assessment/scoring.mjs so float parity holds at .5 edges.
  const meanFrac = (dimFrac.pointOfView + dimFrac.conversionSurface + dimFrac.trustAtCapture + dimFrac.signalToSales) / 4;
  const score = Math.round(meanFrac * 100);

  // Archetype is DIMENSION-DEFINED, not score-defined, so it can never contradict
  // the #1 gap (the lowest dimension). A clean 2x2 over two FRACTION axes:
  //   - Point of View: high = povFrac >= 0.75.
  //   - The conversion/trust/signal EXECUTION cluster: high = mean of the three
  //     fractions >= 2/3 (with the float epsilon).
  // This satisfies the required gates: Authority requires POV high (a POV floor)
  // and Renter requires POV low (a POV ceiling). Mirrors assessment/scoring.mjs
  // pickArchetype() exactly. Keep in sync.
  //
  //                  exec low (<2/3)    exec high (>=2/3)
  //   POV high (>=.75)  Publisher          Authority
  //   POV low  (<.75)   Renter             Operator
  const povHigh = dimFrac.pointOfView >= POV_HIGH_FRAC;
  const execMean = (dimFrac.conversionSurface + dimFrac.trustAtCapture + dimFrac.signalToSales) / 3;
  const execHigh = execMean >= EXEC_HIGH_FRAC;
  let archetype;
  if (povHigh) archetype = execHigh ? ARCHETYPES.authority : ARCHETYPES.publisher;
  else archetype = execHigh ? ARCHETYPES.operator : ARCHETYPES.renter;

  // FOCUS is the single dimension to act on next, ALWAYS surfaced unless all four
  // dimensions are exactly equal. Lowest wins; ties break by DIMENSIONS order (the
  // demand-funnel sequence). tier is set by the focus dimension's own band using
  // the same HIGH = 75 cut as band() below: < 75 -> 'deficit' (gap to close),
  // >= 75 -> 'edge' (next lever to extend). A high-band lowest is an edge, never a
  // deficit, so it never contradicts a strong archetype. null only when all four
  // are equal (the sole no-focus state); evenTier then reports high vs low so the
  // copy stays honest. Mirrors assessment/scoring.mjs pickFocus()/evenTier()
  // exactly. Keep in sync. focus is { dimension, label, tier, blurb } or null.
  // dimensionScores here are /100, so the comparisons run on the /100 scale.
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
    points,
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
  publisher: 'You have built a real point of view. The leak is downstream. Here is your full breakdown.',
  operator:  'Your demand engine is broadly strong. What it is missing is a lens you own. Here is your full breakdown.',
  authority: 'You hold the position. The question is how fast you can extend it before a rival catches up. Here is your full breakdown.',
};

// LEAD_IN: one sentence after archetype label, before archetype.blurb.
// Interpolated at render time with result.score.
const LEAD_IN = {
  renter:    (score) => `A score of ${score} places you in the largest group of B2B software marketing teams: reaching buyers who then research the problem on someone else's terms.`,
  publisher: (score) => `A score of ${score} reflects a real content asset with a gap in what comes after the read.`,
  operator:  (score) => `A score of ${score} reflects a broadly capable demand engine that competes on borrowed authority.`,
  authority: (score) => `A score of ${score} reflects a demand engine with a genuine structural advantage over most of your peers.`,
};

// DIMENSION_FIRST_SENTENCE: keyed by dimension key, gap (low/mid) and edge (high).
const DIMENSION_FIRST_SENTENCE = {
  pointOfView:       { gap: 'You are renting the lens buyers research against.',    edge: 'Your point of view is your sharpest commercial asset.' },
  conversionSurface: { gap: 'You earn attention but the primary action you ask for leaks it.', edge: 'Your conversion surface already works.' },
  trustAtCapture:    { gap: 'What you ask for and what you give in return are out of balance.', edge: 'Capture already earns trust.' },
  signalToSales:     { gap: 'Your reps start from scratch on every first call.',    edge: 'Your hand-off already gives reps meaningful context before the first call.' },
};

// POSITIONING: one paragraph per archetype. evenLow uses renter, evenHigh uses authority.
// These paragraphs are cluster-silent for renter, operator, and authority per spec.
const POSITIONING = {
  renter:    'The Authority position requires two things: a point of view the market names and researches against, and a demand engine that converts and hands off that interest reliably. Your result shows open distance on both axes. That is not an unusual place to be. Most B2B software marketing teams compete on borrowed frameworks and measure pipeline loosely, if at all. What separates teams that close the gap is sequencing: they build the lens before they build the engine, because a well-designed conversion surface amplifies a proprietary framework, while the same surface running on a rented framework just sends buyers back to the framework\'s owner.',
  publisher: 'You hold the harder of the two axes to build. A proprietary point of view the market associates with your brand cannot be bought quickly or replicated by outspending you. What separates The Publisher from The Authority is not the lens: it is what the lens connects to downstream. The strongest Publisher-to-Authority moves share a pattern: the same framework that earns the read becomes the mechanism that qualifies the hand-raise and briefs the rep. The point of view stops being a content asset and starts being the conversion architecture.',
  operator:  'You have built the downstream infrastructure that most teams lack. Your demand engine is working at a level where adding a proprietary framework would compound immediately, because you have the machinery to convert the authority it generates. The risk is not your engine: it is that a well-funded competitor builds the framework first and your engine starts feeding their category. The Operator-to-Authority move is the most direct path in the framework: one axis to close, with the other already in place to amplify it.',
  authority: 'You hold both axes. That is a structural position most teams in your category do not have and cannot acquire quickly. The pattern among teams that sustain it is aggressive deepening, not coasting: they make the framework harder to reverse-engineer by building proprietary research, named constructs, and published methodology that take years to replicate. The risk is not a rival outperforming you on execution. It is a rival publishing a credible competing framework before you have locked the category\'s vocabulary.',
};

// CTA_FRAMING: sentence before the booking button, keyed on archetype key.
// evenHigh uses authority, evenLow uses renter (same as POSITIONING key).
const CTA_FRAMING = {
  renter:    'Your score shows where the build starts. A 30 minute call with Voranta maps the sequence so you are not rebuilding in the wrong order.',
  publisher: 'The point of view is the hard part, and you have it. A 30 minute call with Voranta identifies the specific downstream gap costing you the pipeline your content has already earned.',
  operator:  'Your demand engine is ready to compound a framework you own. A 30 minute call with Voranta scopes what that framework looks like for your category and how fast you can move.',
  authority: 'You hold the position. A 30 minute call with Voranta identifies the specific move that makes it structurally harder to challenge before a rival attempts it.',
};

// Returns the email subject line for the visitor email.
// NOTE: api/lead.js:115 still builds the subject inline with the old format.
// That line must be updated to call buildVisitorSubject(result) for this subject
// to ship. That one-line wiring change is in api/lead.js, outside the edit scope
// for this task.
function buildVisitorSubject(result) {
  return `Your Demand Research Index: ${result.score}/100. You are ${result.archetype.label}.`;
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
    'New Demand Research Index lead',
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
    priorityBody = 'All four dimensions score in the high band. That is a real position. The priority now is to extend the lead before a competitor reverse-engineers it.';
  } else {
    priorityLabel = 'A systemic opportunity';
    priorityBody = 'No single dimension drags the others down, which means there is no one fix to isolate. The opportunity is to sequence the whole build deliberately. The call scopes that sequence.';
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
    'You took the Demand Research Index at voranta.co. Reply to this email and it reaches us directly.',
  ].join('\n');
}

function buildVisitorHtml(result) {
  const ds = result.dimensionScores;
  const f = result.focus;
  const archetypeKey = result.archetype.key;

  // Section 4: four dimension rows with /100 score, band, first-sentence read, and score bar.
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
    priorityBody = 'All four dimensions score in the high band. That is a real position. The priority now is to extend the lead before a competitor reverse-engineers it.';
  } else {
    priorityLabel = 'A systemic opportunity';
    priorityBody = 'No single dimension drags the others down, which means there is no one fix to isolate. The opportunity is to sequence the whole build deliberately. The call scopes that sequence.';
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
            <tr><td style="font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0891B2;font-weight:600;padding-bottom:12px;">Demand Research Index</td></tr>
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
            <tr><td style="font-family:ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:13px;line-height:1.55;color:#6B6E6B;padding-bottom:4px;">You took the Demand Research Index at voranta.co.</td></tr>
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
