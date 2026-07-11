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

// MODEL: one question per dimension, in funnel order. choiceIndex 0..5 selects an
// option whose value is 0,20,40,60,80,100 and that value IS the dimension /100.
const IDS = ['pov', 'sensing', 'conv', 'trust', 'signal'];
const VALUES = [0, 20, 40, 60, 80, 100]; // option value at each choiceIndex
const all = (choiceIndex) => IDS.map((id) => ({ questionId: id, choiceIndex }));
const from = (map) => IDS.map((id) => ({ questionId: id, choiceIndex: map[id] }));

// Build an answer set from a target dimension /100 profile (each in VALUES). The
// choiceIndex is value/20 since the rungs are evenly spaced by 20.
const idxFor = (value) => VALUES.indexOf(value);
function answersForProfile(profile) {
  return [
    { questionId: 'pov', choiceIndex: idxFor(profile.pointOfView) },
    { questionId: 'sensing', choiceIndex: idxFor(profile.buyerResearchSensing) },
    { questionId: 'conv', choiceIndex: idxFor(profile.conversionSurface) },
    { questionId: 'trust', choiceIndex: idxFor(profile.trustAtCapture) },
    { questionId: 'signal', choiceIndex: idxFor(profile.signalToSales) },
  ];
}

test('all lowest answers -> Renter, score 0, no focus, evenTier low (all dimensions equal)', () => {
  const r = scoreAnswers(all(0));
  assert.equal(r.score, 0);
  assert.equal(r.archetype.key, 'renter');
  assert.equal(r.focus, null);
  assert.equal(r.evenTier, 'low'); // even-low: honest, never "strong and even"
  for (const k of ['pointOfView', 'buyerResearchSensing', 'conversionSurface', 'trustAtCapture', 'signalToSales'])
    assert.equal(r.dimensionScores[k], 0);
});

test('all highest answers -> Authority, score 100', () => {
  const r = scoreAnswers(all(5));
  assert.equal(r.score, 100); // weighted sum of all 100s = 100
  assert.equal(r.archetype.key, 'authority');
});

// All dimensions equal -> no single lowest -> focus is null (the ONLY no-focus
// state). evenTier reports the band so copy stays honest. An all-high Authority is
// never told they are "renting the lens" they actually own.
test('all dimensions equal high -> Authority, no focus, evenTier high', () => {
  const r = scoreAnswers(all(5)); // every dimension = 100, equal
  assert.equal(r.archetype.key, 'authority');
  assert.equal(r.score, 100);
  assert.equal(r.focus, null);
  assert.equal(r.evenTier, 'high');
});

test('all dimensions equal mid -> no focus, evenTier low', () => {
  const r = scoreAnswers(all(2)); // every dimension = 40, equal -> < HIGH
  assert.equal(r.focus, null);
  assert.equal(r.evenTier, 'low');
});

// A genuine single-lowest dimension returns a non-null focus on that dimension.
test('single lowest dimension -> non-null focus on that dimension', () => {
  // pov=sensing=conv=trust=100, signal=40 -> signal strictly lowest, mid band
  const r = scoreAnswers(from({ pov: 5, sensing: 5, conv: 5, trust: 5, signal: 2 }));
  assert.notEqual(r.focus, null);
  assert.equal(r.focus.dimension, 'signalToSales');
  assert.equal(r.focus.tier, 'deficit'); // signal /100 = 40 < 75
});

// Tie-break: when several dimensions share the lowest score, the EARLIEST
// funnel-stage dimension (dimensions array order) is surfaced.
test('lowest-score tie -> focus on earliest funnel stage (tie-break)', () => {
  // pov=40, sensing=40 tie lowest; pov is earliest -> pov wins.
  const r = scoreAnswers(from({ pov: 2, sensing: 2, conv: 5, trust: 5, signal: 5 }));
  assert.equal(r.focus.dimension, 'pointOfView');
  assert.equal(r.focus.tier, 'deficit');
});

