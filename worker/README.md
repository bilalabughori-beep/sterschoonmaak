# Ster Schoonmaak Worker — chatbot and backoffice

This is a separate Cloudflare Worker for the Ster Schoonmaak customer-support chatbot. The Next.js site remains a static export hosted on Firebase. The Worker keeps the conversation state machine and validation on the server, uses Cloudflare Workers AI only for constrained free-text extraction, and persists confirmed leads in the existing Supabase project.

## Runtime

- Worker name: `ster-schoonmaak-chatbot-dev`
- AI model: `@cf/meta/llama-3.2-1b-instruct`
- Binding: `ai.binding = "AI"`, available as `env.AI`
- Endpoints: `GET /health`, `GET /version`, `POST /chat`, `POST /lead`, `POST /complaints`, `GET /site/offers`, and authenticated `/admin/*` routes.
- AI binding: `remote: true`, so Worker code runs locally while Workers AI runs remotely during `wrangler dev`.
- Lead storage: Supabase REST from the Worker only, using the Wrangler secret `SUPABASE_SECRET_KEY`.
- WhatsApp: deterministic `wa.me` handoff URL only; no WhatsApp Business API or outbound message is sent.

## Local commands

From `worker/`:

```bash
npm install
npm run types
npm run typecheck
npm run dev
```

Workers AI local development uses the Cloudflare account and can incur inference usage. The development configuration allows only `http://localhost:3000` and `http://127.0.0.1:3000` by default.

Before deploying or exercising `POST /lead`, configure the Supabase server secret without putting it in the repository:

```bash
npx wrangler secret put SUPABASE_SECRET_KEY
```

Use the current Supabase server-side secret when Wrangler prompts. Never paste that value into source code, `.env` files committed to the repository, browser code, or chat logs.

Deploy the development Worker only:

```bash
npm run deploy
```

The website frontend reads the public build-time variable `NEXT_PUBLIC_CHAT_API_URL`, for example:

```text
NEXT_PUBLIC_CHAT_API_URL=https://<worker>.workers.dev
```

Do not put Cloudflare tokens, Supabase secrets, or other credentials in this variable or in the repository. The current development allowlist is localhost-only. A confirmed production origin must be added deliberately before a production website integration.

## Flow

The deterministic flow collects service, city/postal code, frequency, optional preferred time, optional details, and name, then presents a summary for confirmation. Structured quick replies and validated fields do not call AI. Natural-language requests may make one small extraction call; its JSON is validated against the official 12 service IDs and six frequency values. AI failure falls back to the same guided prompts.

After confirmation, the browser sends one idempotent lead request with a session-scoped UUID and pathname. The Worker validates the payload, stores only the normalized fields, returns a short reference and deterministic handoff URL, and never logs customer details. The UI preserves the draft and offers retry if persistence fails.

Rate limiting is not provisioned because the account’s native Workers Rate Limiting availability and billing were not confirmed; no paid or unverified rate-limit resource is created.

## Backoffice configuration

The Worker is the only application path to `profiles`, `complaints`, `offers`, and offer media. Supabase RLS is enabled with no broad browser policies. The browser uses Supabase Auth only and the Worker verifies the access token against `/auth/v1/user`, accepting only the trusted `app_metadata.role` values `client_admin` and `site_owner`.

Complaint email configuration uses the server-side variables `COMPLAINT_EMAIL_FROM` and `COMPLAINT_EMAIL_REPLY_TO`; `RESEND_API_KEY` remains a Wrangler secret. `SUPABASE_PUBLISHABLE_KEY` is optional Worker configuration and is never used as a server secret.

Apply `supabase/migrations/20260918090000_create_backoffice_complaints_offers.sql` to the existing project before using the new endpoints. Keep `SUPABASE_SECRET_KEY` and `RESEND_API_KEY` as Wrangler secrets. Customer complaint confirmations are sent to the submitted customer email with Reply-To `info@sterschoonmaak.be`; configure `COMPLAINT_EMAIL_FROM` as the verified sender `Ster Schoonmaak <info@sterschoonmaak.be>`. Resend's free tier is sufficient for the expected small-business volume; domain verification is still required for production delivery.

The public offer response contains only localized, active offers. An offer is active only when it is published, enabled, within its schedule, and sorted by priority then newest publication time. Updating an offer does not require a Firebase build or deploy.

The two initial accounts must be invited or created by an authorized Supabase administrator. Set `app_metadata.role` server-side to `client_admin` and `site_owner`; never use `user_metadata` or ask for passwords in chat. Configure Supabase Auth redirect URLs for `/backoffice/reset` and `/owner/reset` on localhost, the Firebase URL, and the production domain.

The existing chatbot, lead persistence, and WhatsApp handoff remain unchanged. Production CORS and the production custom domain must be verified before enabling them in the live environment.
