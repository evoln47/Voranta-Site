import { questions, dimensions, archetypes } from './framework.mjs';

// Granularity: 3 questions per dimension, options 0/1/2 points.
// maxPerDim = 3 * 2 = 6. Each dimension's raw points run 0..6.
const QUESTIONS_PER_DIM = 3;
const MAX_PER_DIM = QUESTIONS_PER_DIM * 2; // 6

// Fraction thresholds (granularity-independent, classification-preserving):
//   POV high  : dimFrac.pov  >= 0.75            -> raw >= 5 (4.5 is unreachable)
//   exec high : mean(conv,trust,signal fracs) >= 2/3 (with epsilon for float)
// The epsilon is load-bearing: the all-4s exec cluster computes the mean as
// (2/3 + 2/3 + 2/3) in floating point, which lands a hair BELOW 2/3 and would
// fail a bare >= comparison. EXEC_HIGH_FRAC subtracts 1e-9 so that boundary
// classifies as high.
const POV_HIGH_FRAC = 0.75;
const EXEC_HIGH_FRAC = 2 / 3 - 1e-9;

// Band cuts on the /100 scale: low < 50, mid 50..<75, high >= 75.
const HIGH_BAND_100 = 75;

// RESULT SHAPE (consumed by the frontend scorecard + the email renderer):
//   score            DRI on a 0-100 scale. round(mean(dimFrac)*100), computed
//                    from FULL-PRECISION fractions and rounded ONCE. Because of
//                    that single rounding, the four displayed dimension /100s do
//                    NOT always arithmetically average to this headline number.
//                    That is intended, not a bug.
//   dimensionScores  { <dimKey>: <0-100> } per-dimension score on the /100 scale,
//                    round(dimFrac * 100). This is what display and email read.
//   dimensionRaw     { <dimKey>: <0-6> } raw points per dimension. Kept for tests
//                    and any consumer that needs the underlying count.
//   points           total raw points across all 12 questions (0..24).
//   archetype        { key, label, blurb }.
//   focus            { dimension, label, tier:'deficit'|'edge', blurb } or null
//                    (null only when all four dimension /100s are exactly equal).
//   evenTier         'high' | 'low' for the all-equal (null-focus) state, else null.
//   answers          [{ questionId, choiceIndex, points }] echo of the input.
export function scoreAnswers(answers) {
  const detailed = answers.map((a) => {
    const q = questions.find((x) => x.id === a.questionId);
    return { questionId: a.questionId, choiceIndex: a.choiceIndex, points: q.options[a.choiceIndex].points, dimension: q.dimension };
  });

  const points = detailed.reduce((sum, d) => sum + d.points, 0);

  // Raw points and full-precision fraction per dimension.
  const dimensionRaw = {};
  const dimFrac = {};
  for (const dim of dimensions) {
    const raw = detailed.filter((d) => d.dimension === dim.key).reduce((sum, d) => sum + d.points, 0);
    dimensionRaw[dim.key] = raw;
    dimFrac[dim.key] = raw / MAX_PER_DIM;
  }

  // Per-dimension /100 for display.
  const dimensionScores = {};
  for (const dim of dimensions) dimensionScores[dim.key] = Math.round(dimFrac[dim.key] * 100);

  // DRI /100: mean of the four FULL-PRECISION fractions, rounded ONCE at the end.
  const meanFrac = (dimFrac.pointOfView + dimFrac.conversionSurface + dimFrac.trustAtCapture + dimFrac.signalToSales) / 4;
  const score = Math.round(meanFrac * 100);

  const focus = pickFocus(dimensionScores);
  return {
    score,
    points,
    dimensionScores,
    dimensionRaw,
    archetype: pickArchetype(dimFrac),
    focus, // band-adaptive focus, or null only when all four dimension /100s are exactly equal
    evenTier: focus === null ? evenTier(dimensionScores) : null, // 'high' | 'low' for the all-equal state, else null
    answers: detailed.map(({ questionId, choiceIndex, points: p }) => ({ questionId, choiceIndex, points: p })),
  };
}

// Archetype is DIMENSION-DEFINED, not score-defined, so it can never contradict
// the #1 gap (which is the lowest dimension). A clean 2x2 over two axes, both
// expressed as granularity-independent FRACTION thresholds so the classification
// is preserved no matter how many questions back each dimension:
//   - Point of View (one dimension): high = povFrac >= 0.75.
//   - The conversion/trust/signal EXECUTION cluster: high = mean of the three
//     fractions >= 2/3 (clearly strong on the engine, with the float epsilon so
//     the all-strong cluster classifies high).
// This structurally satisfies the required gates: Authority requires POV high
// (a POV floor, so a floored POV can never read Authority) and Renter requires
// POV low (a POV ceiling, so a maxed POV can never read Renter). Every (POV,
// exec) pair lands in exactly one quadrant, so coverage is total.
//
//                  exec low (<2/3)    exec high (>=2/3)
//   POV high (>=.75)  Publisher          Authority
//   POV low  (<.75)   Renter             Operator
//
// Total score is still computed and displayed; it just no longer gates archetype.
function pickArchetype(dimFrac) {
  const povHigh = dimFrac.pointOfView >= POV_HIGH_FRAC;
  const execMean = (dimFrac.conversionSurface + dimFrac.trustAtCapture + dimFrac.signalToSales) / 3;
  const execHigh = execMean >= EXEC_HIGH_FRAC;
  let a;
  if (povHigh) a = execHigh ? archetypes.authority : archetypes.publisher;
  else a = execHigh ? archetypes.operator : archetypes.renter;
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
//   - tier is set by the focus dimension's own band, using the same HIGH = 75 cut
//     as the scorecard (/100 >= 75 is "high"):
//       focus /100 <  75 (low/mid)  -> tier 'deficit'  ("a gap to close")
//       focus /100 >= 75 (high)     -> tier 'edge'     ("your next lever to extend")
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
  const tier = lowest.value >= HIGH_BAND_100 ? 'edge' : 'deficit';
  // Band-adaptive blurb: edge framing for a high-band focus, deficit framing
  // otherwise. This is what makes R1' hold at the CONTENT level, not just the tier.
  const blurb = tier === 'edge' ? lowest.dim.edge : lowest.dim.gap;
  return { dimension: lowest.dim.key, label: lowest.dim.label, tier, blurb };
}

// For the all-equal (no-focus) state, report whether the taker is evenly STRONG
// or evenly WEAK so copy can stay honest. Same HIGH = 75 cut as the focus tier.
function evenTier(dimensionScores) {
  return dimensionScores[dimensions[0].key] >= HIGH_BAND_100 ? 'high' : 'low';
}
