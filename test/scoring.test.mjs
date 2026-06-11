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

const IDS = ['pov1', 'pov2', 'pov3', 'conv1', 'conv2', 'conv3', 'trust1', 'trust2', 'trust3', 'signal1', 'signal2', 'signal3'];
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
  assert.equal(r.points, 24); // 12 questions * 2
  assert.equal(r.score, 100);
  assert.equal(r.archetype.key, 'authority');
});

// All dimensions equal -> no single lowest -> focus is null (the ONLY no-focus
// state). evenTier reports the band so copy stays honest: all-high is "strong and
// even", all-low/mid is "even, opportunity is systemic". An all-high Authority is
// never told they are "renting the lens" they actually own.
test('all dimensions equal high -> Authority, no focus, evenTier high', () => {
  const r = scoreAnswers(all(2)); // every dimension = 6 raw -> 100, equal
  assert.equal(r.archetype.key, 'authority');
  assert.equal(r.score, 100);
  assert.equal(r.focus, null);
  assert.equal(r.evenTier, 'high');
});

test('all dimensions equal mid -> no focus, evenTier low', () => {
  const r = scoreAnswers(all(1)); // every dimension = 3 raw -> 50, equal -> mid, < HIGH
  assert.equal(r.focus, null);
  assert.equal(r.evenTier, 'low');
});

// A genuine single-lowest dimension returns a non-null focus on that dimension.
test('single lowest dimension -> non-null focus on that dimension', () => {
  // pov = conv = trust = 6 (100), signal = 3 (50) -> signal strictly lowest
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, pov3: 2, conv1: 2, conv2: 2, conv3: 2, trust1: 2, trust2: 2, trust3: 2, signal1: 1, signal2: 1, signal3: 1 }));
  assert.notEqual(r.focus, null);
  assert.equal(r.focus.dimension, 'signalToSales');
  assert.equal(r.focus.tier, 'deficit'); // signal /100 = 50 (mid) < 75
});

// Tie-break: when several dimensions share the lowest score, the EARLIEST
// funnel-stage dimension (DIMENSIONS array order) is surfaced.
test('lowest-score tie -> focus on earliest funnel stage (tie-break)', () => {
  // pov = 2 (33), conv = 2 (33), trust = 6, signal = 6 -> pov and conv tie lowest; pov wins
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, pov3: 0, conv1: 1, conv2: 1, conv3: 0, trust1: 2, trust2: 2, trust3: 2, signal1: 2, signal2: 2, signal3: 2 }));
  assert.equal(r.focus.dimension, 'pointOfView');
  assert.equal(r.focus.tier, 'deficit');
});

test('mid band, POV strong -> Publisher, focus Conversion Surface (deficit)', () => {
  // pov = 6 (100, high), conv = trust = signal = 3 (50, exec low) -> Publisher.
  // score = round(mean(1, .5, .5, .5)*100) = round(62.5) = 63.
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, pov3: 2, conv1: 1, conv2: 1, conv3: 1, trust1: 1, trust2: 1, trust3: 1, signal1: 1, signal2: 1, signal3: 1 }));
  assert.equal(r.score, 63);
  assert.equal(r.archetype.key, 'publisher');
  assert.equal(r.focus.dimension, 'conversionSurface');
  assert.equal(r.focus.tier, 'deficit');
});

