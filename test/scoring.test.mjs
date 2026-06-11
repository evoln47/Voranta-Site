import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { scoreAnswers } from '../assessment/scoring.mjs';
import { dimensions as FRAMEWORK_DIMS, archetypes as FRAMEWORK_ARCHETYPES } from '../assessment/framework.mjs';

// Provisional band-adaptive blurbs by dimension, for the content-level R1' check.
const GAP_BLURB = Object.fromEntries(FRAMEWORK_DIMS.map((d) => [d.key, d.gap]));
const EDGE_BLURB = Object.fromEntries(FRAMEWORK_DIMS.map((d) => [d.key, d.edge]));

const require = createRequire(import.meta.url);
const dri = require('../api/_dri.js'); // server-side mirror; must stay in exact sync

const IDS = ['pov1', 'pov2', 'conv1', 'conv2', 'trust1', 'trust2', 'signal1', 'signal2'];
const all = (choiceIndex) => IDS.map((id) => ({ questionId: id, choiceIndex }));
const from = (map) => IDS.map((id) => ({ questionId: id, choiceIndex: map[id] }));

test('all lowest answers -> Renter, score 0, no focus, evenTier low (all dimensions equal)', () => {
  const r = scoreAnswers(all(0));
  assert.equal(r.points, 0);
  assert.equal(r.score, 0);
  assert.equal(r.archetype.key, 'renter');
  assert.equal(r.focus, null);
  assert.equal(r.evenTier, 'low'); // even-low: honest, never "strong and even"
});

test('all highest answers -> Authority, score 100', () => {
  const r = scoreAnswers(all(2));
  assert.equal(r.points, 16);
  assert.equal(r.score, 100);
  assert.equal(r.archetype.key, 'authority');
});

// All dimensions equal -> no single lowest -> focus is null (the ONLY no-focus
// state). evenTier reports the band so copy stays honest: all-high is "strong and
// even", all-low/mid is "even, opportunity is systemic". An all-high Authority is
// never told they are "renting the lens" they actually own.
test('all dimensions equal high -> Authority, no focus, evenTier high', () => {
  const r = scoreAnswers(all(2)); // every dimension = 4, equal
  assert.equal(r.archetype.key, 'authority');
  assert.equal(r.score, 100);
  assert.equal(r.focus, null);
  assert.equal(r.evenTier, 'high');
});

test('all dimensions equal mid -> no focus, evenTier low', () => {
  const r = scoreAnswers(all(1)); // every dimension = 2, equal -> band mid, < HIGH
  assert.equal(r.focus, null);
  assert.equal(r.evenTier, 'low');
});

// A genuine single-lowest dimension returns a non-null focus on that dimension.
test('single lowest dimension -> non-null focus on that dimension', () => {
  // pov = 4, conv = 4, trust = 4, signal = 2 -> signal is strictly lowest
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, conv1: 2, conv2: 2, trust1: 2, trust2: 2, signal1: 1, signal2: 1 }));
  assert.notEqual(r.focus, null);
  assert.equal(r.focus.dimension, 'signalToSales');
  assert.equal(r.focus.tier, 'deficit'); // signal = 2 (mid) < HIGH
});

// Tie-break: when several dimensions share the lowest score, the EARLIEST
// funnel-stage dimension (DIMENSIONS array order) is surfaced.
test('lowest-score tie -> focus on earliest funnel stage (tie-break)', () => {
  // pov = 1, conv = 1, trust = 4, signal = 4 -> pov and conv tie lowest; pov wins
  const r = scoreAnswers(from({ pov1: 1, pov2: 0, conv1: 1, conv2: 0, trust1: 2, trust2: 2, signal1: 2, signal2: 2 }));
  assert.equal(r.focus.dimension, 'pointOfView');
  assert.equal(r.focus.tier, 'deficit');
});

test('mid band, POV strong -> Publisher, focus Conversion Surface (deficit)', () => {
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, conv1: 1, conv2: 1, trust1: 1, trust2: 1, signal1: 1, signal2: 1 }));
  assert.equal(r.score, 63);
  assert.equal(r.archetype.key, 'publisher');
  assert.equal(r.focus.dimension, 'conversionSurface');
  assert.equal(r.focus.tier, 'deficit');
});