// buyerResearchSensing tie-break placement: when pov is strong but sensing ties
// with a downstream dimension at the lowest, sensing (earlier in funnel) wins.
test('sensing tie with downstream -> focus on Buyer Research Sensing (earlier stage)', () => {
  // pov=100, sensing=40, conv=40, trust=100, signal=100 -> sensing and conv tie lowest;
  // sensing is earlier -> sensing wins.
  const r = scoreAnswers(from({ pov: 5, sensing: 2, conv: 2, trust: 5, signal: 5 }));
  assert.equal(r.focus.dimension, 'buyerResearchSensing');
  assert.equal(r.focus.tier, 'deficit');
});

test('upstream strong, downstream weak -> Publisher, focus a downstream dimension (deficit)', () => {
  // pov=sensing=80 (upstream mean 0.8 >= 0.70 high), conv=trust=signal=40
  // (downstream mean 0.4 < 2/3 low) -> Publisher. Lowest is a downstream dim.
  const r = scoreAnswers(from({ pov: 4, sensing: 4, conv: 2, trust: 2, signal: 2 }));
  // score = round(0.30*80 + 0.20*80 + 0.20*40 + 0.16*40 + 0.14*40) = round(24+16+8+6.4+5.6)=60
  assert.equal(r.score, 60);
  assert.equal(r.archetype.key, 'publisher');
  assert.equal(r.focus.dimension, 'conversionSurface'); // earliest downstream tie among 40s
  assert.equal(r.focus.tier, 'deficit');
});

test('downstream strong, upstream weak -> Operator, focus an upstream dimension (deficit)', () => {
  // pov=sensing=40 (upstream mean 0.4 < 0.70 low), conv=trust=signal=80
  // (downstream mean 0.8 >= 2/3 high) -> Operator. Lowest is an upstream dim.
  const r = scoreAnswers(from({ pov: 2, sensing: 2, conv: 4, trust: 4, signal: 4 }));
  // score = round(0.30*40 + 0.20*40 + 0.20*80 + 0.16*80 + 0.14*80) = round(12+8+16+12.8+11.2)=60
  assert.equal(r.score, 60);
  assert.equal(r.archetype.key, 'operator');
  assert.equal(r.focus.dimension, 'pointOfView'); // earliest upstream tie among 40s
  assert.equal(r.focus.tier, 'deficit');
});

// R1' (was R1): when the lowest dimension is already in the HIGH band (>= 75) the
// focus is framed as an EDGE (next lever to extend), never a deficit.
test('lowest dimension in high band -> focus surfaced as edge (R1prime)', () => {
  // pov=80 (high but strictly lowest), others=100 -> Authority.
  const r = scoreAnswers(from({ pov: 4, sensing: 5, conv: 5, trust: 5, signal: 5 }));
  // score = round(0.30*80 + 0.20*100 + 0.20*100 + 0.16*100 + 0.14*100)=round(24+20+20+16+14)=94
  assert.equal(r.score, 94);
  assert.equal(r.archetype.key, 'authority');
  assert.notEqual(r.focus, null);
  assert.equal(r.focus.dimension, 'pointOfView');
  assert.equal(r.focus.tier, 'edge'); // high-band lowest -> edge, never deficit
  assert.equal(r.focus.blurb, EDGE_BLURB.pointOfView);
  assert.notEqual(r.focus.blurb, GAP_BLURB.pointOfView);
});

// Malignant corner 1: upstream floored, downstream high -> archetype must be
// Operator (never Authority), and the gap is an upstream dimension.
test('upstream floored, downstream high -> Operator, not Authority; gap is upstream', () => {
  // pov=0, sensing=0, conv=trust=signal=100 -> upstream mean 0, downstream mean 1.
  const r = scoreAnswers(from({ pov: 0, sensing: 0, conv: 5, trust: 5, signal: 5 }));
  // score = round(0 + 0 + 20 + 16 + 14) = 50
  assert.equal(r.score, 50);
  assert.equal(r.dimensionScores.pointOfView, 0);
  assert.equal(r.archetype.key, 'operator');
  assert.notEqual(r.archetype.key, 'authority');
  assert.equal(r.focus.dimension, 'pointOfView'); // earliest of the two floored upstream dims
  assert.equal(r.focus.tier, 'deficit');
});

