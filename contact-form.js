const endpoint = 'https://portfolio-contact.rosveluz.workers.dev/submit';
const sitekey = '0x4AAAAAAFQYsHMhBtZL4nTX';
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
let turnstileReady;

try {
  const params = new URLSearchParams(location.search);
  if (campaignKeys.some((key) => params.has(key))) {
    const campaign = Object.fromEntries(campaignKeys.map((key) => [key, (params.get(key) || '').slice(0, 200)]));
    campaign.landing_page = location.pathname;
    sessionStorage.setItem('enquiry_campaign', JSON.stringify(campaign));
  }
} catch { /* Storage can be unavailable in private browsing. */ }

function loadTurnstile() {
  if (window.turnstile) return new Promise((resolve) => window.turnstile.ready(() => resolve(window.turnstile)));
  if (!turnstileReady) {
    turnstileReady = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        if (error) {
          script.remove();
          reject(error);
        } else resolve(window.turnstile);
      };
      const timeout = setTimeout(() => finish(new Error('Verification is taking too long to load. Please refresh or email me directly.')), 15000);
      window.onContactTurnstileReady = () => finish();
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onContactTurnstileReady';
      script.async = true;
      script.onerror = () => finish(new Error('Verification could not load. Please refresh or email me directly.'));
      document.head.append(script);
    });
  }
  return turnstileReady;
}

export async function initContactForm(form) {
  if (!form) return;
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('[data-contact-status]');
  let token = '';
  let widget;
  let submitting = false;
  let completed = false;
  let submissionError = false;
  let verificationTimer;
  const waitForVerification = () => {
    clearTimeout(verificationTimer);
    verificationTimer = setTimeout(() => {
      if (form.isConnected && !token && !submitting && !completed) {
        status.textContent = 'Verification is taking longer than expected. Please refresh or email me directly.';
      }
    }, 40000);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || completed || !token || !form.reportValidity()) return;
    submitting = true;
    submissionError = false;
    button.disabled = true;
    button.textContent = 'Sending...';
    status.textContent = '';
    try {
      const payload = Object.fromEntries(new FormData(form));
      payload.turnstileToken = token;
      try { payload.campaign = JSON.parse(sessionStorage.getItem('enquiry_campaign') || '{}'); } catch { payload.campaign = {}; }
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error(result?.error || 'Your enquiry could not be sent. Please try again or email me directly.');
      completed = true;
      status.textContent = 'Thank you. Your enquiry has been received.';
      button.textContent = 'Enquiry sent';
      form.reset();
      try { window.gtag?.('event', 'generate_lead', { service: payload.service }); } catch { /* Analytics must not interrupt confirmation. */ }
    } catch (error) {
      submissionError = true;
      status.textContent = error.name === 'TimeoutError' ? 'The request timed out. Please email me if you are unsure it was received.' : (error.message === 'Failed to fetch' ? 'Unable to connect. Please try again or email me directly.' : error.message);
      button.textContent = 'Send enquiry';
    } finally {
      submitting = false;
      token = '';
      if (!completed && widget !== undefined) {
        waitForVerification();
        window.turnstile.reset(widget);
      }
    }
  });

  try {
    const turnstile = await loadTurnstile();
    if (!form.isConnected) return;
    status.textContent = 'Verifying...';
    waitForVerification();
    widget = turnstile.render(form.querySelector('[data-turnstile]'), {
      sitekey, action: 'contact', size: 'flexible',
      callback(value) { clearTimeout(verificationTimer); token = value; button.disabled = submitting || completed; if (!submitting && !completed && !submissionError) status.textContent = ''; },
      'expired-callback'() { token = ''; button.disabled = true; status.textContent = 'Verification expired. Verifying again...'; waitForVerification(); },
      'error-callback'(code) {
        clearTimeout(verificationTimer);
        token = '';
        button.disabled = true;
        status.textContent = 'Verification failed. Please refresh or email me directly.';
        console.error('Turnstile verification error', { code, hostname: location.hostname });
      },
    });
  } catch (error) {
    clearTimeout(verificationTimer);
    status.textContent = error.message;
  }
}
