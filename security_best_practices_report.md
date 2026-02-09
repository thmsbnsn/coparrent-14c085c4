# CoParrent Security Best Practices Report

Date: 2026-02-09

## Executive Summary

The codebase has solid foundational patterns (typed Supabase client usage, route guards, and explicit safety utilities), but there are several high-impact gaps in edge-function authentication and trusted HTML handling.

- High severity: 2 findings
- Medium severity: 4 findings
- Low severity: 1 finding

## High Severity Findings

### SEC-001: Publicly callable edge function uses service-role access without auth
- Severity: High
- Location: `supabase/config.toml:9`, `supabase/config.toml:10`, `supabase/functions/notify-third-party-added/index.ts:17`, `supabase/functions/notify-third-party-added/index.ts:25`
- Evidence:
  - `verify_jwt = false` for `notify-third-party-added`
  - Function creates Supabase client with `SUPABASE_SERVICE_ROLE_KEY`
  - Request body is accepted from `await req.json()` and used to query profiles/send email
- Impact: An unauthenticated caller can trigger privileged email workflows and potentially spam users.
- Fix:
  - Set `verify_jwt = true` for this function.
  - Validate caller identity via `Authorization` + `auth.getUser`.
  - Enforce ownership check that caller is authorized to act on `primaryParentId`.

### SEC-002: Reminder worker functions are publicly invokable and can trigger mass notifications
- Severity: High
- Location: `supabase/config.toml:27`, `supabase/config.toml:28`, `supabase/config.toml:30`, `supabase/config.toml:31`, `supabase/functions/exchange-reminders/index.ts:149`, `supabase/functions/exchange-reminders/index.ts:160`, `supabase/functions/sports-event-reminders/index.ts:8`, `supabase/functions/sports-event-reminders/index.ts:241`, `supabase/functions/sports-event-reminders/index.ts:251`
- Evidence:
  - `exchange-reminders` and `sports-event-reminders` both have `verify_jwt = false`.
  - Both create service-role clients and process global schedule/event tables.
  - `sports-event-reminders` explicitly allows `Access-Control-Allow-Origin: *`.
- Impact: Any caller can repeatedly invoke reminder jobs, causing notification/email spam and avoidable operational cost.
- Fix:
  - Restrict execution to scheduler-only calls using a shared secret header.
  - Keep `verify_jwt = false` only if scheduler-auth is enforced server-side; otherwise enable JWT verification.
  - Add explicit rate limiting and idempotency guard at function entry.

## Medium Severity Findings

### SEC-003: CORS helper intentionally allows requests without Origin
- Severity: Medium
- Location: `supabase/functions/_shared/cors.ts:121`, `supabase/functions/_shared/cors.ts:122`, `supabase/functions/_shared/cors.ts:123`
- Evidence: Requests with no `Origin` header are accepted.
- Impact: This is fine for trusted cron/webhook flows, but unsafe for endpoints lacking independent auth checks.
- Fix:
  - Keep this behavior only for functions that enforce non-CORS auth (JWT signature/header secret/webhook signature).
  - Add a hard requirement in each public function for one authoritative auth mechanism.

### SEC-004: Print/export HTML uses unsanitized user content with `document.write`
- Severity: Medium
- Location: `src/lib/activityExport.ts:240`, `src/lib/activityExport.ts:298`, `src/lib/nurseNancyExport.ts:177`, `src/lib/nurseNancyExport.ts:187`, `src/components/chores/ChoreChartExport.tsx:193`, `src/components/chores/ChoreChartExport.tsx:224`
- Evidence:
  - Template HTML is constructed with raw user/content fields and written to a popup document.
  - No escaping/sanitization before interpolation in these modules.
- Impact: Stored script payloads can execute when users export/print content.
- Fix:
  - Escape interpolated values before HTML construction (or sanitize with DOMPurify).
  - Prefer DOM construction with `textContent` for user-controlled strings.

### SEC-005: Session management UI is demo-mode and can misrepresent account security controls
- Severity: Medium
- Location: `src/components/auth/SessionManager.tsx:83`, `src/components/auth/SessionManager.tsx:85`, `src/components/auth/SessionManager.tsx:100`, `src/components/auth/SessionManager.tsx:124`, `src/components/auth/SessionManager.tsx:128`
- Evidence:
  - Code comments indicate “real implementation” is missing.
  - Session list is mock/local and per-session revoke only updates local UI state.
- Impact: Users may believe devices were revoked when server-side session invalidation did not occur.
- Fix:
  - Replace mock session list with server-backed trusted-devices/session records.
  - Implement real revoke endpoint with audit logging and explicit success/failure states.

### SEC-006: Invitation notification contract mismatch likely disables expected security alerts
- Severity: Medium
- Location: `src/pages/AcceptInvite.tsx:167`, `src/pages/AcceptInvite.tsx:169`, `src/pages/AcceptInvite.tsx:170`, `src/pages/AcceptInvite.tsx:171`, `supabase/functions/notify-third-party-added/index.ts:25`
- Evidence:
  - Caller sends `primary_parent_id`, `new_member_name`, `new_member_email`.
  - Function expects `primaryParentId`, `thirdPartyName`, `thirdPartyEmail`.
- Impact: Parent notification after third-party join may silently fail, reducing security visibility of account changes.
- Fix:
  - Normalize request schema and validate with strict parser (e.g., Zod) on both sides.
  - Add integration test for invite acceptance + notification dispatch.

## Low Severity Findings

### SEC-007: Environment file with runtime values is tracked in repo
- Severity: Low
- Location: `.env:1`, `.env:2`, `.env:3`, `.gitignore:1`
- Evidence:
  - `.env` is present in repository and `.gitignore` does not exclude `.env`.
- Impact: Increases risk of accidentally committing sensitive values in future.
- Fix:
  - Add `.env*` ignore rules (while allowing `.env.example`).
  - Move runtime values to `.env.example` with placeholders.

## Validation Notes

- Dependency conflict between `jspdf` and `jspdf-autotable` has been corrected.
- Current install path no longer needs `--legacy-peer-deps`.
- Remaining advisories are mostly upstream dependency updates (`react-router-dom`, `vite`, transitive packages) and should be addressed in planned dependency upgrades.

## Remediation Status Update (2026-02-09)

- SEC-001: Fixed (JWT verification enabled for `notify-third-party-added` plus explicit caller auth/authorization checks).
- SEC-002: Fixed (scheduler authorization, invocation idempotency, and rate limiting added to reminder workers; wildcard CORS removed from sports reminders path).
- SEC-004: Fixed (HTML escaping added in print/export HTML builders for affected modules).
- SEC-006: Fixed (invite caller/callee payload contract aligned to camelCase schema).
- SEC-005: Partially fixed (mock multi-session behavior removed; backend device/session revocation API still pending).
- SEC-003: Mitigated by endpoint hardening above; retain monitor status for any new unauthenticated server-to-server endpoint.