test('mid band, Conversion strong -> Operator, focus Point of View (deficit)', () => {
  // pov = 3 (50, low), conv = trust = signal = 5 (83, exec high) -> Operator.
  // execMean = mean(.8333,.8333,.8333) = .8333 >= 2/3. POV strictly lowest -> deficit.
  // score = round(mean(.5,.8333,.8333,.8333)*100) = round(75) = 75.
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, pov3: 1, conv1: 2, conv2: 2, conv3: 1, trust1: 2, trust2: 2, trust3: 1, signal1: 2, signal2: 2, signal3: 1 }));
  assert.equal(r.score, 75);
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
  // pov = 5 (83, high but strictly lowest), others = 6 (100) -> Authority.
  // score = round(mean(.8333,1,1,1)*100) = round(95.83) = 96.
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, pov3: 1, conv1: 2, conv2: 2, conv3: 2, trust1: 2, trust2: 2, trust3: 2, signal1: 2, signal2: 2, signal3: 2 }));
  assert.equal(r.score, 96);
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
  // pov = conv = trust = 6 (100), signal = 3 (50) -> signal strictly lowest, mid band
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, pov3: 2, conv1: 2, conv2: 2, conv3: 2, trust1: 2, trust2: 2, trust3: 2, signal1: 1, signal2: 1, signal3: 1 }));
  assert.equal(r.dimensionScores.signalToSales, 50); // /100
  assert.notEqual(r.focus, null);
  assert.equal(r.focus.dimension, 'signalToSales');
  assert.equal(r.focus.tier, 'deficit');
});

// Malignant corner 1: POV floored, cluster high -> total score lands high (~69),
// but archetype must NOT be Authority (whose narrative claims a framework buyers
// research against) when POV is the gap. Dimension-defined map yields Operator.
test('POV floored at high total -> Operator, not Authority; gap is Point of View', () => {
  // pov = 0, conv = trust = 6 (100), signal = 4 (67) -> exec high, POV floored.
  // score = round(mean(0,1,1,.6667)*100) = round(66.67) = 67.
  const r = scoreAnswers(from({ pov1: 0, pov2: 0, pov3: 0, conv1: 2, conv2: 2, conv3: 2, trust1: 2, trust2: 2, trust3: 2, signal1: 2, signal2: 2, signal3: 0 }));
  assert.equal(r.score, 67);
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
  // pov = conv = 3 (50), trust = 6 (100), signal = 0 -> signal strictly lowest
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, pov3: 1, conv1: 1, conv2: 1, conv3: 1, trust1: 2, trust2: 2, trust3: 2, signal1: 0, signal2: 0, signal3: 0 }));
  assert.equal(r.dimensionScores.trustAtCapture, 100);
  assert.equal(r.dimensionScores.signalToSales, 0);
  assert.equal(r.focus.dimension, 'signalToSales');
});

test('high Signal, floored Trust -> gap is Trust at Capture', () => {
  // pov = conv = 3 (50), trust = 0, signal = 6 (100) -> trust strictly lowest
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, pov3: 1, conv1: 1, conv2: 1, conv3: 1, trust1: 0, trust2: 0, trust3: 0, signal1: 2, signal2: 2, signal3: 2 }));
  assert.equal(r.dimensionScores.signalToSales, 100);
  assert.equal(r.dimensionScores.trustAtCapture, 0);
  assert.equal(r.focus.dimension, 'trustAtCapture');
});

// Lumpy cluster reaching the >=8 high threshold without uniform strength:
// conv 4 + trust 4 + signal 0 = cluster 8 with POV low -> Operator, and the gap
// correctly surfaces the floored Signal dimension. Confirms the cluster>=8 cut
// still reads correctly now that the cluster is three independent constructs.
test('lumpy cluster at threshold (conv+trust high, signal floored) -> Operator, gap Signal to Sales', () => {
  // pov = 3 (low), conv = trust = 6 (100), signal = 0 -> execMean = (1+1+0)/3 = 2/3
  // exactly (the float boundary the epsilon protects). POV low -> Operator.
  const r = scoreAnswers(from({ pov1: 1, pov2: 1, pov3: 1, conv1: 2, conv2: 2, conv3: 2, trust1: 2, trust2: 2, trust3: 2, signal1: 0, signal2: 0, signal3: 0 }));
  assert.equal(r.dimensionScores.conversionSurface, 100);
  assert.equal(r.dimensionScores.trustAtCapture, 100);
  assert.equal(r.dimensionScores.signalToSales, 0);
  assert.equal(r.archetype.key, 'operator');
  assert.equal(r.focus.dimension, 'signalToSales');
});

