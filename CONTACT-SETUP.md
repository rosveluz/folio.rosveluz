# Contact Form Setup

The portfolio stays on GitHub Pages. The contact form posts to `https://portfolio-contact.rosveluz.workers.dev/submit`.

## Cloudflare Deployment

1. Open D1 > portfolio-leads > Console. Run the SQL in `cloudflare/schema.sql` to create the leads table and its index.
2. Open the portfolio-contact Worker > Edit Code. Replace the starter handler with `cloudflare/contact-worker.js`, then deploy.
3. Confirm the D1 binding is named `DB` and points to portfolio-leads.
4. Confirm `TURNSTILE_SECRET` is stored as an encrypted secret. Keep it out of source code and screenshots.
5. Confirm the text variable `ALLOWED_ORIGIN` is exactly `https://folio.rosveluz.com` (no trailing slash).
6. Confirm the Turnstile widget permits `folio.rosveluz.com`. The public site key is configured in `contact-form.js`.
7. Run `npm run build` and `npm test`, then publish the updated static site through the existing GitHub Pages workflow.

Worker source and this guide are excluded from GitHub Pages by `_config.yml`.

## Verify

- Submit a real test enquiry from the published `/contact/` page.
- In D1 Console, run `SELECT name, service, status, created_at FROM leads ORDER BY created_at DESC LIMIT 10;` and confirm the row exists.
- In GA4 Realtime, confirm `generate_lead` appears after a successful submission. Analytics does not receive names, email addresses or messages.
- Check campaign attribution using a link such as `/contact/?utm_source=test&utm_medium=manual&utm_campaign=form-check`. Attribution is stored for the browser session when visitors move between pages.
- A missing or invalid Turnstile token must be rejected. The Worker also checks the verification hostname and `contact` action.

Only the production origin is accepted. Local preview can show the form, but cannot submit to the production Worker. Use a separate staging Worker and Turnstile testing keys for local integration tests.

Enquiries are saved to D1. Brevo notifications can be enabled as described below. Administrator login, a private dashboard and follow-up automation are not included yet. The public Worker provides no endpoint to read leads.

## Brevo Notifications

1. In Brevo, authenticate `rosveluz.com` and add the verified sender `hello@rosveluz.com`. Keep Cloudflare's incoming-mail MX records unchanged.
2. In Settings > SMTP & API > API keys & MCP, generate a separate API key named `Portfolio contact worker`. This is an API key, not the SMTP key used by Gmail. Do not share it or put it in the website source.
3. In Cloudflare > Workers & Pages > portfolio-contact > Settings > Variables and Secrets, add `BREVO_API_KEY` as an encrypted production secret containing that key. Preserve `TURNSTILE_SECRET`, `ALLOWED_ORIGIN`, and the `DB` binding.
4. Replace the deployed Worker code with the updated `cloudflare/contact-worker.js` and deploy. Publishing GitHub Pages does not deploy this Worker.
5. Submit a new test enquiry. Confirm the D1 row, then check the inbox/spam folder receiving mail forwarded from `hello@rosveluz.com`. The notification's Reply-To is the visitor's address.
6. Check Brevo > Transactional > Logs for delivery status. Worker logs show acceptance, rejection status, unavailable delivery, or a missing key using the lead reference, without logging personal data or credentials.

Notifications are plain-text messages from `hello@rosveluz.com` to `hello@rosveluz.com`, forwarded by Cloudflare to the verified Gmail destination. No marketing contact is created and no automatic email is sent to the visitor.

The Worker attempts delivery in the background only after D1 saves the enquiry. A missing key or email failure does not change the successful form response. Notifications have a 10-second request timeout and are best-effort: there is no durable retry queue yet. D1 remains the source of truth; check it if delivery fails. Brevo API acceptance does not guarantee inbox delivery. Submitted details are sent to Brevo for notification delivery.

## Maintenance

Keep the deployed Worker in sync with `cloudflare/contact-worker.js` when backend code changes. No Wrangler deployment is configured here, so site builds do not deploy the Worker.

Turnstile reduces spam; it does not eliminate it. Monitor Worker usage and rejected submissions, and add rate limiting if abuse warrants it. Store and delete enquiry data according to your retention policy.