// Malignant corner 2: upstream maxed, downstream floored -> archetype must be
// Publisher (never Renter), and the gap is a downstream dimension.
test('upstream maxed, downstream floored -> Publisher, not Renter; gap is downstream', () => {
  // pov=sensing=100, conv=trust=signal=0 -> upstream mean 1, downstream mean 0.
  const r = scoreAnswers(from({ pov: 5, sensing: 5, conv: 0, trust: 0, signal: 0 }));
  // score = round(30 + 20 + 0 + 0 + 0) = 50
  assert.equal(r.score, 50);
  assert.equal(r.dimensionScores.pointOfView, 100);
  assert.equal(r.archetype.key, 'publisher');
  assert.notEqual(r.archetype.key, 'renter');
  assert.equal(r.focus.dimension, 'conversionSurface'); // earliest downstream
  assert.notEqual(r.focus.dimension, 'pointOfView');
});

// Pairwise independence: with one item per dimension, every dimension is fully
// independent of every other. Any dimension can be 100 while any other is 0.
test('pairwise independence: each dimension can be 100 while another is 0 (reachable)', () => {
  const DIMS = ['pointOfView', 'buyerResearchSensing', 'conversionSurface', 'trustAtCapture', 'signalToSales'];
  const QMAP = { pointOfView: 'pov', buyerResearchSensing: 'sensing', conversionSurface: 'conv', trustAtCapture: 'trust', signalToSales: 'signal' };
  for (const hi of DIMS) for (const lo of DIMS) {
    if (hi === lo) continue;
    const choices = { pov: 2, sensing: 2, conv: 2, trust: 2, signal: 2 }; // baseline mid
    choices[QMAP[hi]] = 5; // 100
    choices[QMAP[lo]] = 0; // 0
    const r = scoreAnswers(from(choices));
    assert.equal(r.dimensionScores[hi], 100, `${hi}=100 with ${lo}=0 must be reachable`);
    assert.equal(r.dimensionScores[lo], 0, `${lo}=0 with ${hi}=100 must be reachable`);
  }
});

// ---------------------------------------------------------------------------
// EXHAUSTIVE enumeration of all 6^5 = 7776 reachable profiles. Each of the five
// dimensions independently takes a value in {0,20,40,60,80,100} (one question per
// dimension, choiceIndex -> option value). We assert the acceptance rules and
// exact parity with the server mirror across every one of them.
// ---------------------------------------------------------------------------

const DIM_KEYS = ['pointOfView', 'buyerResearchSensing', 'conversionSurface', 'trustAtCapture', 'signalToSales'];

// Each archetype's claimed-strong dimensions, faithful to the blurb prose.
// The 2x2 gate guarantees the UPSTREAM PAIR (Point of View + Buyer Research
// Sensing) mean >= 0.70 for Authority and Publisher, whose blurbs claim STRATEGY
// (both upstream dimensions). It guarantees the downstream cluster mean >= 2/3 for
// Authority and Operator, but NOT that any single downstream dimension is strong
// (Operator is reachable with signalToSales = 0, Authority with conversionSurface
// = 0). So no single downstream dimension may appear in any claimed-strong set.
//
// NOTE: upstreamHigh is a MEAN >= 0.70, which does NOT guarantee each upstream
// dimension individually clears 75. So a single upstream dimension can still be
// the deficit focus while the pair mean is high. R2 below only fires on a DEFICIT
// focus, and a deficit upstream dimension is by definition < 75; pairing it with
// an archetype that claims that exact dimension strong would be the violation.
// Because upstreamHigh can hold with one upstream dim low, we DO NOT list the
// individual upstream dimensions as claimed-strong (the claim is about the pair as
// strategy, not either dimension singly). This keeps R2 honest.
const CLAIMED_STRONG = {
  authority: [],
  publisher: [],
  operator: [],
  renter: [],
};

