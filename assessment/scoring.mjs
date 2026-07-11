import { questions, dimensions, archetypes } from './framework.mjs';

// MODEL: ONE question per dimension. The chosen option value (0,20,40,60,80,100)
// IS that dimension's /100 score directly. No per-dimension aggregation.
//
// The RCI total is a WEIGHTED mean of the five dimension values. Weights reflect
// leverage in the demand-research thesis: the upstream strategy pair carries the
// most weight (Point of View is the single largest lever), then the conversion and
// sensing dimensions, then the two more operational downstream dimensions.
const WEIGHTS = {
  pointOfView: 0.30,
  buyerResearchSensing: 0.20,
  conversionSurface: 0.20,
  trustAtCapture: 0.16,
  signalToSales: 0.14,
}; // sums to 1.00

// Archetype thresholds, on the /100-as-fraction scale (value/100 in 0..1):
//   upstreamHigh   : mean(pov, sensing) >= 0.70
//   downstreamHigh : mean(conv, trust, signal) >= 2/3 (with float epsilon)
// The epsilon is load-bearing: the all-60 (0.6) downstream cluster is fine, but a
// cluster like (1.0, 1.0, 0.0) computes its mean a hair BELOW 2/3 in floating
// point and would fail a bare >= 2/3. DOWNSTREAM_HIGH_FRAC subtracts 1e-9 so that
// exact-2/3 boundary classifies as high.
const UPSTREAM_HIGH_FRAC = 0.70;
const DOWNSTREAM_HIGH_FRAC = 2 / 3 - 1e-9;

// Band cut on the /100 scale: high >= 75. Drives the focus tier (edge vs deficit).
const HIGH_BAND_100 = 75;

// RESULT SHAPE (consumed by the frontend scorecard + the email renderer):
//   score            RCI on a 0-100 scale. round(weighted sum of the five
//                    dimension values), where each dimension value is already
//                    0..100. Rounded ONCE from the full-precision weighted sum, so
//                    the headline does not always equal a naive average of the
//                    displayed dimension /100s. That is intended, not a bug.
//   dimensionScores  { <dimKey>: <0-100> } the chosen option value per dimension.
//                    This is what display and email read.
//   dimensionRaw     { <dimKey>: <0-100> } identical to dimensionScores. Kept so
//                    consumers/tests expecting a `dimensionRaw` field still work;
//                    with one item per dimension there is no separate raw scale.
//   archetype        { key, label, blurb }.
//   focus            { dimension, label, tier:'deficit'|'edge', blurb } or null
//                    (null only when all five dimension /100s are exactly equal).
//   evenTier         'high' | 'low' for the all-equal (null-focus) state, else null.
//   answers          [{ questionId, choiceIndex, points }] echo of the input.
export function scoreAnswers(answers) {
  const detailed = answers.map((a) => {
    const q = questions.find((x) => x.id === a.questionId);
    return { questionId: a.questionId, choiceIndex: a.choiceIndex, points: q.options[a.choiceIndex].points, dimension: q.dimension };
  });

  // One question per dimension: the chosen option value is the dimension /100.
  const dimensionScores = {};
  for (const d of detailed) dimensionScores[d.dimension] = d.points;

  // dimensionRaw kept identical for any consumer that reads it.
  const dimensionRaw = { ...dimensionScores };

  // RCI /100: weighted sum of the five dimension values (each already 0..100),
  // rounded ONCE from full precision.
  let weighted = 0;
  for (const dim of dimensions) weighted += WEIGHTS[dim.key] * dimensionScores[dim.key];
  const score = Math.round(weighted);

  const focus = pickFocus(dimensionScores);
  return {
    score,
    dimensionScores,
    dimensionRaw,
    archetype: pickArchetype(dimensionScores),
    focus, // band-adaptive focus, or null only when all five dimension /100s are exactly equal
    evenTier: focus === null ? evenTier(dimensionScores) : null, // 'high' | 'low' for the all-equal state, else null
    answers: detailed.map(({ questionId, choiceIndex, points: p }) => ({ questionId, choiceIndex, points: p })),
  };
}

