// Contact form endpoint (Vercel serverless function).
// Sends the message to Moni's inbox over SMTP using nodemailer.
// Settings come from Vercel environment variables; see .env.example.

const nodemailer = require('nodemailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REASONS = ['A website', 'An online store', 'A CRM or admin panel', 'A job opportunity', 'Something else'];
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') return Promise.resolve(JSON.parse(req.body));
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 20000) reject(new Error('too large'));
    });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// Reused across warm invocations so a second message skips the TLS + login handshake.
// Short timeouts mean a bad connection fails fast instead of leaving the visitor waiting.
let cachedTransport = null;
let cachedKey = '';
function getTransport(host, portRaw, secureRaw, user, pass) {
  const port = Number(portRaw || 465);
  const key = [host, port, user].join('|');
  if (cachedTransport && cachedKey === key) return cachedTransport;
  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: secureRaw ? secureRaw === 'true' : port === 465,
    auth: { user, pass },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
  cachedKey = key;
  return cachedTransport;
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Send the form with POST.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'local';
  if (rateLimited(ip)) {
    return send(res, 429, { error: 'Too many messages from this address. Try again in a few minutes.' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return send(res, 400, { error: "The form data couldn't be read." });
  }

  const str = (k) => (typeof body[k] === 'string' ? body[k].trim() : '');
  const name = str('name').slice(0, 100).replace(/[\r\n]/g, ' ');
  const email = str('email').slice(0, 200);
  const message = str('message').slice(0, 4000);
  const reason = REASONS.includes(str('reason')) ? str('reason') : 'Something else';

  // Bots fill the hidden field; pretend it worked.
  if (str('company')) return send(res, 200, { ok: true });

  if (!name) return send(res, 400, { error: 'Add your name.' });
  if (!EMAIL_RE.test(email)) return send(res, 400, { error: 'Check the email address.' });
  if (!message) return send(res, 400, { error: 'Write a message.' });

  // Values pasted into Vercel often pick up stray spaces, newlines or quotes; clean them.
  // Gmail shows app passwords as "abcd efgh ijkl mnop", so drop every space from the password.
  const clean = (v) => String(v || '').trim().replace(/^["']|["']$/g, '').trim();
  const SMTP_HOST = clean(process.env.SMTP_HOST);
  const SMTP_PORT = clean(process.env.SMTP_PORT);
  const SMTP_USER = clean(process.env.SMTP_USER);
  const SMTP_PASS = clean(process.env.SMTP_PASS).replace(/\s+/g, '');
  const SMTP_SECURE = clean(process.env.SMTP_SECURE);
  const CONTACT_TO_EMAIL = clean(process.env.CONTACT_TO_EMAIL);
  const CONTACT_FROM_EMAIL = clean(process.env.CONTACT_FROM_EMAIL);
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) {
    console.error('[contact] SMTP is not configured. Set the environment variables in Vercel.');
    return send(res, 503, { error: "The contact form isn't connected to email yet. Please email monikashyap902@gmail.com directly." });
  }

  const transporter = getTransport(SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS);

  try {
    await transporter.sendMail({
      from: CONTACT_FROM_EMAIL || `Portfolio contact <${SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      // Object form lets nodemailer quote names with <, >, :, commas or quotes safely.
      replyTo: { name, address: email },
      subject: `${reason}: message from ${name}`,
      text: `${name} (${email})\nLooking for: ${reason}\n\n${message}`,
      html:
        `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)})</p>` +
        `<p>Looking for: ${escapeHtml(reason)}</p>` +
        `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
  } catch (err) {
    console.error('[contact] SMTP error', err && err.code, err && err.responseCode, err && err.response);
    // Drop the cached connection so the next try starts fresh (e.g. after fixing the password).
    cachedTransport = null;
    // The code is safe to share (no secrets) and tells the owner what to fix, e.g. EAUTH / 535 = wrong app password.
    return send(res, 502, {
      error: "The email server didn't accept the message. Please try again, or email directly.",
      code: (err && err.code) || 'SMTP',
      smtp: (err && err.responseCode) || null,
    });
  }

  return send(res, 200, { ok: true });
};
