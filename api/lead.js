// Vercel serverless function (Node runtime, CommonJS, no dependencies).
// On a Demand Research Index submission this sends two emails via the Resend
// REST API: the visitor's own diagnosis to the address they entered, and a
// pre-diagnosed lead notification to Evan.
//
// Security: the endpoint is unauthenticated, so it must not let a caller put
// arbitrary text into a voranta.co-branded email or spoof a result. The score,
// archetype, and gap are therefore re-derived server-side from the submitted
// answers; client-supplied score/archetype/gap fields are ignored. A best-effort
// per-IP rate limit and the existing honeypot blunt casual abuse.

const FROM = process.env.LEAD_FROM || 'Voranta <noreply@voranta.co>';
const TO = process.env.LEAD_TO || 'evan@voranta.co';
// Generic sender identity (not a named human) to limit impersonation if abused.
// Replies still reach Evan via reply_to. Override with VISITOR_FROM if desired.
const VISITOR_FROM = process.env.VISITOR_FROM || 'Voranta <noreply@voranta.co>';
const BOOKING_URL = 'https://calendly.com/evoln47/30min';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Framework data mirrored from assessment/framework.mjs. Duplicated on purpose:
// this function stays dependency-free and cannot import the ESM framework module.
// The visitor email content is a function of this authored copy only, never of
// client input. Keep in sync with framework.mjs if the copy ever changes.
const QUESTIONS = {
  pov1: { dimension: 'pointOfView', points: [0, 1, 2] },
  pov2: { dimension: 'pointOfView', points: [0, 1, 2] },
  conv1: { dimension: 'conversionSurface', points: [0, 1, 2] },
  conv2: { dimension: 'conversionSurface', points: [0, 1, 2] },
  trust1: { dimension: 'trustAtCapture', points: [0, 1, 2] },
  trust2: { dimension: 'trustAtCapture', points: [0, 1, 2] },
  signal1: { dimension: 'signalToSales', points: [0, 1, 2] },
  signal2: { dimension: 'signalToSales', points: [0, 1, 2] },
};

// [key, label, gap blurb] in the order ties break for the #1 gap.
const DIMENSIONS = [
  ['pointOfView', 'Point of View', 'You are renting the lens buyers research against. A framework licensed to your category makes that lens yours.'],
  ['conversionSurface', 'Conversion Surface', 'You earn attention but your capture leaks it. An assessment converts where a gated PDF cannot.'],
  ['trustAtCapture', 'Trust at Capture', 'Your form taxes trust instead of earning it. A diagnosis gives the buyer a reason to raise their hand.'],
  ['signalToSales', 'Signal to Sales', 'Your reps cold-qualify. A scored, archetyped lead puts the diagnosis on the table before the first call.'],
];

const ARCHETYPES = {
  renter: { key: 'renter', label: 'The Renter', blurb: "Your buyer's research runs on someone else's framework, and your funnel leaks the attention you earn." },
  publisher: { key: 'publisher', label: 'The Publisher', blurb: 'You earn the read, not the lead. Strong point of view, weak conversion and hand-off.' },
  operator: { key: 'operator', label: 'The Operator', blurb: 'You convert attention well, but you compete on the same lens as everyone else. No framework of your own.' },
  authority: { key: 'authority', label: 'The Authority', blurb: 'You own a framework buyers research against, it converts, and it briefs sales. Lock it to your category before a competitor licenses it first.' },
};

