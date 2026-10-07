const services = new Set(['Web design', 'UI/UX design', 'App Prototyping', 'Logo and visual identity', 'Graphic design', 'Desktop publishing', 'Other']);

async function notifyEnquiry(env, lead) {
  if (!env.BREVO_API_KEY) {
    console.warn('Enquiry notification skipped', { leadId: lead.id, reason: 'missing_api_key' });
    return;
  }
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: 'Ros Veluz Portfolio', email: 'hello@rosveluz.com' },
        to: [{ name: 'Ros Veluz', email: 'hello@rosveluz.com' }],
        replyTo: { email: lead.email },
        subject: `Portfolio enquiry: ${lead.service}`,
        textContent: [
          'New portfolio enquiry', '', `Reference: ${lead.id}`,
          `Name: ${lead.name}`, `Email: ${lead.email}`,
          `Company: ${lead.company || 'Not provided'}`, `Country: ${lead.country}`,
          `Service: ${lead.service}`, '', 'Project details:', lead.message,
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error('Enquiry notification rejected', { leadId: lead.id, status: response.status });
      return;
    }
    console.info('Enquiry notification accepted by Brevo', { leadId: lead.id });
  } catch {
    console.error('Enquiry notification unavailable', { leadId: lead.id });
  }
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
    if (origin === env.ALLOWED_ORIGIN) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type';
    }
    const reply = (body, status, diagnostics = {}) => {
      if (status === 400) console.warn('Enquiry submission rejected', { status, reason: body.error, ...diagnostics });
      return Response.json(body, { status, headers });
    };
    if (new URL(request.url).pathname !== '/submit') return reply({ error: 'Not found' }, 404);
    if (!env.ALLOWED_ORIGIN || !env.TURNSTILE_SECRET || !env.DB) return reply({ error: 'The contact service is not configured yet. Please email me directly.' }, 503);
    if (origin !== env.ALLOWED_ORIGIN) return reply({ error: 'Origin not allowed' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply({ error: 'JSON required' }, 415);
    let payload;
    try {
      const reader = request.body?.getReader();
      if (!reader) return reply({ error: 'Missing form data' }, 400);
      const decoder = new TextDecoder();
      let body = '', bytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 16384) { await reader.cancel(); return reply({ error: 'Form data is too large' }, 413); }
        body += decoder.decode(value, { stream: true });
      }
      payload = JSON.parse(body + decoder.decode());
    } catch { return reply({ error: 'Invalid form data' }, 400); }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return reply({ error: 'Invalid form data' }, 400);
    const text = (key, max) => typeof payload[key] === 'string' && payload[key].trim().length <= max ? payload[key].trim() : '';
    const name = text('name', 100), email = text('email', 254), company = text('company', 150);
    const country = text('country', 100), service = text('service', 100), message = text('message', 5000);
    const token = text('turnstileToken', 2048);
    const invalidFields = Object.entries({
      name: !name, email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), country: !country,
      service: !services.has(service), message: message.length < 10, turnstileToken: !token,
    }).filter(([, invalid]) => invalid).map(([field]) => field);
    if (invalidFields.length) {
      return reply({ error: 'Please complete the required fields and verification.' }, 400, { invalidFields });
    }
    try {
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: request.headers.get('CF-Connecting-IP') || undefined }),
        signal: AbortSignal.timeout(10000),
      });
      if (!verification.ok) return reply({ error: 'Verification is unavailable. Please try again.' }, 503);
      const result = await verification.json();
      if (!result.success || result.hostname !== new URL(env.ALLOWED_ORIGIN).hostname || result.action !== 'contact') {
        return reply({ error: 'Verification expired or failed. Please try again.' }, 400, {
          verificationSucceeded: result.success === true,
          hostnameMatches: result.hostname === new URL(env.ALLOWED_ORIGIN).hostname,
          actionMatches: result.action === 'contact',
        });
      }
      const campaign = payload.campaign && typeof payload.campaign === 'object' ? payload.campaign : {};
      const metadata = (key) => typeof campaign[key] === 'string' ? campaign[key].slice(0, 200) : '';
      const id = crypto.randomUUID();
      await env.DB.prepare(`INSERT INTO leads (id, name, email, company, country, service, message, utm_source, utm_medium, utm_campaign, utm_content, utm_term, landing_page) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(id, name, email, company, country, service, message, ...['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'landing_page'].map(metadata)).run();
      // Keep delivery independent of the saved enquiry and the visitor's response.
      const notification = notifyEnquiry(env, { id, name, email, company, country, service, message });
      if (ctx?.waitUntil) ctx.waitUntil(notification);
      else await notification;
      return reply({ success: true }, 201);
    } catch { return reply({ error: 'Your enquiry could not be saved. Please try again or email me directly.' }, 503); }
  },
};
