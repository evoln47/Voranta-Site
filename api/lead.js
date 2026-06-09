// Vercel serverless function (Node runtime, CommonJS, no dependencies).
// Emails a pre-diagnosed Demand Research Index lead via the Resend REST API.

const FROM = process.env.LEAD_FROM || 'Voranta <noreply@voranta.co>';
const TO = process.env.LEAD_TO || 'evan@voranta.co';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Vercel's Node helper usually parses JSON into req.body, but fall back to the
// raw request stream if it does not, so the contract holds without a package.json.
async function readJson(req) {
  if (req.body !== undefined && req.body !== null) return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Email not configured' });
    return;
  }

  const ds = body.dimensionScores || {};
  const archetypeLabel = body.archetype && body.archetype.label;
  const text = [
    'New Demand Research Index lead',
    '',
    `Email: ${email}`,
    `Score: ${body.score}/100`,
    `Archetype: ${archetypeLabel}`,
    `#1 gap: ${body.gap && body.gap.label}`,
    '',
    'Dimension scores (0-4):',
    `  Point of View: ${ds.pointOfView}`,
    `  Conversion Surface: ${ds.conversionSurface}`,
    `  Trust at Capture: ${ds.trustAtCapture}`,
    `  Signal to Sales: ${ds.signalToSales}`,
    '',
    `Answers: ${JSON.stringify(body.answers)}`,
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `New DRI lead: ${email} (${body.score}/100, ${archetypeLabel})`,
        text,
      }),
    });
    if (!r.ok) { res.status(502).json({ error: 'Send failed' }); return; }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: 'Send failed' });
  }
};