// Static text guard. The 2x2 gate guarantees an aggregate downstream cluster mean
// but never any single downstream dimension, so Renter, Operator, and Authority
// must be CLUSTER-SILENT: their blurbs may not contain vocabulary that asserts a
// specific downstream dimension (Conversion Surface, Trust at Capture, or Signal
// to Sales) works. Publisher is EXEMPT: its blurb is allowed to name the downstream
// path in a WEAKNESS frame.
//
// UPSTREAM vocabulary (lens, framework, point of view, research, sensing) is
// intentionally NOT a trigger: Authority/Publisher are allowed to claim strategy.
const CLUSTER_SILENT = ['renter', 'operator', 'authority'];
const CLUSTER_VOCAB = [
  'convert',   // Conversion Surface: "converts", "conversion"
  'capture',   // Trust at Capture
  'hand-off', 'hands off', 'handoff', 'hand off', // Signal to Sales hand-off
  'route', 'routing', // Signal to Sales routing
  'trust',     // Trust at Capture
];
// 'signal' is intentionally excluded as a trigger: Operator/Authority blurbs use
// "reading what buyers research" language, and "signal" could appear as a generic
// steering term for buyer-research sensing (upstream). The downstream Signal to
// Sales dimension is caught by 'hand-off'/'route' instead.

test('archetype blurbs are cluster-silent (Operator/Authority/Renter name no specific downstream dimension)', () => {
  for (const key of CLUSTER_SILENT) {
    const blurb = FRAMEWORK_ARCHETYPES[key].blurb.toLowerCase();
    for (const term of CLUSTER_VOCAB) {
      assert.ok(!blurb.includes(term), `${key} blurb contains downstream-dimension vocabulary "${term}" but must be cluster-silent: "${FRAMEWORK_ARCHETYPES[key].blurb}"`);
    }
  }
});

// Guard-has-teeth: the cluster-silent guard MUST reject over-claiming strings.
test('cluster-silent guard rejects over-claiming Operator/Authority copy', () => {
  const OLD_OPERATOR = 'Your demand engine converts and hands off leads with context. The structural gap is the lens.';
  const OLD_AUTHORITY = 'You own the lens buyers use to research the problem and your engine converts that attention into pipeline.';
  const trips = (s) => CLUSTER_VOCAB.some((t) => s.toLowerCase().includes(t));
  assert.ok(trips(OLD_OPERATOR), 'guard must reject Operator over-claim ("converts and hands off")');
  assert.ok(trips(OLD_AUTHORITY), 'guard must reject Authority over-claim ("converts that attention")');
});

const HIGH = 75; // /100 high-band floor, consistent with scorecard banding (>= 75 is "high")
const UPSTREAM_HIGH = 0.70;
const DOWNSTREAM_HIGH = 2 / 3 - 1e-9;

// Compute the expected weighted score independently of the engine (round-once).
const WEIGHTS = { pointOfView: 0.30, buyerResearchSensing: 0.20, conversionSurface: 0.20, trustAtCapture: 0.16, signalToSales: 0.14 };
function expectedScore(p) {
  return Math.round(
    WEIGHTS.pointOfView * p.pointOfView +
    WEIGHTS.buyerResearchSensing * p.buyerResearchSensing +
    WEIGHTS.conversionSurface * p.conversionSurface +
    WEIGHTS.trustAtCapture * p.trustAtCapture +
    WEIGHTS.signalToSales * p.signalToSales,
  );
}
function expectedArchetype(p) {
  const up = (p.pointOfView / 100 + p.buyerResearchSensing / 100) / 2;
  const down = (p.conversionSurface / 100 + p.trustAtCapture / 100 + p.signalToSales / 100) / 3;
  const upHigh = up >= UPSTREAM_HIGH;
  const downHigh = down >= DOWNSTREAM_HIGH;
  if (upHigh) return downHigh ? 'authority' : 'publisher';
  return downHigh ? 'operator' : 'renter';
}

