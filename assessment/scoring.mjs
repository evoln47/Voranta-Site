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

function pickArchetype(score, dimensionScores) {
  let a;
  if (score < 40) a = archetypes.renter;
  else if (score >= 65) a = archetypes.authority;
  else a = dimensionScores.pointOfView >= dimensionScores.conversionSurface ? archetypes.publisher : archetypes.operator;
  return { key: a.key, label: a.label, blurb: a.blurb };
}

function pickGap(dimensionScores) {
  let lowest = null;
  for (const dim of dimensions) {
    const value = dimensionScores[dim.key];
    if (lowest === null || value < lowest.value) lowest = { dimension: dim.key, label: dim.label, blurb: dim.gap, value };
  }
  return { dimension: lowest.dimension, label: lowest.label, blurb: lowest.blurb };
}