// Malignant corner 2: POV maxed, cluster floored -> total score lands low (~25),
// but archetype must NOT be Renter (whose narrative claims someone else's lens)
// when POV is maxed. Dimension-defined map yields Publisher, and the gap is a
// cluster dimension, never Point of View.
test('POV maxed at low total -> Publisher, not Renter; gap is not Point of View', () => {
  // pov = 6 (100, high), conv = trust = signal = 0 -> exec low -> Publisher.
  // score = round(mean(1,0,0,0)*100) = round(25) = 25.
  const r = scoreAnswers(from({ pov1: 2, pov2: 2, pov3: 2, conv1: 0, conv2: 0, conv3: 0, trust1: 0, trust2: 0, trust3: 0, signal1: 0, signal2: 0, signal3: 0 }));
  assert.equal(r.score, 25);
  assert.equal(r.dimensionScores.pointOfView, 100);
  assert.equal(r.archetype.key, 'publisher');
  assert.notEqual(r.archetype.key, 'renter');
  assert.notEqual(r.focus.dimension, 'pointOfView');
});

// ---------------------------------------------------------------------------
// EXHAUSTIVE enumeration of all 2401 reachable dimension-score profiles.
// Each of the four dimensions (pointOfView, conversionSurface, trustAtCapture,
// signalToSales) is THREE questions whose choiceIndex equals points in {0,1,2},
// so a per-dimension raw target of 0-6 is reached by splitting it into three
// 0-2 question values. 7^4 = 2401 profiles. We assert the acceptance rules and
// exact parity with the server mirror across every one of them.
// ---------------------------------------------------------------------------

const DIM_KEYS = ['pointOfView', 'conversionSurface', 'trustAtCapture', 'signalToSales'];
const DIM_QS = {
  pointOfView: ['pov1', 'pov2', 'pov3'],
  conversionSurface: ['conv1', 'conv2', 'conv3'],
  trustAtCapture: ['trust1', 'trust2', 'trust3'],
  signalToSales: ['signal1', 'signal2', 'signal3'],
};
// Split a 0-6 raw target into three valid 0-2 question values (choiceIndex ==
// points). Greedily fill each of the three slots up to 2 until the target is
// spent: e.g. 6 -> [2,2,2], 5 -> [2,2,1], 3 -> [2,1,0], 0 -> [0,0,0].
const split = (t) => {
  const out = [];
  let rem = t;
  for (let i = 0; i < 3; i++) { const v = Math.min(rem, 2); out.push(v); rem -= v; }
  return out;
};

