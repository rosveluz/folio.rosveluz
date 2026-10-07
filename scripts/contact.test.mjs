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
    window: { turnstile: { render(element, options) { callbacks = options; return 1; }, reset() {} }, gtag() { analytics++; } },
    location: { search: '', pathname: '/contact/' }, sessionStorage: { getItem: () => '{}' },
    URLSearchParams, AbortSignal,
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