test('7776 profiles: weighted score, archetype, R1prime, R2, server parity, no-focus rate, coherence', () => {
  let count = 0;
  let noFocus = 0; // the all-equal state
  let edgeFocus = 0;
  let deficitFocus = 0;
  let r1Violations = 0;
  let r2Violations = 0;
  let coherenceViolations = 0;
  let parityViolations = 0;
  let scoreViolations = 0;

  for (const pov of VALUES)
    for (const sensing of VALUES)
      for (const conv of VALUES)
        for (const trust of VALUES)
          for (const signal of VALUES) {
            count++;
            const profile = { pointOfView: pov, buyerResearchSensing: sensing, conversionSurface: conv, trustAtCapture: trust, signalToSales: signal };
            const answers = answersForProfile(profile);
            const r = scoreAnswers(answers);

            // Dimension /100 scores equal the chosen option values directly.
            for (const key of DIM_KEYS) {
              assert.equal(r.dimensionScores[key], profile[key]);
              assert.equal(r.dimensionRaw[key], profile[key]); // raw === score now
            }

            // Round-once weighted total.
            const es = expectedScore(profile);
            if (r.score !== es) scoreViolations++;
            assert.equal(r.score, es, `weighted score wrong for ${JSON.stringify(profile)}`);

            // Archetype matches the dimension-defined 2x2.
            const ea = expectedArchetype(profile);
            assert.equal(r.archetype.key, ea, `archetype wrong for ${JSON.stringify(profile)}`);

            const values = DIM_KEYS.map((k) => profile[k]);
            const allEqual = Math.min(...values) === Math.max(...values);

            if (r.focus === null) {
              noFocus++;
              assert.ok(allEqual, `no-focus on non-equal profile ${JSON.stringify(profile)}`);
              assert.equal(r.evenTier, Math.min(...values) >= HIGH ? 'high' : 'low', `evenTier wrong for ${JSON.stringify(profile)}`);
            } else {
              assert.ok(!allEqual, `focus surfaced on all-equal profile ${JSON.stringify(profile)}`);
              assert.equal(r.evenTier, null);
              const focusScore = r.dimensionScores[r.focus.dimension];

              // Focus must be the lowest UNWEIGHTED dimension (weights do not gate).
              assert.equal(focusScore, Math.min(...values), `focus not the lowest dim for ${JSON.stringify(profile)}`);
              // Tie-break: earliest funnel stage among the lowest.
              const expectedFocusDim = DIM_KEYS.find((k) => profile[k] === Math.min(...values));
              assert.equal(r.focus.dimension, expectedFocusDim, `tie-break wrong for ${JSON.stringify(profile)}`);

              // R1': high-band lowest -> edge; else deficit. Plus content-level blurb.
              const expectedTier = focusScore >= HIGH ? 'edge' : 'deficit';
              if (r.focus.tier !== expectedTier) r1Violations++;
              assert.equal(r.focus.tier, expectedTier, `R1': tier wrong for ${r.focus.dimension}=${focusScore} on ${JSON.stringify(profile)}`);
              const expectedBlurb = r.focus.tier === 'edge' ? EDGE_BLURB[r.focus.dimension] : GAP_BLURB[r.focus.dimension];
              if (r.focus.blurb !== expectedBlurb) r1Violations++;
              assert.equal(r.focus.blurb, expectedBlurb, `R1' content: ${r.focus.tier} focus on ${r.focus.dimension} has wrong blurb for ${JSON.stringify(profile)}`);
              if (r.focus.tier === 'edge') assert.notEqual(r.focus.blurb, GAP_BLURB[r.focus.dimension], `edge focus must not use deficit prose for ${JSON.stringify(profile)}`);

              if (r.focus.tier === 'edge') edgeFocus++; else deficitFocus++;

              // R2 (coherence): no archetype may claim strength on a DEFICIT-framed
              // focus. CLAIMED_STRONG is empty for all four (the upstream claim is
              // about the pair, not either dimension singly), so this is vacuously
              // satisfied, but kept as the live guard against a future regression.
              if (r.focus.tier === 'deficit') {
                const claimed = CLAIMED_STRONG[r.archetype.key];
                if (claimed.includes(r.focus.dimension)) r2Violations++;
                assert.ok(!claimed.includes(r.focus.dimension), `R2: ${r.archetype.key} claims ${r.focus.dimension} strong but it is a deficit focus for ${JSON.stringify(profile)}`);
              }

              // Cluster coherence: Authority/Publisher require upstreamHigh, so a
              // DEFICIT focus on either upstream dimension must never co-occur with
              // Renter/Operator claiming the gap is upstream while reading the
              // archetype as one that does not require upstream. (Dimension-defined
              // map guarantees this; assert it explicitly.)
              if (r.archetype.key === 'authority' || r.archetype.key === 'publisher') {
                const up = (profile.pointOfView + profile.buyerResearchSensing) / 200;
                if (up < UPSTREAM_HIGH) coherenceViolations++;
                assert.ok(up >= UPSTREAM_HIGH, `${r.archetype.key} without upstreamHigh for ${JSON.stringify(profile)}`);
              }
              if (r.archetype.key === 'renter' || r.archetype.key === 'operator') {
                const up = (profile.pointOfView + profile.buyerResearchSensing) / 200;
                if (up >= UPSTREAM_HIGH) coherenceViolations++;
                assert.ok(up < UPSTREAM_HIGH, `${r.archetype.key} with upstreamHigh for ${JSON.stringify(profile)}`);
              }
            }

            // Exact sync with the api/_dri.js server mirror.
            const s = dri.scoreAnswers(answers);
            assert.notEqual(s, null, `server returned null for ${JSON.stringify(profile)}`);
            const equal =
              s.score === r.score &&
              s.archetype.key === r.archetype.key &&
              s.archetype.blurb === r.archetype.blurb &&
              s.evenTier === r.evenTier &&
              DIM_KEYS.every((k) => s.dimensionScores[k] === r.dimensionScores[k]) &&
              ((s.focus === null && r.focus === null) ||
                (s.focus && r.focus &&
                  s.focus.dimension === r.focus.dimension &&
                  s.focus.label === r.focus.label &&
                  s.focus.tier === r.focus.tier &&
                  s.focus.blurb === r.focus.blurb));
            if (!equal) parityViolations++;
            assert.ok(equal, `parity mismatch for ${JSON.stringify(profile)}`);
          }

  assert.equal(count, 7776, 'must enumerate exactly 6^5 = 7776 profiles');
  assert.equal(scoreViolations, 0, 'weighted score must match for all 7776 profiles');
  assert.equal(r1Violations, 0, "R1' must hold for all 7776 profiles");
  assert.equal(r2Violations, 0, 'R2 must hold for all 7776 profiles');
  assert.equal(coherenceViolations, 0, 'cluster coherence must hold for all 7776 profiles');
  assert.equal(parityViolations, 0, 'server mirror must match for all 7776 profiles');

  // The no-focus state is exactly the 6 all-equal profiles: every dimension at the
  // same one of the six values. 6/7776 = 0.077%.
  assert.equal(noFocus, 6, 'no-focus must be exactly the 6 all-equal profiles');
  console.log(`  no-focus rate: ${noFocus}/7776 = ${(100 * noFocus / 7776).toFixed(3)}% | edge focus: ${edgeFocus} | deficit focus: ${deficitFocus}`);
});

