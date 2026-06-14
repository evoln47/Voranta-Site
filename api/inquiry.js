// Vercel serverless function (Node runtime, CommonJS, no dependencies).
// Handles founding-sponsor inquiry form submissions. Sends one notification
// email to Evan (must succeed; drives the response) and an optional plain-text
// confirmation to the inquirer (best-effort; a failure is logged, not surfaced).
//
// Security: all inputs are validated and length-capped before use. Both emails
// are plain text only so user-supplied text cannot inject markup. EMAIL_RE
// forbids whitespace (including CRLF) in every value that touches the subject
// or reply_to header. A best-effort per-IP rate limit and a honeypot field
// blunt casual abuse.

const FROM         = process.env.LEAD_FROM    || 'Voranta <noreply@voranta.co>';
const TO           = process.env.LEAD_TO      || 'evan@voranta.co';
// Generic sender for the visitor confirmation (not a named human) to limit
// impersonation risk. Replies reach Evan via reply_to on the notification.
const VISITOR_FROM = process.env.VISITOR_FROM || 'Voranta <noreply@voranta.co>';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Field length caps. Email is also constrained by RFC 5321 (254 chars max).
const EMAIL_MAX_LEN   = 254;
const COMPANY_MAX_LEN = 200;
const MESSAGE_MAX_LEN = 2000;

// Best-effort, in-memory, per-IP rate limit. Serverless instances are reused
// under Fluid Compute, so this throttles a single-source flood but is not a
// substitute for shared-state limiting. Bounded so it cannot grow without limit.
const RL          = new Map();
const RL_MAX      = 5;
const RL_WINDOW_MS = 10 * 60 * 1000;
const RL_CAP      = 5000;
function rateLimited(ip) {
  if (!ip) return false;
  const now    = Date.now();
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
    const err    = new Error(`Resend ${r.status}: ${detail}`);
    err.status   = r.status;
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
  const ip  = (typeof fwd === 'string' ? fwd.split(',')[0].trim() : '') || (req.socket && req.socket.remoteAddress) || '';
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
  if (email.length > EMAIL_MAX_LEN) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  // Optional fields: treat non-strings as absent; then truncate to cap.
  const companyRaw = typeof body.company === 'string' ? body.company.trim() : '';
  const messageRaw = typeof body.message === 'string' ? body.message.trim() : '';
  const company    = companyRaw.slice(0, COMPANY_MAX_LEN);
  const message    = messageRaw.slice(0, MESSAGE_MAX_LEN);

  // Primary name is RESEND_API_KEY; also accept "Resend" in case the dashboard var was named that way.
  const apiKey = process.env.RESEND_API_KEY || process.env.Resend;
  if (!apiKey) {
    res.status(500).json({ error: 'Email not configured' });
    return;
  }

  // Build the notification body as an array of labeled lines so the structure
  // is clear in any email client and optional fields are included only when present.
  const notifLines = [
    'New founding sponsor inquiry',
    '',
    `Email: ${email}`,
  ];
  if (company) notifLines.push(`Company: ${company}`);
  if (message) { notifLines.push('', `Message:`, message); }

  const notificationMessage = {
    from:     FROM,
    to:       [TO],
    reply_to: email,
    subject:  `New founding sponsor inquiry: ${email}`,
    text:     notifLines.join('\n'),
  };

  // Brief acknowledgement to the inquirer. Templated copy only; the user's
  // message is NOT echoed back to eliminate any re-injection vector.
  const confirmationMessage = {
    from:     VISITOR_FROM,
    to:       [email],
    reply_to: TO,
    subject:  'Your inquiry reached Voranta',
    text:     [
      'Thank you for reaching out about the Voranta founding sponsor program.',
      '',
      'Evan will follow up directly. In the meantime, feel free to reply to this email with any questions.',
      '',
      'Voranta',
      'voranta.co',
    ].join('\n'),
  };

  // The notification to Evan is the must-succeed email; its outcome drives the
  // response. The visitor confirmation is best-effort: a failure is logged but
  // does not alter the HTTP response (the inverse of lead.js, which surfaces the
  // visitor email outcome).
  const [notifResult, confirmResult] = await Promise.allSettled([
    sendEmail(apiKey, notificationMessage),
    sendEmail(apiKey, confirmationMessage),
  ]);

  if (confirmResult.status === 'rejected') {
    console.error('Inquiry confirmation send failed', confirmResult.reason && confirmResult.reason.message);
  }
  if (notifResult.status === 'rejected') {
    console.error('Inquiry notification send failed', notifResult.reason && notifResult.reason.message);
    res.status(502).json({ error: 'Send failed' });
    return;
  }

  res.status(200).json({ ok: true });
};