// Re-derive the full result from answers. Mirrors assessment/scoring.mjs.
// Returns null if the submission is not a complete, valid set of answers.
function scoreAnswers(answers) {
  if (!Array.isArray(answers)) return null;
  const dimensionScores = { pointOfView: 0, conversionSurface: 0, trustAtCapture: 0, signalToSales: 0 };
  let points = 0;

  for (const id of Object.keys(QUESTIONS)) {
    const q = QUESTIONS[id];
    const a = answers.find((x) => x && x.questionId === id);
    if (!a) return null; // every question must be answered
    const idx = a.choiceIndex;
    if (!Number.isInteger(idx) || idx < 0 || idx >= q.points.length) return null;
    const p = q.points[idx];
    points += p;
    dimensionScores[q.dimension] += p;
  }

  const score = Math.round((points / 16) * 100);

  let archetype;
  if (score < 40) archetype = ARCHETYPES.renter;
  else if (score >= 65) archetype = ARCHETYPES.authority;
  else archetype = dimensionScores.pointOfView >= dimensionScores.conversionSurface ? ARCHETYPES.publisher : ARCHETYPES.operator;

  let gap = null;
  for (const [key, label, blurb] of DIMENSIONS) {
    if (gap === null || dimensionScores[key] < gap.value) gap = { dimension: key, label, blurb, value: dimensionScores[key] };
  }

  return {
    score,
    points,
    dimensionScores,
    archetype: { key: archetype.key, label: archetype.label, blurb: archetype.blurb },
    gap: { dimension: gap.dimension, label: gap.label, blurb: gap.blurb },
  };
}

// Best-effort, in-memory, per-IP rate limit. Serverless instances are reused
// under Fluid Compute, so this throttles a single-source flood but is not a
// substitute for shared-state limiting. Bounded so it cannot grow without limit.
const RL = new Map();
const RL_MAX = 5;
const RL_WINDOW_MS = 10 * 60 * 1000;
const RL_CAP = 5000;
function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const recent = (RL.get(ip) || []).filter((t) => now - t < RL_WINDOW_MS);
  if (recent.length >= RL_MAX) { RL.set(ip, recent); return true; }
  recent.push(now);
  RL.set(ip, recent);
  if (RL.size > RL_CAP) { for (const k of RL.keys()) { RL.delete(k); if (RL.size <= RL_CAP / 2) break; } }
  return false;
}

// Vercel's Node helper usually parses JSON into req.body, but fall back to the
// raw request stream if it does not, so the contract holds without a package.json.
async function readJson(req) {
  if (req.body !== undefined && req.body !== null) return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function band(value) {
  if (value <= 1) return 'low';
  if (value === 2) return 'mid';
  return 'high';
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// One POST to Resend. Throws on a non-2xx so callers can branch on the outcome.
async function sendEmail(apiKey, message) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    const err = new Error(`Resend ${r.status}: ${detail}`);
    err.status = r.status;
    throw err;
  }
  return true;
}

function buildLeadText(email, result) {
  const ds = result.dimensionScores;
  return [
    'New Demand Research Index lead',
    '',
    `Email: ${email}`,
    `Score: ${result.score}/100`,
    `Archetype: ${result.archetype.label}`,
    `#1 gap: ${result.gap.label}`,
    '',
    'Dimension scores (0-4):',
    ...DIMENSIONS.map(([key, label]) => `  ${label}: ${ds[key]}`),
  ].join('\n');
}

function buildVisitorText(result) {
  const ds = result.dimensionScores;
  return [
    'Your Demand Research Index',
    '',
    `Score: ${result.score}/100`,
    `Archetype: ${result.archetype.label}`,
    result.archetype.blurb,
    '',
    'Where you stand:',
    ...DIMENSIONS.map(([key, label]) => {
      const tag = result.gap.dimension === key ? '   (your #1 gap)' : '';
      return `  ${label.padEnd(20)} ${band(ds[key])}${tag}`;
    }),
    '',
    `Your #1 gap: ${result.gap.label}`,
    result.gap.blurb,
    '',
    `Book a call to close the gap: ${BOOKING_URL}`,
    '',
    'You took the Demand Research Index at voranta.co. Reply to this email and it reaches Evan directly.',
  ].join('\n');
}

