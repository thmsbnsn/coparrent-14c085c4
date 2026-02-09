# Temporary Findings Backlog

Date: 2026-02-09  
Purpose: park review findings while we complete environment/deployment setup.

## Current System Status (2026-02-09)

- Vercel auth confirmed (`thmsbnsn`) and project is accessible:
  - Project ID: `prj_KIxvml5lR3rYSRUwm3kFdtRIBa5U`
  - Linked repo: `thmsbnsn/coparrent-14c085c4` (branch `main`)
- Vercel env keys present (names only): `RESEND_API_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`
- Supabase cutover target (`jnxtskcpwzuxyxjzqrkv`) is migrated and function-deployed:
  - DB migrations synced (`supabase migration list` local=remote).
  - Functions deployed (23 active including `health`, `create-checkout`, `stripe-webhook`).
  - Publishable key checks now pass (`health`, `profiles`, `custody_schedules` all return 200).
- Local runtime switched to new project in `.env` and `.env.local`.
- Vercel Supabase env values were updated to new project values.
- Latest health verification (2026-02-09): `functions/v1/health` returned 200 with `{ ok: true }`.
- Local build status: `npm run build` passes; `npm run lint` fails due pre-existing backlog (98 errors / 29 warnings).
- Vercel production deployment completed after env update:
  - Deploy URL: `https://coparrent-he64wju05-thomas-projects-6401cf21.vercel.app`
  - Alias: `https://www.coparrent.com`

### Remaining Cutover Prerequisites (New Supabase)

- [ ] Add missing Supabase project secrets (currently only: `RESEND_API_KEY`, `SUPABASE_*`):
- [ ] Add missing edge-function secrets in new project:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `OPENROUTER_API_KEY`
  - `LOVABLE_API_KEY`
  - [x] `SCHEDULER_SECRET` (configured on 2026-02-09)
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
- [x] Trigger fresh Vercel deployment so updated env values are picked up.
- [ ] Optional hardening/config:
  - `ALLOWED_ORIGINS`

## Critical/High (Do First)

- [ ] Rotate operational tokens/secrets that were shared during setup (Vercel token, Supabase PAT/secret) and replace in dashboards/CLI. (Owner deferred)
- [x] Harden edge function auth:
  - `supabase/functions/notify-third-party-added/index.ts`
  - `supabase/functions/exchange-reminders/index.ts`
  - `supabase/functions/sports-event-reminders/index.ts`
  - `supabase/config.toml` (`notify-third-party-added` now `verify_jwt = true`)
- [x] Add scheduler/webhook-only guard (secret header + idempotency/rate-limit) for reminder jobs.
- [ ] Update any external cron/scheduler caller(s) to send `x-scheduler-secret` header.

## Medium (Do Next)

- [x] Fix invite notification payload mismatch:
  - Caller: `src/pages/AcceptInvite.tsx`
  - Callee: `supabase/functions/notify-third-party-added/index.ts`
- [x] Sanitize print/export HTML templates before `document.write`:
  - `src/lib/activityExport.ts`
  - `src/lib/nurseNancyExport.ts`
  - `src/components/chores/ChoreChartExport.tsx`
- [x] Align test/dev ports so Playwright works:
  - `vite.config.ts` (port `8080`)
  - `playwright.config.ts` (expects `5173`)
- [~] Replace demo session management with real backend session/device revocation:
  - `src/components/auth/SessionManager.tsx`
  - Status: mock multi-session data removed; UI now accurately represents current-session-only behavior.

## Product Completeness / UX Gaps

- [x] Implement Gift edit flows (previous TODO placeholders):
  - `src/pages/GiftsPage.tsx`
- [x] Add Stripe env-driven plan/product configuration so production IDs are not hard-coded:
  - `src/lib/stripe.ts`
  - `supabase/functions/create-checkout/index.ts`
  - `supabase/functions/check-subscription/index.ts`
  - `supabase/functions/stripe-webhook/index.ts`
- [x] Add complimentary-access "free forever Power" flow:
  - `supabase/migrations/20260209203200_access_pass_codes.sql`
  - `supabase/functions/redeem-access-code/index.ts`
  - `src/components/settings/AccessCodeRedeemer.tsx`
  - `src/pages/AdminDashboard.tsx` (admin code creation/list/toggle)
- [ ] Replace placeholder travel-time logic with real distance service for reminder relevance:
  - `supabase/functions/sports-event-reminders/index.ts`

## UI/UX Review Snapshot

- [x] Performance: reduced initial JS by code-splitting routes (main chunk now ~752kB minified; large pages split into separate chunks).
- [ ] Trust clarity: "Session management" appears functional but is currently demo/mock-backed (`src/components/auth/SessionManager.tsx`).
- [x] Editing UX gap addressed: gift lists and gift items now support full edit workflow (`src/pages/GiftsPage.tsx` + gift dialogs).
- [x] E2E config mismatch resolved: Vite/Playwright ports aligned for stable local E2E execution.

## Dependency / Quality Follow-ups

- [~] Address npm audit highs/moderates:
  - Fixed all high severity findings via `npm audit fix`.
  - Remaining: 2 moderate (esbuild dev-server advisory) requiring Vite major upgrade (`npm audit fix --force`).
  - Mitigation applied: dev server now binds to `127.0.0.1` by default (`vite.config.ts`) to avoid exposing the vulnerable dev server on your LAN.
- [ ] Reduce lint backlog (`npm run lint` currently fails with many existing errors/warnings).

## Reference

- Full security report: `security_best_practices_report.md`
