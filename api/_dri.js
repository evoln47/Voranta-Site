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

const QUESTIONS = {
  pov1: { dimension: 'pointOfView', points: [0, 1, 2] },
  pov2: { dimension: 'pointOfView', points: [0, 1, 2] },
  conv1: { dimension: 'conversionSurface', points: [0, 1, 2] },
  conv2: { dimension: 'conversionSurface', points: [0, 1, 2] },
  trust1: { dimension: 'trustAtCapture', points: [0, 1, 2] },
  trust2: { dimension: 'trustAtCapture', points: [0, 1, 2] },
  signal1: { dimension: 'signalToSales', points: [0, 1, 2] },
  signal2: { dimension: 'signalToSales', points: [0, 1, 2] },
};

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
  renter: { key: 'renter', label: 'The Renter', blurb: "Your content reaches buyers who then research the problem using someone else's framework. The lead goes to whoever owns that lens, and right now that is not you. Owning the framework the market researches against is what turns your content into pipeline you can claim. The call is about how you get there." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You have built a genuine point of view and buyers read it. The leak is what happens next. The conversion path, the value at capture, or the hand-off to sales is not closing the gap between earned attention and identifiable pipeline.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'You have built a broadly strong demand engine. What it is missing is the lens. You compete on a framework someone else defined, which means a well-resourced rival can outspend you on the category point of view you are currently renting. The call is about making that lens yours before they do.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own the lens buyers use to research the problem, and the rest of your demand engine is broadly strong. That combination is hard to build and easy to copy once it is visible. The question is how quickly you can extend the lead before a rival reverse-engineers it.' },
};

// Re-derive the full result from answers. Mirrors assessment/scoring.mjs.
// Returns null if the submission is not a complete, valid set of answers.
function scoreAnswers(answers) {
  if (!Array.isArray(answers)) return null;
  const dimensionScores = { pointOfView: 0, conversionSurface: 0, trustAtCapture: 0, signalToSales: 0 };
  let points = 0;

  for (const id of Object.keys(QUESTIONS)) {
    const q = QUESTIONS[id];
    const a = answers.find((x) => x && x.questionId === id);
    if (!a) return null; // every question must be answered
    const idx = a.choiceIndex;
    if (!Number.isInteger(idx) || idx < 0 || idx >= q.points.length) return null;
    const p = q.points[idx];
    points += p;
    dimensionScores[q.dimension] += p;
  }

  const score = Math.round((points / 16) * 100);

  // Archetype is DIMENSION-DEFINED, not score-defined, so it can never contradict
  // the #1 gap (the lowest dimension). A clean 2x2 over two axes:
  //   - Point of View (one dimension, 0-4): high = >= 3.
  //   - The conversion/trust/signal cluster (three dimensions, 0-12): high = >= 8
  //     (two-thirds of the range, a clearly strong cluster).
  // This satisfies the required gates: Authority requires POV high (a POV floor)
  // and Renter requires POV low (a POV ceiling). Mirrors assessment/scoring.mjs
  // pickArchetype() exactly. Keep in sync.
  //
  //                  cluster low (<8)   cluster high (>=8)
  //   POV high (>=3)   Publisher          Authority
  //   POV low  (<3)    Renter             Operator
  const povHigh = dimensionScores.pointOfView >= 3;
  const cluster = dimensionScores.conversionSurface + dimensionScores.trustAtCapture + dimensionScores.signalToSales;
  const clusterHigh = cluster >= 8;
  let archetype;
  if (povHigh) archetype = clusterHigh ? ARCHETYPES.authority : ARCHETYPES.publisher;
  else archetype = clusterHigh ? ARCHETYPES.operator : ARCHETYPES.renter;

  // FOCUS is the single dimension to act on next, ALWAYS surfaced unless all four
  // dimensions are exactly equal. Lowest wins; ties break by DIMENSIONS order (the
  // demand-funnel sequence). tier is set by the focus dimension's own band using
  // the same HIGH = 3 cut as band() below: < 3 -> 'deficit' (gap to close),
  // >= 3 -> 'edge' (next lever to extend). A high-band lowest is an edge, never a
  // deficit, so it never contradicts a strong archetype. null only when all four
  // are equal (the sole no-focus state); evenTier then reports high vs low so the
  // copy stays honest. Mirrors assessment/scoring.mjs pickFocus()/evenTier()
  // exactly. Keep in sync. focus is { dimension, label, tier, blurb } or null.
  const dimValues = DIMENSIONS.map(([key]) => dimensionScores[key]);
  const dimMin = Math.min(...dimValues);
  const dimMax = Math.max(...dimValues);
  let focus = null;
  let evenTier = null;
  if (dimMin !== dimMax) {
    for (const [key, label, gapBlurb, edgeBlurb] of DIMENSIONS) {
      if (focus === null || dimensionScores[key] < focus.value) focus = { dimension: key, label, gapBlurb, edgeBlurb, value: dimensionScores[key] };
    }
    const tier = focus.value >= 3 ? 'edge' : 'deficit';
    const blurb = tier === 'edge' ? focus.edgeBlurb : focus.gapBlurb;
    focus = { dimension: focus.dimension, label: focus.label, tier, blurb };
  } else {
    evenTier = dimMin >= 3 ? 'high' : 'low';
  }

  return {
    score,
    points,
    dimensionScores,
    archetype: { key: archetype.key, label: archetype.label, blurb: archetype.blurb },
    focus,
    evenTier,
  };
}

