// Vercel serverless function (Node runtime, CommonJS, no dependencies).
// On a Research Conversion Index submission this sends two emails via the Resend
// REST API: the visitor's own diagnosis to the address they entered, and a
// pre-diagnosed lead notification to Evan.
//
// Security: the endpoint is unauthenticated, so it must not let a caller put
// arbitrary text into a voranta.co-branded email or spoof a result. The score,
// archetype, and gap are re-derived server-side (in ./_dri.js) from the
// submitted answers; client-supplied score/archetype/gap fields are ignored.
// A best-effort per-IP rate limit and the honeypot blunt casual abuse.
//
// The data, scoring, and email rendering live in ./_dri.js so this entrypoint
// stays small. (Inlining the large embedded HTML kept Vercel's zero-config from
// detecting this file as a function.)

const { scoreAnswers, buildLeadText, buildVisitorText, buildVisitorHtml, buildVisitorSubject } = require('./_dri.js');

const FROM = process.env.LEAD_FROM || 'Voranta <noreply@voranta.co>';
const TO = process.env.LEAD_TO || 'evan@voranta.co';
// Generic sender identity (not a named human) to limit impersonation if abused.
// Replies still reach Evan via reply_to. Override with VISITOR_FROM if desired.
const VISITOR_FROM = process.env.VISITOR_FROM || 'Voranta <noreply@voranta.co>';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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
    subject: buildVisitorSubject(result),
    html: buildVisitorHtml(result),
    text: buildVisitorText(result),
    headers: { 'List-Unsubscribe': `<mailto:${TO}?subject=unsubscribe>` },
  };

  const leadMessage = {
    from: FROM,
    to: [TO],
    reply_to: email,
    subject: `New RCI lead: ${email} (${result.score}/100, ${result.archetype.label})`,
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