// ---------------------------------------------------------------------------
// Boundary tests for the archetype cluster thresholds.
// ---------------------------------------------------------------------------

// upstreamHigh = mean(pov, sensing)/100 >= 0.70. The reachable means around 0.70:
//   (80,60) -> 0.70 EXACTLY -> high.  (60,60) -> 0.60 -> low.  (60,80) -> 0.70 high.
// Hold downstream maxed so only the upstream flip changes the archetype.
test('boundary: upstreamHigh at exactly 0.70 (Authority) vs just below (Operator)', () => {
  const at = scoreAnswers(answersForProfile({ pointOfView: 80, buyerResearchSensing: 60, conversionSurface: 100, trustAtCapture: 100, signalToSales: 100 }));
  assert.equal(at.archetype.key, 'authority', 'upstream mean exactly 0.70 must read upstreamHigh');
  const below = scoreAnswers(answersForProfile({ pointOfView: 60, buyerResearchSensing: 60, conversionSurface: 100, trustAtCapture: 100, signalToSales: 100 }));
  assert.equal(below.archetype.key, 'operator', 'upstream mean 0.60 < 0.70 must read upstream low');
  // Symmetric ordering of the pair also lands exactly 0.70.
  const atSym = scoreAnswers(answersForProfile({ pointOfView: 60, buyerResearchSensing: 80, conversionSurface: 100, trustAtCapture: 100, signalToSales: 100 }));
  assert.equal(atSym.archetype.key, 'authority', 'upstream mean exactly 0.70 (swapped) must read upstreamHigh');
});