function band(value) {
  if (value <= 1) return 'low';
  if (value === 2) return 'mid';
  return 'high';
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Section head labels for the focus block.
// tier 'deficit' = a gap to close; tier 'edge' = the next lever to extend.
// evenTier labels are inline in buildVisitorText/buildVisitorHtml.
function focusLabel(focus) {
  if (!focus) return 'Your focus';
  return focus.tier === 'edge' ? 'Your strongest next move' : "Where you're leaking";
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
    'Dimension scores (0-4):',
    ...DIMENSIONS.map(([key, label]) => `  ${label}: ${ds[key]}`),
  ].join('\n');
}

function buildVisitorText(result) {
  const ds = result.dimensionScores;
  const f = result.focus;
  const tagFor = (key) => {
    if (!f || f.dimension !== key) return '';
    return f.tier === 'edge' ? '   (next move)' : '   (your gap)';
  };
  const focusBlock = f
    ? [`${focusLabel(f)}: ${f.label}`, f.blurb]
    : result.evenTier === 'high'
      ? ['Strong across every dimension', 'All four dimensions score in the high band. That is a real position. The call is about extending the lead before a competitor reverse-engineers it.']
      : ['A systemic opportunity', 'No single dimension drags the others down, which means there is no one fix to isolate. The opportunity is to sequence the whole build deliberately. The call scopes that sequence.'];
  const cta = f && f.tier === 'edge'
    ? `Book a call to extend your lead: ${BOOKING_URL}`
    : f
      ? `Book a call to scope the fix: ${BOOKING_URL}`
      : `Book a call to map next steps: ${BOOKING_URL}`;
  return [
    'Your Demand Research Index',
    '',
    `Score: ${result.score}/100`,
    `Archetype: ${result.archetype.label}`,
    result.archetype.blurb,
    '',
    'Where you stand:',
    ...DIMENSIONS.map(([key, label]) => `  ${label.padEnd(20)} ${band(ds[key])}${tagFor(key)}`),
    '',
    ...focusBlock,
    '',
    cta,
    '',
    'You took the Demand Research Index at voranta.co. Reply to this email and it reaches Evan directly.',
  ].join('\n');
}

function buildVisitorHtml(result) {
  const ds = result.dimensionScores;
  const f = result.focus;
  const rows = DIMENSIONS.map(([key, label]) => {
    const tag = f && key === f.dimension
      ? ` <span style="color:#0891B2;font-weight:600;">${f.tier === 'edge' ? 'next move' : 'your gap'}</span>`
      : '';
    return `
              <tr><td style="padding:6px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:15px;color:#0A0908;">${escapeHtml(label)}</td>
                  <td align="right" style="font-size:14px;font-weight:600;color:#57564F;">${band(ds[key])}${tag}</td>
                </tr></table>
              </td></tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ECF1ED;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECF1ED;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0A0908;">
        <tr><td style="padding-bottom:10px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#0891B2;font-weight:600;">Demand Research Index</td></tr>
        <tr><td style="padding-bottom:6px;">
          <span style="font-size:56px;font-weight:600;line-height:1;">${escapeHtml(result.score)}</span>
          <span style="font-size:20px;color:#57564F;"> / 100</span>
        </td></tr>
        <tr><td style="padding:10px 0 4px;font-size:20px;font-weight:600;">${escapeHtml(result.archetype.label)}</td></tr>
        <tr><td style="padding-bottom:24px;font-size:15px;line-height:1.55;color:#3A3A38;">${escapeHtml(result.archetype.blurb)}</td></tr>

        <tr><td style="border-top:1px solid #D2D8D3;padding:20px 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#57564F;font-weight:600;">Where you stand</td></tr>
        ${rows}

        ${(() => {
          const headLabel = f
            ? `${focusLabel(f)}: ${escapeHtml(f.label)}`
            : result.evenTier === 'high' ? 'Strong across every dimension' : 'A systemic opportunity';
          const body = f
            ? escapeHtml(f.blurb)
            : result.evenTier === 'high'
              ? 'All four dimensions score in the high band. That is a real position. The call is about extending the lead before a competitor reverse-engineers it.'
              : 'No single dimension drags the others down, which means there is no one fix to isolate. The opportunity is to sequence the whole build deliberately. The call scopes that sequence.';
          return `<tr><td style="border-top:1px solid #D2D8D3;padding:20px 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0891B2;font-weight:600;">${headLabel}</td></tr>
        <tr><td style="padding-bottom:26px;font-size:15px;line-height:1.55;color:#3A3A38;">${body}</td></tr>`;
        })()}

        <tr><td style="padding-bottom:30px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#0891B2;border-radius:8px;">
              <a href="${BOOKING_URL}" style="display:inline-block;padding:13px 24px;color:#ECF1ED;font-size:15px;font-weight:600;text-decoration:none;">${f && f.tier === 'edge' ? 'Book a call to extend your lead' : f ? 'Book a call to scope the fix' : 'Book a call to map next steps'}</a>
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="border-top:1px solid #D2D8D3;padding-top:16px;font-size:13px;line-height:1.55;color:#57564F;">You took the Demand Research Index at voranta.co. Reply to this email and it reaches Evan directly.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { scoreAnswers, buildLeadText, buildVisitorText, buildVisitorHtml };