test('mid band, Conversion strong -> Operator, focus Point of View (deficit)', () => {
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, conv1: 2, conv2: 2, trust1: 1, trust2: 1, signal1: 1, signal2: 1 }));
  assert.equal(r.score, 63);
  assert.equal(r.archetype.key, 'operator');
  assert.equal(r.focus.dimension, 'pointOfView');
  assert.equal(r.focus.tier, 'deficit');
});

// R1' (was R1): when the lowest dimension is already in the HIGH band (>= 3) the
// focus is no longer SUPPRESSED. It is still surfaced, but framed as an EDGE (the
// next lever to extend), never a deficit. pov = 3, others = 4 is a strong-
// everywhere Authority; framing POV as an edge does not contradict the archetype.
// OLD behavior: gap === null (suppressed). NEW behavior: focus on pointOfView with
// tier 'edge'. This evolution is what makes the no-focus state rare.
test('lowest dimension in high band -> focus surfaced as edge (R1prime)', () => {
  // pov = 3, others = 4 -> points 15, score 94 -> Authority
  const r = scoreAnswers(from({ pov1: 2, pov2: 1, conv1: 2, conv2: 2, trust1: 2, trust2: 2, signal1: 2, signal2: 2 }));
  assert.equal(r.score, 94);
  assert.equal(r.archetype.key, 'authority');
  assert.notEqual(r.focus, null);
  assert.equal(r.focus.dimension, 'pointOfView');
  assert.equal(r.focus.tier, 'edge'); // high-band lowest -> edge, never deficit
  // Content-level coherence: the edge blurb, not the "renting the lens" deficit prose.
  assert.equal(r.focus.blurb, EDGE_BLURB.pointOfView);
  assert.notEqual(r.focus.blurb, GAP_BLURB.pointOfView);
});

// Strictly-lowest coverage for a sub-high lowest dimension: surfaced as a deficit.
test('strictly lowest sub-high dimension -> deficit focus on that dimension', () => {
  // pov = 4, conv = 4, trust = 4, signal = 2 -> signal strictly lowest, mid band
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, conv1: 2, conv2: 2, trust1: 2, trust2: 2, signal1: 1, signal2: 1 }));
  assert.equal(r.dimensionScores.signalToSales, 2);
  assert.notEqual(r.focus, null);
  assert.equal(r.focus.dimension, 'signalToSales');
  assert.equal(r.focus.tier, 'deficit');
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
  assert.equal(r.focus.dimension, 'pointOfView');
  assert.equal(r.focus.tier, 'deficit'); // POV = 0
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
  assert.equal(r.focus.dimension, 'signalToSales');
});

test('high Signal, floored Trust -> gap is Trust at Capture', () => {
  // pov = 2, conv = 2, trust = 0, signal = 4 -> trust strictly lowest
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, conv1: 1, conv2: 1, trust1: 0, trust2: 0, signal1: 2, signal2: 2 }));
  assert.equal(r.dimensionScores.signalToSales, 4);
  assert.equal(r.dimensionScores.trustAtCapture, 0);
  assert.equal(r.focus.dimension, 'trustAtCapture');
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
  assert.equal(r.focus.dimension, 'signalToSales');
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
  assert.notEqual(r.focus.dimension, 'pointOfView');
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

// Each archetype's claimed-strong dimensions, faithful to the blurb prose. A
// dimension belongs here ONLY if the blurb asserts that specific dimension is
// strong. The 2x2 gate guarantees POV >= 3 for Authority and Publisher, so those
// two may name Point of View. It guarantees cluster >= 8 (an aggregate) for
// Authority and Operator, but NOT that any single cluster dimension is strong:
// Operator is reachable with signalToSales = 0 and Authority with
// conversionSurface = 0. An aggregate "broadly strong demand engine" claim names
// no single dimension, so it adds nothing here.
//   - Authority: claims POV ("you own the lens") + an AGGREGATE engine ("the rest
//     of your demand engine is broadly strong"). Only pointOfView is per-dimension.
//   - Publisher: claims POV + hedges the cluster as a possible weakness ("the
//     conversion path, the value at capture, or the hand-off ... is not closing
//     the gap"). Only pointOfView is a strength claim.
//   - Operator: claims an AGGREGATE engine ("a broadly strong demand engine"), no
//     single per-dimension strength claim.
//   - Renter: claims no strength.
// R2 requires that a DEFICIT-framed focus dimension never be among an archetype's
// claimed-strong set. An EDGE-framed focus (high-band lowest) is an opportunity,
// not a strength denial, so it is exempt and cannot create a contradiction.
//
// NOTE: this encoding is hand-maintained and only ever READ by R2, never derived
// from the blurb text, so it can silently drift out of sync with a copy rewrite
// (exactly how the over-claiming Operator/Authority blurbs slipped past R2 once).
// The static cluster-silent guard below (test 'archetype blurbs are cluster-
// silent') is the real regression teeth: it reads the live blurb strings and
// fails the instant an over-claim is reintroduced.
const CLAIMED_STRONG = {
  authority: ['pointOfView'],
  publisher: ['pointOfView'],
  operator: [],
  renter: [],
};