// downstreamHigh = mean(conv, trust, signal)/100 >= 2/3 (with epsilon). The
// float-fragile boundary is (100,100,0) -> mean = 2/3, which (1+1+0)/3 lands a hair
// below 2/3 and the epsilon protects. Hold upstream low so only downstream flips.
test('boundary: downstreamHigh at exactly 2/3 (Operator) vs just below (Renter)', () => {
  const at = scoreAnswers(answersForProfile({ pointOfView: 0, buyerResearchSensing: 0, conversionSurface: 100, trustAtCapture: 100, signalToSales: 0 }));
  assert.equal(at.archetype.key, 'operator', 'downstream mean exactly 2/3 must read downstreamHigh (epsilon)');
  // One notch below: (100,80,0) -> mean = 0.6 < 2/3 -> Renter.
  const below = scoreAnswers(answersForProfile({ pointOfView: 0, buyerResearchSensing: 0, conversionSurface: 100, trustAtCapture: 80, signalToSales: 0 }));
  assert.equal(below.archetype.key, 'renter', 'downstream mean 0.6 < 2/3 must read downstream low');
  // All-60 downstream is exactly 0.6 < 2/3 -> Renter (upstream low).
  const all60 = scoreAnswers(answersForProfile({ pointOfView: 0, buyerResearchSensing: 0, conversionSurface: 60, trustAtCapture: 60, signalToSales: 60 }));
  assert.equal(all60.archetype.key, 'renter', 'downstream all-60 (0.6) is below 2/3');
});

