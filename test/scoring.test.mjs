import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreAnswers } from '../assessment/scoring.mjs';

const IDS = ['pov1', 'pov2', 'conv1', 'conv2', 'trust1', 'trust2', 'signal1', 'signal2'];
const all = (choiceIndex) => IDS.map((id) => ({ questionId: id, choiceIndex }));
const from = (map) => IDS.map((id) => ({ questionId: id, choiceIndex: map[id] }));

test('all lowest answers -> Renter, score 0, gap null (all dimensions tied)', () => {
  const r = scoreAnswers(all(0));
  assert.equal(r.points, 0);
  assert.equal(r.score, 0);
  assert.equal(r.archetype.key, 'renter');
  assert.equal(r.gap, null);
});

test('all highest answers -> Authority, score 100', () => {
  const r = scoreAnswers(all(2));
  assert.equal(r.points, 16);
  assert.equal(r.score, 100);
  assert.equal(r.archetype.key, 'authority');
});

// All dimensions tied -> no genuine lowest -> gap is null. Previously this
// resolved to the first array dimension (Point of View) and falsely told an
// all-high Authority taker they were "renting the lens" they actually own.
test('all dimensions tied high -> Authority, gap is null (no false gap)', () => {
  const r = scoreAnswers(all(2)); // every dimension = 4, tied
  assert.equal(r.archetype.key, 'authority');
  assert.equal(r.score, 100);
  assert.equal(r.gap, null);
});

test('all dimensions tied mid -> gap is null', () => {
  const r = scoreAnswers(all(1)); // every dimension = 2, tied
  assert.equal(r.gap, null);
});

// A genuine single-lowest dimension still returns the correct non-null gap.
test('single lowest dimension -> non-null gap on that dimension', () => {
  // pov = 4, conv = 4, trust = 4, signal = 2 -> signal is strictly lowest
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, conv1: 2, conv2: 2, trust1: 2, trust2: 2, signal1: 1, signal2: 1 }));
  assert.notEqual(r.gap, null);
  assert.equal(r.gap.dimension, 'signalToSales');
});

test('mid band, POV strong -> Publisher, gap Conversion Surface', () => {
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, conv1: 1, conv2: 1, trust1: 1, trust2: 1, signal1: 1, signal2: 1 }));
  assert.equal(r.score, 63);
  assert.equal(r.archetype.key, 'publisher');
  assert.equal(r.gap.dimension, 'conversionSurface');
});

test('mid band, Conversion strong -> Operator, gap Point of View', () => {
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, conv1: 2, conv2: 2, trust1: 1, trust2: 1, signal1: 1, signal2: 1 }));
  assert.equal(r.score, 63);
  assert.equal(r.archetype.key, 'operator');
  assert.equal(r.gap.dimension, 'pointOfView');
});

test('gap is the strictly lowest dimension regardless of archetype', () => {
  // pov = 3, others = 4 -> points 15, score 94 -> Authority, gap pointOfView
  const r = scoreAnswers(from({ pov1: 2, pov2: 1, conv1: 2, conv2: 2, trust1: 2, trust2: 2, signal1: 2, signal2: 2 }));
  assert.equal(r.score, 94);
  assert.equal(r.archetype.key, 'authority');
  assert.equal(r.gap.dimension, 'pointOfView');
});

// Malignant corner 1: POV floored, cluster high -> total score lands high (~69),
// but archetype must NOT be Authority (whose narrative claims a framework buyers
// research against) when POV is the gap. Dimension-defined map yields Operator.
test('POV floored at high total -> Operator, not Authority; gap is Point of View', () => {
  // pov = 0, conv = 4, trust = 4, signal = 3 -> points 11, score 69
  const r = scoreAnswers(from({ pov1: 0, pov2: 0, conv1: 2, conv2: 2, trust1: 2, trust2: 2, signal1: 2, signal2: 1 }));
  assert.equal(r.score, 69);
  assert.equal(r.dimensionScores.pointOfView, 0);
  assert.equal(r.archetype.key, 'operator');
  assert.notEqual(r.archetype.key, 'authority');
  assert.equal(r.gap.dimension, 'pointOfView');
});

// Independence of the rebuilt cluster: after the re-spec, Trust at Capture and
// Signal to Sales measure different real-world things (the buyer's perceived
// value at capture vs. the rep-facing hand-off system). A respondent must be
// able to score high on one and low on the other. These two cases lock that the
// scoring engine resolves lumpy cluster profiles to the correct lowest-dimension
// gap, which is only meaningful if the dimensions are genuinely separable.
test('high Trust, floored Signal -> gap is Signal to Sales', () => {
  // pov = 2, conv = 2, trust = 4, signal = 0 -> signal strictly lowest
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, conv1: 1, conv2: 1, trust1: 2, trust2: 2, signal1: 0, signal2: 0 }));
  assert.equal(r.dimensionScores.trustAtCapture, 4);
  assert.equal(r.dimensionScores.signalToSales, 0);
  assert.equal(r.gap.dimension, 'signalToSales');
});

test('high Signal, floored Trust -> gap is Trust at Capture', () => {
  // pov = 2, conv = 2, trust = 0, signal = 4 -> trust strictly lowest
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, conv1: 1, conv2: 1, trust1: 0, trust2: 0, signal1: 2, signal2: 2 }));
  assert.equal(r.dimensionScores.signalToSales, 4);
  assert.equal(r.dimensionScores.trustAtCapture, 0);
  assert.equal(r.gap.dimension, 'trustAtCapture');
});

// Lumpy cluster reaching the >=8 high threshold without uniform strength:
// conv 4 + trust 4 + signal 0 = cluster 8 with POV low -> Operator, and the gap
// correctly surfaces the floored Signal dimension. Confirms the cluster>=8 cut
// still reads correctly now that the cluster is three independent constructs.
test('lumpy cluster at threshold (conv+trust high, signal floored) -> Operator, gap Signal to Sales', () => {
  // pov = 2, conv = 4, trust = 4, signal = 0 -> cluster 8 (high), POV low
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, conv1: 2, conv2: 2, trust1: 2, trust2: 2, signal1: 0, signal2: 0 }));
  assert.equal(r.dimensionScores.conversionSurface + r.dimensionScores.trustAtCapture + r.dimensionScores.signalToSales, 8);
  assert.equal(r.archetype.key, 'operator');
  assert.equal(r.gap.dimension, 'signalToSales');
});

// Malignant corner 2: POV maxed, cluster floored -> total score lands low (~25),
// but archetype must NOT be Renter (whose narrative claims someone else's lens)
// when POV is maxed. Dimension-defined map yields Publisher, and the gap is a
// cluster dimension, never Point of View.
test('POV maxed at low total -> Publisher, not Renter; gap is not Point of View', () => {
  // pov = 4, conv = 0, trust = 0, signal = 0 -> points 4, score 25
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, conv1: 0, conv2: 0, trust1: 0, trust2: 0, signal1: 0, signal2: 0 }));
  assert.equal(r.score, 25);
  assert.equal(r.dimensionScores.pointOfView, 4);
  assert.equal(r.archetype.key, 'publisher');
  assert.notEqual(r.archetype.key, 'renter');
  assert.notEqual(r.gap.dimension, 'pointOfView');
});