// Static text guard. The 2x2 gate guarantees an aggregate cluster (>= 8) but
// never any single cluster dimension, so Operator, Authority, and Renter must be
// CLUSTER-SILENT: their blurbs may not contain vocabulary that asserts a specific
// cluster dimension (Conversion Surface, Trust at Capture, or Signal to Sales)
// works. This is a stronger, cheaper invariant than "no strength language" for
// these three, and it is what gives the regression real teeth: it reads the live
// blurb text, so it fails the moment an over-claim is reintroduced.
//
// Publisher is EXEMPT: its blurb deliberately names the cluster ("conversion
// path, value at capture, hand-off") in a WEAKNESS frame, which the methodology
// blesses. A bare-substring guard cannot tell strength from weakness, so we scope
// the guard to the three cluster-silent archetypes only.
//
// The trigger list must have teeth against the OLD over-claiming copy: old
// Operator "converts and hands off leads with context" and old Authority "engine
// converts that attention into pipeline" are both caught by 'convert' and
// 'hand'. POV vocabulary (lens, framework, point of view) is intentionally NOT a
// trigger: Authority is allowed to claim POV.
const CLUSTER_SILENT = ['renter', 'operator', 'authority'];
const CLUSTER_VOCAB = [
  'convert',   // Conversion Surface: "converts", "conversion"
  'capture',   // Trust at Capture
  'hand-off', 'hands off', 'handoff', 'hand off', // Signal to Sales hand-off
  'signal',    // Signal to Sales
  'route', 'routing', // Signal to Sales routing
  'trust',     // Trust at Capture
];

test('archetype blurbs are cluster-silent (Operator/Authority/Renter name no specific cluster dimension)', () => {
  for (const key of CLUSTER_SILENT) {
    const blurb = FRAMEWORK_ARCHETYPES[key].blurb.toLowerCase();
    for (const term of CLUSTER_VOCAB) {
      assert.ok(!blurb.includes(term), `${key} blurb contains cluster-dimension vocabulary "${term}" but must be cluster-silent: "${FRAMEWORK_ARCHETYPES[key].blurb}"`);
    }
  }
});

// Guard-has-teeth: the cluster-silent guard MUST reject the OLD over-claiming
// strings. If this ever passes, the trigger list lost its teeth and the hole is
// rebuilt. We assert each old string trips at least one trigger.
test('cluster-silent guard rejects the old over-claiming Operator/Authority copy', () => {
  const OLD_OPERATOR = 'Your demand engine converts and hands off leads with context. The structural gap is the lens.';
  const OLD_AUTHORITY = 'You own the lens buyers use to research the problem and your engine converts that attention into pipeline.';
  const trips = (s) => CLUSTER_VOCAB.some((t) => s.toLowerCase().includes(t));
  assert.ok(trips(OLD_OPERATOR), 'guard must reject old Operator copy ("converts and hands off")');
  assert.ok(trips(OLD_AUTHORITY), 'guard must reject old Authority copy ("converts that attention")');
});

const HIGH = 3; // high-band floor, consistent with scorecard banding (raw >= 3 is "high")

