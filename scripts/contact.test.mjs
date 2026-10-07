import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import worker from '../cloudflare/contact-worker.js';

const origin = 'https://folio.rosveluz.com';
const payload = { name: 'Test Person', email: 'test@example.com', company: '', country: 'Australia', service: 'Web design', message: 'A new website project.', turnstileToken: 'test-token' };
const request = (body = payload, requestOrigin = origin) => new Request('https://example.workers.dev/submit', {
  method: 'POST', headers: { Origin: requestOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

test('form records a lead event only after acceptance and prevents duplicate submissions', async () => {
  const source = await readFile(new URL('../contact-form.js', import.meta.url), 'utf8');
  let submit, callbacks, accepted = false, analytics = 0, requests = 0;
  const button = { disabled: true }, status = { textContent: '' };
  const form = {
    isConnected: true, reset() {}, reportValidity: () => true,
    querySelector: (selector) => selector === '[type="submit"]' ? button : selector === '[data-contact-status]' ? status : {},
    addEventListener(event, handler) { if (event === 'submit') submit = handler; },
  };
  const context = vm.createContext({
    window: { turnstile: { ready(callback) { callback(); }, render(element, options) { callbacks = options; return 1; }, reset() {} }, gtag() { analytics++; } },
    location: { search: '', pathname: '/contact/' }, sessionStorage: { getItem: () => '{}' },
    URLSearchParams, AbortSignal, setTimeout: () => 1, clearTimeout() {},
    FormData: class { [Symbol.iterator]() { return Object.entries(payload)[Symbol.iterator](); } },
    fetch: async () => { requests++; return { ok: accepted, json: async () => accepted ? { success: true } : { error: 'Please try again.' } }; },
  });
  vm.runInContext(source.replace('export async function', 'async function'), context);
  context.form = form;
  await vm.runInContext('initContactForm(form)', context);
  callbacks.callback('verified-token');
  await submit({ preventDefault() {} });
  assert.equal(analytics, 0);
  assert.equal(status.textContent, 'Please try again.');
  accepted = true;
  callbacks.callback('new-token');
  await submit({ preventDefault() {} });
  assert.equal(analytics, 1);
  assert.equal(button.textContent, 'Enquiry sent');
  await submit({ preventDefault() {} });
  assert.equal(requests, 2);
});

test('verification reports stalled script loading and stalled challenges without enabling submission', async () => {
  const source = await readFile(new URL('../contact-form.js', import.meta.url), 'utf8');
  for (const scriptReady of [false, true]) {
    const timers = new Map();
    let nextTimer = 0, callbacks, removed = false;
    const button = { disabled: true }, status = { textContent: 'Loading verification...' };
    const form = {
      isConnected: true,
      querySelector: (selector) => selector === '[type="submit"]' ? button : selector === '[data-contact-status]' ? status : {},
      addEventListener() {},
    };
    const context = vm.createContext({
      window: scriptReady ? { turnstile: { ready(callback) { callback(); }, render(element, options) { callbacks = options; return 1; } } } : {},
      document: { createElement: () => ({ remove() { removed = true; } }), head: { append() {} } },
      location: { search: '', pathname: '/contact/' }, URLSearchParams,
      setTimeout(callback, delay) { timers.set(++nextTimer, { callback, delay }); return nextTimer; },
      clearTimeout(id) { timers.delete(id); }, form,
    });
    vm.runInContext(source.replace('export async function', 'async function'), context);
    const initialization = vm.runInContext('initContactForm(form)', context);
    await Promise.resolve();
    const timer = [...timers.values()][0];
    assert.equal(timer.delay, scriptReady ? 40000 : 15000);
    timer.callback();
    await initialization;
    assert.match(status.textContent, /taking (too long|longer than expected)/);
    assert.equal(button.disabled, true);
    if (scriptReady) {
      callbacks.callback('late-valid-token');
      assert.equal(button.disabled, false);
      assert.equal(status.textContent, '');
      assert.equal(timers.size, 0);
    } else assert.equal(removed, true);
  }
});

test('contact endpoint rejects other origins and invalid input before verification', async () => {
  const env = { ALLOWED_ORIGIN: origin, TURNSTILE_SECRET: 'test-secret', DB: {} };
  assert.equal((await worker.fetch(request(payload, 'https://other.example'), env)).status, 403);
  assert.equal((await worker.fetch(request({ ...payload, email: 'invalid' }), env)).status, 400);
  assert.equal((await worker.fetch(request({ ...payload, turnstileToken: '' }), env)).status, 400);
  assert.equal((await worker.fetch(request(null), env)).status, 400);
  assert.equal((await worker.fetch(request({ ...payload, message: 'x'.repeat(20000) }), env)).status, 413);
  const preflight = await worker.fetch(new Request('https://example.workers.dev/submit', { method: 'OPTIONS', headers: { Origin: origin } }), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
});

test('only verified contact tokens save a parameterized lead; database failures do not report success', async () => {
  const originalFetch = globalThis.fetch;
  const originalCrypto = globalThis.crypto;
  globalThis.crypto = webcrypto;
  let written = 0, parameters, verification;
  const env = {
    ALLOWED_ORIGIN: origin, TURNSTILE_SECRET: 'test-secret',
    DB: { prepare(sql) { assert.ok(sql.includes('VALUES (?, ?')); return { bind(...values) { parameters = values; return { async run() { written++; } }; } }; } },
  };
  globalThis.fetch = async (url) => {
    assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    return Response.json(verification);
  };
  try {
    for (const result of [{ success: false }, { success: true, hostname: 'other.example', action: 'contact' }, { success: true, hostname: 'folio.rosveluz.com', action: 'login' }]) {
      verification = result;
      assert.equal((await worker.fetch(request(), env)).status, 400);
      assert.equal(written, 0);
    }
    verification = { success: true, hostname: 'folio.rosveluz.com', action: 'contact' };
    const accepted = await worker.fetch(request({ ...payload, campaign: { utm_source: 'google' } }), env);
    assert.equal(accepted.status, 201);
    assert.equal((await accepted.json()).success, true);
    assert.equal(written, 1);
    assert.equal(parameters[1], payload.name);
    assert.equal(parameters[7], 'google');
    env.DB.prepare = () => { throw new Error('Database unavailable'); };
    assert.equal((await worker.fetch(request(), env)).status, 503);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.crypto = originalCrypto;
  }
});

test('Brevo notifications run after saving, use visitor Reply-To, and do not expose secrets or change acceptance on failure', async () => {
  const originalFetch = globalThis.fetch, originalCrypto = globalThis.crypto;
  const originalLog = { info: console.info, warn: console.warn, error: console.error };
  globalThis.crypto = webcrypto;
  const logs = [];
  for (const level of Object.keys(originalLog)) console[level] = (...values) => logs.push(values);
  let saved = false, failDatabase = false, calls = 0, mode = 'success', sent;
  const env = {
    ALLOWED_ORIGIN: origin, TURNSTILE_SECRET: 'test-secret', BREVO_API_KEY: 'private-api-key',
    DB: { prepare() { return { bind() { return { async run() { if (failDatabase) throw new Error('Unavailable'); saved = true; } }; } }; } },
  };
  globalThis.fetch = async (url, options) => {
    if (url.includes('siteverify')) return Response.json({ success: true, hostname: 'folio.rosveluz.com', action: 'contact' });
    assert.equal(url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(saved, true);
    assert.equal(options.headers['api-key'], env.BREVO_API_KEY);
    assert.equal(options.method, 'POST');
    calls++;
    sent = JSON.parse(options.body);
    if (mode === 'network') throw new Error('Sensitive provider details');
    return Response.json(mode === 'success' ? { messageId: 'example' } : { error: 'Rejected' }, { status: mode === 'success' ? 201 : 401 });
  };
  try {
    for (mode of ['success', 'rejected', 'network']) {
      saved = false;
      const background = [];
      const result = await worker.fetch(request({ ...payload, message: '<script>not HTML</script>' }), env, { waitUntil(promise) { background.push(promise); } });
      assert.equal(result.status, 201);
      assert.deepEqual(await result.json(), { success: true });
      assert.equal(background.length, 1);
      await Promise.all(background);
      assert.equal(sent.sender.email, 'hello@rosveluz.com');
      assert.equal(sent.to[0].email, 'hello@rosveluz.com');
      assert.equal(sent.replyTo.email, payload.email);
      assert.ok(sent.textContent.includes('<script>not HTML</script>'));
      assert.equal(sent.htmlContent, undefined);
      assert.ok(!JSON.stringify(sent).includes(payload.turnstileToken));
    }
    assert.equal(calls, 3);
    delete env.BREVO_API_KEY;
    assert.equal((await worker.fetch(request(), env)).status, 201);
    assert.equal(calls, 3);
    failDatabase = true;
    assert.equal((await worker.fetch(request(), env)).status, 503);
    assert.equal((await worker.fetch(request({ ...payload, turnstileToken: '' }), env)).status, 400);
    assert.equal(calls, 3);
    const logText = JSON.stringify(logs);
    for (const sensitive of ['private-api-key', payload.email, payload.name, payload.message, 'Sensitive provider details']) {
      assert.ok(!logText.includes(sensitive));
    }
    assert.match(logText, /missing_api_key/);
    assert.match(logText, /401/);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.crypto = originalCrypto;
    Object.assign(console, originalLog);
  }
});
