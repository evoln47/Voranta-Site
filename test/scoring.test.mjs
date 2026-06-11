import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { scoreAnswers } from '../assessment/scoring.mjs';

const require = createRequire(import.meta.url);
const dri = require('../api/_dri.js'); // server-side mirror; must stay in exact sync

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

// R1: when the lowest dimension is already in the HIGH band (>= 3) there is no
// gap. pov = 3, others = 4 is a strong-everywhere profile; flagging POV (a high
// dimension) as "your gap" next to an Authority result is incoherent, so gap is
// null. (Old behavior asserted gap.dimension === 'pointOfView'; that encoded the
// contradiction this fix closes.)
test('lowest dimension in high band -> no gap (R1)', () => {
  // pov = 3, others = 4 -> points 15, score 94 -> Authority, gap null
  const r = scoreAnswers(from({ pov1: 2, pov2: 1, conv1: 2, conv2: 2, trust1: 2, trust2: 2, signal1: 2, signal2: 2 }));
  assert.equal(r.score, 94);
  assert.equal(r.archetype.key, 'authority');
  assert.equal(r.gap, null);
});

// Strictly-lowest coverage retained for a sub-high lowest dimension: when the
// weakest dimension is below the high band it is still surfaced as the gap.
test('strictly lowest sub-high dimension -> non-null gap on that dimension', () => {
  // pov = 4, conv = 4, trust = 4, signal = 2 -> signal strictly lowest, mid band
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, conv1: 2, conv2: 2, trust1: 2, trust2: 2, signal1: 1, signal2: 1 }));
  assert.equal(r.dimensionScores.signalToSales, 2);
  assert.notEqual(r.gap, null);
  assert.equal(r.gap.dimension, 'signalToSales');
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

// ---------------------------------------------------------------------------
// EXHAUSTIVE enumeration of all 625 reachable dimension-score profiles.
// Each of the four dimensions (pointOfView, conversionSurface, trustAtCapture,
// signalToSales) is two questions whose choiceIndex equals points in {0,1,2},
// so a per-dimension target of 0-4 is reached by splitting it into two halves.
// 5^4 = 625 profiles. We assert the two acceptance rules and exact parity with
// the server mirror across every one of them.
// ---------------------------------------------------------------------------

const DIM_KEYS = ['pointOfView', 'conversionSurface', 'trustAtCapture', 'signalToSales'];
const DIM_QS = {
  pointOfView: ['pov1', 'pov2'],
  conversionSurface: ['conv1', 'conv2'],
  trustAtCapture: ['trust1', 'trust2'],
  signalToSales: ['signal1', 'signal2'],
};
// Split a 0-4 target into two valid 0-2 halves (choiceIndex == points).
const split = (t) => { const a = Math.min(t, 2); return [a, t - a]; };

// answers for a target profile { pointOfView, conversionSurface, ... } each 0-4
function answersFor(profile) {
  const out = [];
  for (const key of DIM_KEYS) {
    const [a, b] = split(profile[key]);
    const [q1, q2] = DIM_QS[key];
    out.push({ questionId: q1, choiceIndex: a }, { questionId: q2, choiceIndex: b });
  }
  return out;
}

// Each archetype's claimed-strong dimensions, faithful to the blurb prose:
//   - Authority blurb claims POV ("you own a framework") plus an AGGREGATE
//     "demand engine is broadly strong" (cluster-level, not per-dimension), so
//     only pointOfView is an absolute per-dimension strength claim.
//   - Publisher blurb claims POV ("strong point of view") and explicitly hedges
//     the cluster ("the conversion path, the value at capture, or the hand-off
//     ... is letting it slip").
//   - Operator blurb claims an AGGREGATE engine ("runs well across capture and
//     hand-off"), no single per-dimension absolute claim.
//   - Renter blurb claims no strength.
// R2 requires the gap dimension never be among an archetype's claimed-strong set.
const CLAIMED_STRONG = {
  authority: ['pointOfView'],
  publisher: ['pointOfView'],
  operator: [],
  renter: [],
};

const HIGH = 3; // high-band floor, consistent with scorecard banding (raw >= 3 is "high")

test('625 profiles: R1 (no high-band gap), R2 (gap not a claimed-strong dim), and exact server parity', () => {
  let count = 0;
  let r1Violations = 0;
  let r2Violations = 0;
  let parityViolations = 0;

  for (let pov = 0; pov <= 4; pov++)
    for (let conv = 0; conv <= 4; conv++)
      for (let trust = 0; trust <= 4; trust++)
        for (let signal = 0; signal <= 4; signal++) {
          count++;
          const profile = { pointOfView: pov, conversionSurface: conv, trustAtCapture: trust, signalToSales: signal };
          const answers = answersFor(profile);
          const r = scoreAnswers(answers);

          // Dimension scores must equal the intended profile (sanity on the split).
          for (const key of DIM_KEYS) assert.equal(r.dimensionScores[key], profile[key]);

          // R1: a high-band dimension is never the gap.
          if (r.gap) {
            const gapScore = r.dimensionScores[r.gap.dimension];
            if (gapScore >= HIGH) { r1Violations++; }
            assert.ok(gapScore < HIGH, `R1: gap on high-band dim ${r.gap.dimension}=${gapScore} for ${JSON.stringify(profile)}`);

            // R2: the gap dimension is not one the archetype's blurb claims strong.
            const claimed = CLAIMED_STRONG[r.archetype.key];
            if (claimed.includes(r.gap.dimension)) { r2Violations++; }
            assert.ok(!claimed.includes(r.gap.dimension), `R2: ${r.archetype.key} claims ${r.gap.dimension} strong but it is the gap for ${JSON.stringify(profile)}`);
          }

          // Exact sync with the api/_dri.js server mirror: score, archetype, gap,
          // and the blurb strings must be byte-identical.
          const s = dri.scoreAnswers(answers);
          assert.notEqual(s, null, `server returned null for ${JSON.stringify(profile)}`);
          const equal =
            s.score === r.score &&
            s.archetype.key === r.archetype.key &&
            s.archetype.blurb === r.archetype.blurb &&
            ((s.gap === null && r.gap === null) ||
              (s.gap && r.gap &&
                s.gap.dimension === r.gap.dimension &&
                s.gap.label === r.gap.label &&
                s.gap.blurb === r.gap.blurb));
          if (!equal) { parityViolations++; }
          assert.ok(equal, `parity mismatch for ${JSON.stringify(profile)}`);
        }

  assert.equal(count, 625, 'must enumerate exactly 625 profiles');
  assert.equal(r1Violations, 0, 'R1 must hold for all 625 profiles');
  assert.equal(r2Violations, 0, 'R2 must hold for all 625 profiles');
  assert.equal(parityViolations, 0, 'server mirror must match for all 625 profiles');
});
