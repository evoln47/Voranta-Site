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
    'You are renting the lens buyers research against. A named framework the market associates with you makes that lens yours.',
    'Your point of view is strong, and it is your sharpest lever. Naming and structuring it into a framework buyers research against turns a strength into a category position competitors cannot copy.'],
  ['conversionSurface', 'Conversion Surface',
    'You earn attention, but your primary call to action leaks it. A lower-friction, relevant path and real conversion measurement turn earned attention into identifiable pipeline.',
    'Your conversion surface already works. The next lever is precision: tightening the path and the measurement so every point of earned attention is accounted for as identifiable pipeline.'],
  ['trustAtCapture', 'Trust at Capture',
    'Your capture taxes trust instead of earning it. When the buyer receives something tailored to their situation the moment they raise their hand, the exchange pays for itself.',
    'Capture already earns trust rather than taxing it. The next lever is to make the moment of exchange so tailored that raising a hand feels like the start of the engagement, not a toll.'],
  ['signalToSales', 'Signal to Sales',
    'Your reps walk in cold. A hand-off that routes a prioritized, account-specific brief to the right rep in time to prep means the first call starts on the gap, not on discovery.',
    'Your hand-off already arms reps with context. The next lever is sharpening the brief and the routing so the first call opens on the account-specific gap every time, not just most of the time.'],
];

const ARCHETYPES = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Your buyer's research runs on someone else's framework. The attention you do earn leaks before it becomes pipeline." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You earn the read, not the lead. Strong point of view, but the conversion path, the value at capture, or the hand-off to sales is letting it slip.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'Your demand engine is broadly strong, but you compete on the same lens as everyone else. No framework of your own.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own a framework buyers research against, and your demand engine is broadly strong behind it. Lock this to your category before a competitor builds the same advantage.' },
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

// Provisional framing labels (final user-facing copy comes from conversion-copywriter).
// tier 'deficit' = a gap to close; tier 'edge' = the next lever to extend.
function focusLabel(focus) {
  if (!focus) return 'Your focus';
  return focus.tier === 'edge' ? 'Your next lever' : 'Your #1 gap';
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
    return f.tier === 'edge' ? '   (your next lever)' : '   (your #1 gap)';
  };
  const focusBlock = f
    ? [`${focusLabel(f)}: ${f.label}`, f.blurb]
    : result.evenTier === 'high'
      ? ['Strong and even', 'No single dimension lags. Press this advantage before a competitor builds the same one.']
      : ['Even across the board', 'No single weak link, which means the opportunity is systemic. The whole build can move together.'];
  const cta = f && f.tier === 'edge'
    ? `Book a call to extend your lead: ${BOOKING_URL}`
    : f
      ? `Book a call to close the gap: ${BOOKING_URL}`
      : `Book a call to talk through your result: ${BOOKING_URL}`;
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
      ? ` <span style="color:#0891B2;font-weight:600;">${f.tier === 'edge' ? 'next lever' : 'your gap'}</span>`
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
            : result.evenTier === 'high' ? 'Strong and even' : 'Even across the board';
          const body = f
            ? escapeHtml(f.blurb)
            : result.evenTier === 'high'
              ? 'No single dimension lags. Press this advantage before a competitor builds the same one.'
              : 'No single weak link, which means the opportunity is systemic. The whole build can move together.';
          return `<tr><td style="border-top:1px solid #D2D8D3;padding:20px 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0891B2;font-weight:600;">${headLabel}</td></tr>
        <tr><td style="padding-bottom:26px;font-size:15px;line-height:1.55;color:#3A3A38;">${body}</td></tr>`;
        })()}

        <tr><td style="padding-bottom:30px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#0891B2;border-radius:8px;">
              <a href="${BOOKING_URL}" style="display:inline-block;padding:13px 24px;color:#ECF1ED;font-size:15px;font-weight:600;text-decoration:none;">${f && f.tier === 'edge' ? 'Book a call to extend your lead' : f ? 'Book a call to close the gap' : 'Book a call to talk through your result'}</a>
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
