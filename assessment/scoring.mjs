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

  return {
    score,
    points,
    dimensionScores,
    archetype: pickArchetype(score, dimensionScores),
    gap: pickGap(dimensionScores),
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

// A gap is the single genuine weak point. Two cases produce no gap:
//   (1) all dimensions tie (min === max): no dimension lags the others.
//   (2) the lowest dimension is already in the HIGH band (min >= 3): a strong
//       dimension may never be labeled "your gap". The high-band floor is >= 3,
//       consistent with the scorecard banding (raw >= 3 is "high"). This prevents
//       e.g. pointOfView = 3, others = 4 from flagging a strong POV as the gap
//       and contradicting the Authority result. Case (1) is not subsumed by
//       case (2): all-tied-mid (2,2,2,2) and all-tied-low (0,0,0,0) still need it.
// Return shape: { dimension, label, blurb } for a genuine gap, or null when there
// is no single lagging dimension. Consumers MUST handle null.
function pickGap(dimensionScores) {
  const values = dimensions.map((dim) => dimensionScores[dim.key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max || min >= 3) return null; // tied, or lowest is already high-band

  let lowest = null;
  for (const dim of dimensions) {
    const value = dimensionScores[dim.key];
    if (lowest === null || value < lowest.value) lowest = { dimension: dim.key, label: dim.label, blurb: dim.gap, value };
  }
  return { dimension: lowest.dimension, label: lowest.label, blurb: lowest.blurb };
}