function buildVisitorHtml(result) {
  const ds = result.dimensionScores;
  const rows = DIMENSIONS.map(([key, label]) => {
    const tag = key === result.gap.dimension
      ? ' <span style="color:#0891B2;font-weight:600;">your gap</span>'
      : '';
    return `
              <tr><td style="padding:6px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td style="font-size:15px;color:#0A0908;">${escapeHtml(label)}</td>
                  <td align="right" style="font-size:14px;font-weight:600;color:#57564F;">${band(ds[key])}${tag}</td>
                </tr></table>
              </td></tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ECF1ED;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECF1ED;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0A0908;">
        <tr><td style="padding-bottom:10px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#0891B2;font-weight:600;">Demand Research Index</td></tr>
        <tr><td style="padding-bottom:6px;">
          <span style="font-size:56px;font-weight:600;line-height:1;">${escapeHtml(result.score)}</span>
          <span style="font-size:20px;color:#57564F;"> / 100</span>
        </td></tr>
        <tr><td style="padding:10px 0 4px;font-size:20px;font-weight:600;">${escapeHtml(result.archetype.label)}</td></tr>
        <tr><td style="padding-bottom:24px;font-size:15px;line-height:1.55;color:#3A3A38;">${escapeHtml(result.archetype.blurb)}</td></tr>

        <tr><td style="border-top:1px solid #D2D8D3;padding:20px 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#57564F;font-weight:600;">Where you stand</td></tr>
        ${rows}

        <tr><td style="border-top:1px solid #D2D8D3;padding:20px 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0891B2;font-weight:600;">Your #1 gap: ${escapeHtml(result.gap.label)}</td></tr>
        <tr><td style="padding-bottom:26px;font-size:15px;line-height:1.55;color:#3A3A38;">${escapeHtml(result.gap.blurb)}</td></tr>

        <tr><td style="padding-bottom:30px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#0891B2;border-radius:8px;">
              <a href="${BOOKING_URL}" style="display:inline-block;padding:13px 24px;color:#ECF1ED;font-size:15px;font-weight:600;text-decoration:none;">Book a call to close the gap</a>
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="border-top:1px solid #D2D8D3;padding-top:16px;font-size:13px;line-height:1.55;color:#57564F;">You took the Demand Research Index at voranta.co. Reply to this email and it reaches Evan directly.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const fwd = req.headers && req.headers['x-forwarded-for'];
  const ip = (typeof fwd === 'string' ? fwd.split(',')[0].trim() : '') || (req.socket && req.socket.remoteAddress) || '';
  if (rateLimited(ip)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch (err) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }
  if (body.website) { res.status(200).json({ ok: true }); return; } // honeypot: silently accept

  const email = String(body.email || '').trim();
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  // Re-derive the result from the answers. Client-supplied score/archetype/gap
  // are ignored so the email can only contain Voranta's own authored copy.
  const result = scoreAnswers(body.answers);
  if (!result) {
    res.status(400).json({ error: 'Invalid answers' });
    return;
  }

  // Primary name is RESEND_API_KEY; also accept "Resend" in case the dashboard var was named that way.
  const apiKey = process.env.RESEND_API_KEY || process.env.Resend;
  if (!apiKey) {
    res.status(500).json({ error: 'Email not configured' });
    return;
  }

  const visitorMessage = {
    from: VISITOR_FROM,
    to: [email],
    reply_to: TO,
    subject: `Your Demand Research Index: ${result.score}/100, ${result.archetype.label}`,
    html: buildVisitorHtml(result),
    text: buildVisitorText(result),
    headers: { 'List-Unsubscribe': `<mailto:${TO}?subject=unsubscribe>` },
  };

  const leadMessage = {
    from: FROM,
    to: [TO],
    reply_to: email,
    subject: `New DRI lead: ${email} (${result.score}/100, ${result.archetype.label})`,
    text: buildLeadText(email, result),
  };

  // Send both independently. The visitor email is what the UI promised them, so
  // its outcome drives the response; a failed lead notification is only logged.
  const [visitorResult, leadResult] = await Promise.allSettled([
    sendEmail(apiKey, visitorMessage),
    sendEmail(apiKey, leadMessage),
  ]);

  if (leadResult.status === 'rejected') {
    console.error('Lead notification send failed', leadResult.reason && leadResult.reason.message);
  }
  if (visitorResult.status === 'rejected') {
    console.error('Visitor breakdown send failed', visitorResult.reason && visitorResult.reason.message);
    res.status(502).json({ error: 'Send failed' });
    return;
  }

  res.status(200).json({ ok: true });
};
