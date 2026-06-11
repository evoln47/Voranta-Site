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

// [key, label, gap blurb] in the order ties break for the #1 gap.
const DIMENSIONS = [
  ['pointOfView', 'Point of View', 'You are renting the lens buyers research against. A named framework the market associates with you makes that lens yours.'],
  ['conversionSurface', 'Conversion Surface', 'You earn attention, but your primary call to action leaks it. A lower-friction path and real conversion measurement turn earned attention into identifiable pipeline.'],
  ['trustAtCapture', 'Trust at Capture', 'Your capture taxes trust instead of earning it. When the buyer gets something they value the moment they raise their hand, the exchange pays for itself.'],
  ['signalToSales', 'Signal to Sales', 'Your reps walk in cold. When the hand-off routes a prioritized, account-specific brief to the right rep in time to prep, the first call starts on the gap, not on discovery.'],
];

const ARCHETYPES = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Your buyer's research runs on someone else's framework, and the attention you do earn leaks before it becomes pipeline." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You earn the read, not the lead. Strong point of view, but the conversion path, the value at capture, or the hand-off to sales is letting it slip.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'You convert attention and brief your reps well, but you compete on the same lens as everyone else. No framework of your own.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own a framework buyers research against, your capture earns the lead, and your hand-off briefs sales. Lock it to your category before a competitor builds the same advantage.' },
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

  // A gap only exists when one dimension is genuinely the weakest. When every
  // dimension ties (lowest === highest) there is no real gap, so gap is null
  // rather than the first array dimension (Point of View). Mirrors
  // assessment/scoring.mjs pickGap() exactly. Keep in sync. Return shape:
  // gap is { dimension, label, blurb } for a genuine gap, or null when tied.
  const dimValues = DIMENSIONS.map(([key]) => dimensionScores[key]);
  const dimMin = Math.min(...dimValues);
  const dimMax = Math.max(...dimValues);
  let gap = null;
  if (dimMin !== dimMax) {
    for (const [key, label, blurb] of DIMENSIONS) {
      if (gap === null || dimensionScores[key] < gap.value) gap = { dimension: key, label, blurb, value: dimensionScores[key] };
    }
    gap = { dimension: gap.dimension, label: gap.label, blurb: gap.blurb };
  }

  return {
    score,
    points,
    dimensionScores,
    archetype: { key: archetype.key, label: archetype.label, blurb: archetype.blurb },
    gap,
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

function buildLeadText(email, result) {
  const ds = result.dimensionScores;
  return [
    'New Demand Research Index lead',
    '',
    `Email: ${email}`,
    `Score: ${result.score}/100`,
    `Archetype: ${result.archetype.label}`,
    `#1 gap: ${result.gap ? result.gap.label : 'none (balanced profile)'}`,
    '',
    'Dimension scores (0-4):',
    ...DIMENSIONS.map(([key, label]) => `  ${label}: ${ds[key]}`),
  ].join('\n');
}

function buildVisitorText(result) {
  const ds = result.dimensionScores;
  return [
    'Your Demand Research Index',
    '',
    `Score: ${result.score}/100`,
    `Archetype: ${result.archetype.label}`,
    result.archetype.blurb,
    '',
    'Where you stand:',
    ...DIMENSIONS.map(([key, label]) => {
      const tag = result.gap && result.gap.dimension === key ? '   (your #1 gap)' : '';
      return `  ${label.padEnd(20)} ${band(ds[key])}${tag}`;
    }),
    '',
    ...(result.gap
      ? [`Your #1 gap: ${result.gap.label}`, result.gap.blurb]
      : ['No single gap', 'Your four dimensions score the same. No single one leads or lags.']),
    '',
    result.gap ? `Book a call to close the gap: ${BOOKING_URL}` : `Book a call to talk through your result: ${BOOKING_URL}`,
    '',
    'You took the Demand Research Index at voranta.co. Reply to this email and it reaches Evan directly.',
  ].join('\n');
}

function buildVisitorHtml(result) {
  const ds = result.dimensionScores;
  const rows = DIMENSIONS.map(([key, label]) => {
    const tag = result.gap && key === result.gap.dimension
      ? ' <span style="color:#0891B2;font-weight:600;">your gap</span>'
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

        ${result.gap
          ? `<tr><td style="border-top:1px solid #D2D8D3;padding:20px 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0891B2;font-weight:600;">Your #1 gap: ${escapeHtml(result.gap.label)}</td></tr>
        <tr><td style="padding-bottom:26px;font-size:15px;line-height:1.55;color:#3A3A38;">${escapeHtml(result.gap.blurb)}</td></tr>`
          : `<tr><td style="border-top:1px solid #D2D8D3;padding:20px 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0891B2;font-weight:600;">No single gap</td></tr>
        <tr><td style="padding-bottom:26px;font-size:15px;line-height:1.55;color:#3A3A38;">Your four dimensions score the same. No single one leads or lags.</td></tr>`}

        <tr><td style="padding-bottom:30px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#0891B2;border-radius:8px;">
              <a href="${BOOKING_URL}" style="display:inline-block;padding:13px 24px;color:#ECF1ED;font-size:15px;font-weight:600;text-decoration:none;">${result.gap ? 'Book a call to close the gap' : 'Book a call to talk through your result'}</a>
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