// Archetype is DIMENSION-DEFINED, not score-defined, so it can never contradict
// the #1 gap (the lowest dimension). A clean 2x2 over two clusters, each a mean of
// /100-as-fraction values:
//   - UPSTREAM (strategy): mean(pointOfView, buyerResearchSensing) >= 0.70.
//   - DOWNSTREAM (execution): mean(conversionSurface, trustAtCapture,
//     signalToSales) >= 2/3 (with the float epsilon).
//
//                       downstream low        downstream high
//   upstream high           Publisher              Authority
//   upstream low            Renter                 Operator
//
// Coherence: Authority and Publisher require upstreamHigh (an upstream floor), so a
// floored upstream can never read Authority/Publisher; Renter and Operator require
// upstream low (an upstream ceiling), so a maxed upstream can never read
// Renter/Operator. Every (upstream, downstream) pair lands in exactly one cell.
function pickArchetype(dimensionScores) {
  const upstreamMean = (dimensionScores.pointOfView / 100 + dimensionScores.buyerResearchSensing / 100) / 2;
  const downstreamMean = (dimensionScores.conversionSurface / 100 + dimensionScores.trustAtCapture / 100 + dimensionScores.signalToSales / 100) / 3;
  const upstreamHigh = upstreamMean >= UPSTREAM_HIGH_FRAC;
  const downstreamHigh = downstreamMean >= DOWNSTREAM_HIGH_FRAC;
  let a;
  if (upstreamHigh) a = downstreamHigh ? archetypes.authority : archetypes.publisher;
  else a = downstreamHigh ? archetypes.operator : archetypes.renter;
  return { key: a.key, label: a.label, blurb: a.blurb };
}

// FOCUS is the single dimension this taker should act on next. It is ALWAYS
// surfaced unless all five dimensions are exactly equal, and it is framed by its
// own band so the recommendation is honest rather than suppressed.
//
// Mechanism:
//   - Lowest UNWEIGHTED dimension /100 wins. The scoring WEIGHTS do NOT affect gap
//     selection: the gap is the weakest real capability, not the weakest weighted
//     contribution. Ties break by the demand-funnel order of the `dimensions`
//     array (Point of View -> Buyer Research Sensing -> Conversion Surface ->
//     Trust at Capture -> Signal to Sales): when several dimensions share the
//     lowest score we surface the EARLIEST funnel stage, because downstream fixes
//     depend on upstream ones. This is a documented sequence, not an invented weight.
//   - tier is set by the focus dimension's own band, using the same HIGH = 75 cut
//     as the scorecard:
//       focus /100 <  75 (low/mid)  -> tier 'deficit'  ("a gap to close")
//       focus /100 >= 75 (high)     -> tier 'edge'     ("your next lever to extend")
//     A high-band lowest dimension is therefore an EDGE, never a deficit, so it
//     never contradicts a strong archetype.
//   - null is returned ONLY when min === max (all five exactly equal). That is the
//     sole true no-focus state. Even then the result converts: the caller sets
//     evenTier so copy can branch.
//
// Return shape: { dimension, label, tier: 'deficit'|'edge', blurb } or null.
function pickFocus(dimensionScores) {
  const values = dimensions.map((dim) => dimensionScores[dim.key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return null; // all five exactly equal: the only no-focus state

  let lowest = null;
  for (const dim of dimensions) {
    const value = dimensionScores[dim.key];
    // strict < keeps the FIRST (earliest funnel-stage) dimension among ties
    if (lowest === null || value < lowest.value) lowest = { dim, value };
  }
  const tier = lowest.value >= HIGH_BAND_100 ? 'edge' : 'deficit';
  const blurb = tier === 'edge' ? lowest.dim.edge : lowest.dim.gap;
  return { dimension: lowest.dim.key, label: lowest.dim.label, tier, blurb };
}

// For the all-equal (no-focus) state, report whether the taker is evenly STRONG
// or evenly WEAK so copy can stay honest. Same HIGH = 75 cut as the focus tier.
function evenTier(dimensionScores) {
  return dimensionScores[dimensions[0].key] >= HIGH_BAND_100 ? 'high' : 'low';
}
