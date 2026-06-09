import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreAnswers } from '../assessment/scoring.mjs';

const IDS = ['pov1', 'pov2', 'conv1', 'conv2', 'trust1', 'trust2', 'signal1', 'signal2'];
const all = (choiceIndex) => IDS.map((id) => ({ questionId: id, choiceIndex }));
const from = (map) => IDS.map((id) => ({ questionId: id, choiceIndex: map[id] }));

test('all lowest answers -> Renter, score 0, gap Point of View', () => {
  const r = scoreAnswers(all(0));
  assert.equal(r.points, 0);
  assert.equal(r.score, 0);
  assert.equal(r.archetype.key, 'renter');
  assert.equal(r.gap.dimension, 'pointOfView');
});

test('all highest answers -> Authority, score 100', () => {
  const r = scoreAnswers(all(2));
  assert.equal(r.points, 16);
  assert.equal(r.score, 100);
  assert.equal(r.archetype.key, 'authority');
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
