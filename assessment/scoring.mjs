import { questions, dimensions, archetypes } from './framework.mjs';

const MAX_POINTS = questions.length * 2; // 16

export function scoreAnswers(answers) {
  const detailed = answers.map((a) => {
    const q = questions.find((x) => x.id === a.questionId);
    return { questionId: a.questionId, choiceIndex: a.choiceIndex, points: q.options[a.choiceIndex].points, dimension: q.dimension };
  });

  const points = detailed.reduce((sum, d) => sum + d.points, 0);
  const score = Math.round((points / MAX_POINTS) * 100);

  const dimensionScores = {};
  for (const dim of dimensions) {
    dimensionScores[dim.key] = detailed.filter((d) => d.dimension === dim.key).reduce((sum, d) => sum + d.points, 0);
  }

  const focus = pickFocus(dimensionScores);
  return {
    score,
    points,
    dimensionScores,
    archetype: pickArchetype(score, dimensionScores),
    focus, // band-adaptive focus, or null only when all four dimensions are exactly equal
    evenTier: focus === null ? evenTier(dimensionScores) : null, // 'high' | 'low' for the all-equal state, else null
    answers: detailed.map(({ questionId, choiceIndex, points: p }) => ({ questionId, choiceIndex, points: p })),
  };
}

// Archetype is DIMENSION-DEFINED, not score-defined, so it can never contradict
// the #1 gap (which is the lowest dimension). A clean 2x2 over two axes:
//   - Point of View (one dimension, 0-4): high = >= 3.
//   - The conversion/trust/signal cluster (three dimensions, 0-12): high = >= 8
//     (two-thirds of the range, a clearly strong cluster).
// This structurally satisfies the required gates: Authority requires POV high
// (a POV floor, so a floored POV can never read Authority) and Renter requires
// POV low (a POV ceiling, so a maxed POV can never read Renter). Every (POV,
// cluster) pair lands in exactly one quadrant, so coverage is total.
//
//                  cluster low (<8)   cluster high (>=8)
//   POV high (>=3)   Publisher          Authority
//   POV low  (<3)    Renter             Operator
//
// Total score is still computed and displayed; it just no longer gates archetype.
function pickArchetype(score, dimensionScores) {
  const povHigh = dimensionScores.pointOfView >= 3;
  const cluster = dimensionScores.conversionSurface + dimensionScores.trustAtCapture + dimensionScores.signalToSales;
  const clusterHigh = cluster >= 8;
  let a;
  if (povHigh) a = clusterHigh ? archetypes.authority : archetypes.publisher;
  else a = clusterHigh ? archetypes.operator : archetypes.renter;
  return { key: a.key, label: a.label, blurb: a.blurb };
}

// FOCUS is the single dimension this taker should act on next. It is ALWAYS
// surfaced unless all four dimensions are exactly equal, and it is framed by its
// own band so the recommendation is honest rather than suppressed.
//
// Mechanism (this replaces the prior "suppress the gap when the lowest is high"
// rule, which produced a common false no-gap state):
//   - Lowest dimension wins. Ties break by the demand-funnel order of the
//     `dimensions` array (Point of View -> Conversion Surface -> Trust at Capture
//     -> Signal to Sales): when several dimensions share the lowest score we
//     surface the EARLIEST funnel stage, because downstream fixes depend on
//     upstream ones. This is a documented sequence, not an invented weight.
//   - tier is set by the focus dimension's own band, using the same HIGH = 3 cut
//     as the scorecard (raw >= 3 is "high"):
//       focus score <  3 (low/mid)  -> tier 'deficit'  ("a gap to close")
//       focus score >= 3 (high)     -> tier 'edge'     ("your next lever to extend")
//     A high-band lowest dimension is therefore an EDGE, never a deficit, so it
//     no longer contradicts a strong archetype (coherence rule R1'/R2).
//   - null is returned ONLY when min === max (all four exactly equal). That is
//     the sole true no-focus state. Even then the result converts: the caller
//     sets evenTier so copy can branch (even-high = press the advantage,
//     even-low/mid = no single weak link, sequence the whole build).
//
// Return shape: { dimension, label, tier: 'deficit'|'edge', blurb } or null.
// Consumers MUST handle null (the all-equal state).
function pickFocus(dimensionScores) {
  const values = dimensions.map((dim) => dimensionScores[dim.key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return null; // all four exactly equal: the only no-focus state

  let lowest = null;
  for (const dim of dimensions) {
    const value = dimensionScores[dim.key];
    // strict < keeps the FIRST (earliest funnel-stage) dimension among ties
    if (lowest === null || value < lowest.value) lowest = { dim, value };
  }
  const tier = lowest.value >= 3 ? 'edge' : 'deficit';
  // Band-adaptive blurb: edge framing for a high-band focus, deficit framing
  // otherwise. This is what makes R1' hold at the CONTENT level, not just the tier.
  const blurb = tier === 'edge' ? lowest.dim.edge : lowest.dim.gap;
  return { dimension: lowest.dim.key, label: lowest.dim.label, tier, blurb };
}

// For the all-equal (no-focus) state, report whether the taker is evenly STRONG
// or evenly WEAK so copy can stay honest. Same HIGH = 3 cut as the focus tier.
function evenTier(dimensionScores) {
  return dimensionScores[dimensions[0].key] >= 3 ? 'high' : 'low';
}