test('625 profiles: R1prime (high-band focus is edge not deficit), R2 (no deficit focus on a claimed-strong dim), server parity, and no-focus rate', () => {
  let count = 0;
  let noFocus = 0; // the all-equal state
  let edgeFocus = 0;
  let deficitFocus = 0;
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

          const vals = DIM_KEYS.map((k) => profile[k]);
          const allEqual = Math.min(...vals) === Math.max(...vals);

          if (r.focus === null) {
            // The ONLY no-focus state is all four dimensions exactly equal, and it
            // must still convert: evenTier reports the band honestly.
            noFocus++;
            assert.ok(allEqual, `no-focus on non-equal profile ${JSON.stringify(profile)}`);
            assert.equal(r.evenTier, Math.min(...vals) >= HIGH ? 'high' : 'low', `evenTier wrong for ${JSON.stringify(profile)}`);
          } else {
            // A focus is always surfaced unless all-equal.
            assert.ok(!allEqual, `focus surfaced on all-equal profile ${JSON.stringify(profile)}`);
            assert.equal(r.evenTier, null);
            const focusScore = r.dimensionScores[r.focus.dimension];

            // R1': a high-band lowest dimension is framed as an EDGE, never a deficit.
            const expectedTier = focusScore >= HIGH ? 'edge' : 'deficit';
            if (r.focus.tier !== expectedTier) r1Violations++;
            assert.equal(r.focus.tier, expectedTier, `R1': tier wrong for ${r.focus.dimension}=${focusScore} on ${JSON.stringify(profile)}`);

            // R1' at the CONTENT level: an edge focus must carry the opportunity
            // (edge) blurb, NEVER the deficit (gap) prose. Without this, a (3,4,4,4)
            // Authority would read "you own a framework" and "you are renting the
            // lens" at once. The tier string alone does not catch that.
            const expectedBlurb = r.focus.tier === 'edge' ? EDGE_BLURB[r.focus.dimension] : GAP_BLURB[r.focus.dimension];
            if (r.focus.blurb !== expectedBlurb) r1Violations++;
            assert.equal(r.focus.blurb, expectedBlurb, `R1' content: ${r.focus.tier} focus on ${r.focus.dimension} has wrong blurb for ${JSON.stringify(profile)}`);
            if (r.focus.tier === 'edge') assert.notEqual(r.focus.blurb, GAP_BLURB[r.focus.dimension], `edge focus must not use deficit prose for ${JSON.stringify(profile)}`);

            if (r.focus.tier === 'edge') edgeFocus++; else deficitFocus++;

            // R2 (coherence): no archetype may claim strength on a DEFICIT-framed
            // focus. An EDGE-framed focus is an opportunity, not a strength denial,
            // so it is exempt. This is the surviving coherence rule.
            if (r.focus.tier === 'deficit') {
              const claimed = CLAIMED_STRONG[r.archetype.key];
              if (claimed.includes(r.focus.dimension)) r2Violations++;
              assert.ok(!claimed.includes(r.focus.dimension), `R2: ${r.archetype.key} claims ${r.focus.dimension} strong but it is a deficit focus for ${JSON.stringify(profile)}`);
            }
          }

          // Exact sync with the api/_dri.js server mirror: score, archetype, focus,
          // evenTier, and the blurb strings must be byte-identical.
          const s = dri.scoreAnswers(answers);
          assert.notEqual(s, null, `server returned null for ${JSON.stringify(profile)}`);
          const equal =
            s.score === r.score &&
            s.archetype.key === r.archetype.key &&
            s.archetype.blurb === r.archetype.blurb &&
            s.evenTier === r.evenTier &&
            ((s.focus === null && r.focus === null) ||
              (s.focus && r.focus &&
                s.focus.dimension === r.focus.dimension &&
                s.focus.label === r.focus.label &&
                s.focus.tier === r.focus.tier &&
                s.focus.blurb === r.focus.blurb));
          if (!equal) { parityViolations++; }
          assert.ok(equal, `parity mismatch for ${JSON.stringify(profile)}`);
        }

  assert.equal(count, 625, 'must enumerate exactly 625 profiles');
  assert.equal(r1Violations, 0, "R1' must hold for all 625 profiles");
  assert.equal(r2Violations, 0, 'R2 must hold for all 625 profiles');
  assert.equal(parityViolations, 0, 'server mirror must match for all 625 profiles');

  // The no-focus state is exactly the 5 all-equal profiles: (0,0,0,0) (1,1,1,1)
  // (2,2,2,2) (3,3,3,3) (4,4,4,4). 5/625 = 0.80%.
  assert.equal(noFocus, 5, 'no-focus must be exactly the 5 all-equal profiles');
  console.log(`  no-focus rate: ${noFocus}/625 = ${(100 * noFocus / 625).toFixed(2)}% | edge focus: ${edgeFocus} | deficit focus: ${deficitFocus}`);
});