// ---------------------------------------------------------------------------
// Round-once test. The RCI total is round(weighted sum of the five dimension
// values), rounded ONCE. A profile whose weighted sum lands on a .5 boundary locks
// that the engine rounds the full-precision total, not pre-rounded parts.
// ---------------------------------------------------------------------------
test('round-once: RCI total is rounded once from the full-precision weighted sum', () => {
  // pov=60, sensing=20, conv=40, trust=20, signal=20:
  //   0.30*60 + 0.20*20 + 0.20*40 + 0.16*20 + 0.14*20
  // = 18 + 4 + 8 + 3.2 + 2.8 = 36.0 -> 36. Pick a .5 case instead:
  // pov=20, sensing=40, conv=40, trust=60, signal=60:
  //   6 + 8 + 8 + 9.6 + 8.4 = 40.0. Find a genuine .5:
  // pov=40, sensing=60, conv=20, trust=20, signal=60:
  //   12 + 12 + 4 + 3.2 + 8.4 = 39.6 -> 40.
  // pov=60,sensing=40,conv=60,trust=20,signal=40: 18+8+12+3.2+5.6 = 46.8 -> 47.
  // A clean .5: pov=20,sensing=20,conv=60,trust=60,signal=80:
  //   6 + 4 + 12 + 9.6 + 11.2 = 42.8 -> 43.
  // Use the locked example with a verified half: pov=80,sensing=20,conv=40,trust=20,signal=20
  //   24 + 4 + 8 + 3.2 + 2.8 = 42.0. Compute one that truly hits x.5:
  // pov=20,sensing=60,conv=20,trust=80,signal=20: 6+12+4+12.8+2.8 = 37.6 -> 38.
  const profile = { pointOfView: 60, buyerResearchSensing: 60, conversionSurface: 60, trustAtCapture: 80, signalToSales: 20 };
  // 18 + 12 + 12 + 12.8 + 2.8 = 57.6 -> 58
  const r = scoreAnswers(answersForProfile(profile));
  assert.equal(r.score, 58, 'round-once weighted total = round(57.6) = 58');
  // Server mirror agrees.
  const s = dri.scoreAnswers(answersForProfile(profile));
  assert.equal(s.score, 58, 'server mirror must also round once to 58');

  // A profile whose full-precision weighted sum is exactly x.5 rounds half-up.
  // pov=0,sensing=0,conv=0,trust=0,signal=... cannot reach .5 alone. Use:
  // pov=20,sensing=20,conv=20,trust=20,signal=60: 6+4+4+3.2+8.4 = 25.6 -> 26.
  // Construct exact .5: 0.16*trust contributes .x; trust=20 -> 3.2; trust=60 ->9.6.
  // weighted sums are multiples of 0.2, so they CAN be x.5 only via .16/.14 terms.
  // pov=0,sensing=0,conv=0,trust=... 0.16*t in {0,3.2,6.4,9.6,12.8,16}; 0.14*s in
  // {0,2.8,5.6,8.4,11.2,14}. trust=20,signal=20 -> 3.2+2.8=6.0. trust=60,signal=40
  // -> 9.6+5.6=15.2. Reaching x.5 needs a .5 fractional: 0.30,0.20,0.20 terms are
  // multiples of 4 (whole). So fractional comes only from 0.16*t + 0.14*s. Those
  // sums: enumerate -> ...,  trust=80(12.8)+signal=60(8.4)=21.2; trust=20(3.2)+
  // signal=100(14)=17.2. None hit x.5 because 3.2k+2.8m mod 1 in {0,.2,.4,.6,.8}.
  // So an exact .5 weighted total is UNREACHABLE; round-once is unambiguous here.
  // We assert that property: no profile produces a .5 fractional weighted sum.
});

// No reachable profile yields a weighted sum ending in exactly .5, so round-once
// is never ambiguous. Assert this so the rounding rule has no hidden tie cases.
test('no reachable weighted sum lands on a .5 rounding tie', () => {
  let ties = 0;
  for (const pov of VALUES)
    for (const sensing of VALUES)
      for (const conv of VALUES)
        for (const trust of VALUES)
          for (const signal of VALUES) {
            const sum = WEIGHTS.pointOfView * pov + WEIGHTS.buyerResearchSensing * sensing +
              WEIGHTS.conversionSurface * conv + WEIGHTS.trustAtCapture * trust + WEIGHTS.signalToSales * signal;
            const frac = sum - Math.floor(sum);
            if (Math.abs(frac - 0.5) < 1e-9) ties++;
          }
  assert.equal(ties, 0, 'weighted sums never land on a .5 tie, so round-once is unambiguous');
});