// answers for a target profile { pointOfView, conversionSurface, ... } each 0-6
function answersFor(profile) {
  const out = [];
  for (const key of DIM_KEYS) {
    const [a, b, c] = split(profile[key]);
    const [q1, q2, q3] = DIM_QS[key];
    out.push({ questionId: q1, choiceIndex: a }, { questionId: q2, choiceIndex: b }, { questionId: q3, choiceIndex: c });
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

const HIGH = 75; // /100 high-band floor, consistent with scorecard banding (>= 75 is "high")
// dim/100 = round(raw/6*100). Raw 5 -> 83 (>= 75, high); raw 4 -> 67 (< 75).
const dimHundred = (raw) => Math.round((raw / 6) * 100);

test('2401 profiles: R1prime (high-band focus is edge not deficit), R2 (no deficit focus on a claimed-strong dim), server parity, and no-focus rate', () => {
  let count = 0;
  let noFocus = 0; // the all-equal state
  let edgeFocus = 0;
  let deficitFocus = 0;
  let r1Violations = 0;
  let r2Violations = 0;
  let parityViolations = 0;

  for (let pov = 0; pov <= 6; pov++)
    for (let conv = 0; conv <= 6; conv++)
      for (let trust = 0; trust <= 6; trust++)
        for (let signal = 0; signal <= 6; signal++) {
          count++;
          const profile = { pointOfView: pov, conversionSurface: conv, trustAtCapture: trust, signalToSales: signal };
          const answers = answersFor(profile);
          const r = scoreAnswers(answers);

          // Raw dimension points must equal the intended profile (sanity on the
          // split), and the /100 display score must be round(raw/6*100).
          for (const key of DIM_KEYS) {
            assert.equal(r.dimensionRaw[key], profile[key]);
            assert.equal(r.dimensionScores[key], dimHundred(profile[key]));
          }

          // All-equal is defined on the /100 display scale (what focus/evenTier
          // use). Raw equality and /100 equality coincide since dimHundred is
          // monotonic and injective over 0..6, but we key off /100 to match logic.
          const hundreds = DIM_KEYS.map((k) => dimHundred(profile[k]));
          const allEqual = Math.min(...hundreds) === Math.max(...hundreds);

          if (r.focus === null) {
            // The ONLY no-focus state is all four dimensions exactly equal, and it
            // must still convert: evenTier reports the band honestly.
            noFocus++;
            assert.ok(allEqual, `no-focus on non-equal profile ${JSON.stringify(profile)}`);
            assert.equal(r.evenTier, Math.min(...hundreds) >= HIGH ? 'high' : 'low', `evenTier wrong for ${JSON.stringify(profile)}`);
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

  assert.equal(count, 2401, 'must enumerate exactly 2401 profiles');
  assert.equal(r1Violations, 0, "R1' must hold for all 2401 profiles");
  assert.equal(r2Violations, 0, 'R2 must hold for all 2401 profiles');
  assert.equal(parityViolations, 0, 'server mirror must match for all 2401 profiles');

  // The no-focus state is exactly the 7 all-equal raw profiles: (0,0,0,0)
  // through (6,6,6,6). dimHundred is injective over 0..6 so equal raws are the
  // only equal /100s. 7/2401 = 0.29%.
  assert.equal(noFocus, 7, 'no-focus must be exactly the 7 all-equal profiles');
  console.log(`  no-focus rate: ${noFocus}/2401 = ${(100 * noFocus / 2401).toFixed(2)}% | edge focus: ${edgeFocus} | deficit focus: ${deficitFocus}`);
});

// ---------------------------------------------------------------------------
// Fraction-threshold boundary test. The archetype gates are FRACTION cuts, not
// raw cuts, so they must classify correctly right at the boundary.
//
// POV high: povFrac >= 0.75. With integer raws (0..6) povFrac == 0.75 needs raw
// 4.5, which is UNREACHABLE; raw 5 (0.8333) is the first qualifying value and
// raw 4 (0.6667) is the last non-qualifying one. So we lock inclusivity by raw:
// raw 5 -> POV high, raw 4 -> POV low. ("povFrac exactly 0.75" is academic for
// integer raws; the meaningful, reachable boundary is raw 4 vs raw 5.)
//
// Exec high: mean(conv,trust,signal fracs) >= 2/3. execMean == 2/3 IS reachable
// (all three at raw 6 -> frac 1.0 -> mean 1.0 is well above; the exact-2/3 case
// is conv+trust+signal fracs summing to 2.0, e.g. 1.0 + 1.0 + 0.0). That sum is
// float-fragile: (1 + 1 + 0)/3 lands a hair below 2/3, which is exactly what the
// 1e-9 epsilon protects. We test it through answersFor so the real engine math runs.
test('fraction-threshold boundary: POV-high inclusivity (raw 5 vs raw 4) and exec-high at exactly 2/3', () => {
  // POV high boundary: raw 5 qualifies (Authority when exec is high), raw 4 does
  // not (Operator when exec is high). Hold exec maxed so only POV flips the result.
  const povRaw5 = scoreAnswers(answersFor({ pointOfView: 5, conversionSurface: 6, trustAtCapture: 6, signalToSales: 6 }));
  assert.equal(povRaw5.archetype.key, 'authority', 'pov raw 5 (0.8333 >= 0.75) must read POV high');
  const povRaw4 = scoreAnswers(answersFor({ pointOfView: 4, conversionSurface: 6, trustAtCapture: 6, signalToSales: 6 }));
  assert.equal(povRaw4.archetype.key, 'operator', 'pov raw 4 (0.6667 < 0.75) must read POV low');

  // Exec-high at EXACTLY 2/3: conv=trust=6 (1.0 each), signal=0 -> execMean = 2/3.
  // POV low so the only thing under test is whether exec classifies high. The
  // epsilon must let this read Operator (exec high), not Renter (exec low).
  const execExactly = scoreAnswers(answersFor({ pointOfView: 0, conversionSurface: 6, trustAtCapture: 6, signalToSales: 0 }));
  assert.equal(execExactly.archetype.key, 'operator', 'execMean == 2/3 must read exec high (epsilon)');
  // One notch below 2/3 must read exec low (Renter): conv=6, trust=6, signal -1
  // notch is not possible at the sum boundary, so drop trust to 5 (0.8333):
  // mean = (1 + 0.8333 + 0)/3 = 0.6111 < 2/3.
  const execBelow = scoreAnswers(answersFor({ pointOfView: 0, conversionSurface: 6, trustAtCapture: 5, signalToSales: 0 }));
  assert.equal(execBelow.archetype.key, 'renter', 'execMean < 2/3 must read exec low');
});

// ---------------------------------------------------------------------------
// Round-once test. The DRI total is round(mean(full-precision fracs)*100),
// rounded ONCE. A tempting wrong implementation averages the four ROUNDED /100
// dimension scores, which double-rounds and can disagree at a .5 boundary.
//
// Profile pov=5, conv=2, trust=2, signal=0:
//   fracs = 5/6, 2/6, 2/6, 0 -> mean = (0.8333 + 0.3333 + 0.3333 + 0)/4 = 0.375
//   round-once total = round(37.5) = 38.
//   The displayed /100 dimensions = 83, 33, 33, 0. Averaging THOSE gives
//   round((83+33+33+0)/4) = round(37.25) = 37. The correct engine returns 38,
//   and the four displayed dimensions do NOT arithmetically average to it. That
//   inconsistency is intended under round-once.
test('round-once: DRI total is rounded once from full-precision fractions, not from displayed /100s', () => {
  const r = scoreAnswers(answersFor({ pointOfView: 5, conversionSurface: 2, trustAtCapture: 2, signalToSales: 0 }));
  assert.equal(r.score, 38, 'round-once of mean(5/6,2/6,2/6,0)*100 = round(37.5) = 38');
  assert.deepEqual(
    [r.dimensionScores.pointOfView, r.dimensionScores.conversionSurface, r.dimensionScores.trustAtCapture, r.dimensionScores.signalToSales],
    [83, 33, 33, 0],
    'displayed /100 dimensions',
  );
  // The displayed dimensions average to 37.25 -> round 37, NOT the headline 38.
  // This asserts the round-once behavior is real, not an accident of this profile.
  const naiveAvgOfDisplayed = Math.round((83 + 33 + 33 + 0) / 4);
  assert.equal(naiveAvgOfDisplayed, 37);
  assert.notEqual(r.score, naiveAvgOfDisplayed, 'headline must differ from naive average of displayed /100s');
  // Server mirror must agree on the round-once total.
  const s = dri.scoreAnswers(answersFor({ pointOfView: 5, conversionSurface: 2, trustAtCapture: 2, signalToSales: 0 }));
  assert.equal(s.score, 38, 'server mirror must also round once to 38');
});
