// Vercel serverless function (Node runtime, CommonJS, no dependencies).
// On a Demand Research Index submission this sends two emails via the Resend
// REST API: the visitor's own diagnosis to the address they entered, and a
// pre-diagnosed lead notification to Evan.

const FROM = process.env.LEAD_FROM || 'Voranta <noreply@voranta.co>';
const TO = process.env.LEAD_TO || 'evan@voranta.co';
// The visitor-facing email is a trust moment, so it comes from a named human by
// default. Replies land in Evan's inbox because the address is evan@voranta.co.
const VISITOR_FROM = process.env.VISITOR_FROM || 'Evan at Voranta <evan@voranta.co>';
const BOOKING_URL = 'https://calendly.com/evoln47/30min';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Dimension order and labels, mirrored from assessment/framework.mjs. Duplicated
// here on purpose: this function stays dependency-free and cannot import the ESM
// framework module. These labels are stable; update both if they ever change.
const DIMENSIONS = [
  ['pointOfView', 'Point of View'],
  ['conversionSurface', 'Conversion Surface'],
  ['trustAtCapture', 'Trust at Capture'],
  ['signalToSales', 'Signal to Sales'],
];

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

function buildLeadText(email, body, ds, archetypeLabel) {
  return [
    'New Demand Research Index lead',
    '',
    `Email: ${email}`,
    `Score: ${body.score}/100`,
    `Archetype: ${archetypeLabel}`,
    `#1 gap: ${body.gap && body.gap.label}`,
    '',
    'Dimension scores (0-4):',
    ...DIMENSIONS.map(([key, label]) => `  ${label}: ${ds[key]}`),
    '',
    `Answers: ${JSON.stringify(body.answers)}`,
  ].join('\n');
}

function buildVisitorText(body, ds, archetypeLabel, archetypeBlurb, gapLabel, gapBlurb) {
  return [
    'Your Demand Research Index',
    '',
    `Score: ${body.score}/100`,
    `Archetype: ${archetypeLabel}`,
    archetypeBlurb,
    '',
    'Where you stand:',
    ...DIMENSIONS.map(([key, label]) => {
      const tag = body.gap && body.gap.dimension === key ? '   (your #1 gap)' : '';
      return `  ${label.padEnd(20)} ${band(ds[key])}${tag}`;
    }),
    '',
    `Your #1 gap: ${gapLabel}`,
    gapBlurb,
    '',
    `Book a call to close the gap: ${BOOKING_URL}`,
    '',
    'You took the Demand Research Index at voranta.co. Reply to this email and it reaches Evan directly.',
  ].join('\n');
}

function buildVisitorHtml(body, ds, archetypeLabel, archetypeBlurb, gapLabel, gapBlurb) {
  const gapKey = body.gap && body.gap.dimension;
  const rows = DIMENSIONS.map(([key, label]) => {
    const isGap = key === gapKey;
    const tag = isGap
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
          <span style="font-size:56px;font-weight:600;line-height:1;">${escapeHtml(body.score)}</span>
          <span style="font-size:20px;color:#57564F;"> / 100</span>
        </td></tr>
        <tr><td style="padding:10px 0 4px;font-size:20px;font-weight:600;">${escapeHtml(archetypeLabel)}</td></tr>
        <tr><td style="padding-bottom:24px;font-size:15px;line-height:1.55;color:#3A3A38;">${escapeHtml(archetypeBlurb)}</td></tr>

        <tr><td style="border-top:1px solid #D2D8D3;padding:20px 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#57564F;font-weight:600;">Where you stand</td></tr>
        ${rows}

        <tr><td style="border-top:1px solid #D2D8D3;padding:20px 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0891B2;font-weight:600;">Your #1 gap: ${escapeHtml(gapLabel)}</td></tr>
        <tr><td style="padding-bottom:26px;font-size:15px;line-height:1.55;color:#3A3A38;">${escapeHtml(gapBlurb)}</td></tr>

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

  // Primary name is RESEND_API_KEY; also accept "Resend" in case the dashboard var was named that way.
  const apiKey = process.env.RESEND_API_KEY || process.env.Resend;
  if (!apiKey) {
    res.status(500).json({ error: 'Email not configured' });
    return;
  }

  const ds = body.dimensionScores || {};
  const archetypeLabel = (body.archetype && body.archetype.label) || '';
  const archetypeBlurb = (body.archetype && body.archetype.blurb) || '';
  const gapLabel = (body.gap && body.gap.label) || '';
  const gapBlurb = (body.gap && body.gap.blurb) || '';

  const visitorMessage = {
    from: VISITOR_FROM,
    to: [email],
    subject: `Your Demand Research Index: ${body.score}/100, ${archetypeLabel}`,
    html: buildVisitorHtml(body, ds, archetypeLabel, archetypeBlurb, gapLabel, gapBlurb),
    text: buildVisitorText(body, ds, archetypeLabel, archetypeBlurb, gapLabel, gapBlurb),
  };

  const leadMessage = {
    from: FROM,
    to: [TO],
    reply_to: email,
    subject: `New DRI lead: ${email} (${body.score}/100, ${archetypeLabel})`,
    text: buildLeadText(email, body, ds, archetypeLabel),
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
