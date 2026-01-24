# Security Model

> **Version**: 2.0  
> **Status**: Production  
> **Last Updated**: 2026-01-24

This document defines the **security architecture, enforcement layers, and trust boundaries** of CoParrent.

It is intentionally explicit. Security decisions in CoParrent are **designed, not implied**.

---

## Security Philosophy

CoParrent follows a **defense-in-depth** model with the following principles:

- **Zero implicit trust in the client**
- **Server-enforced rules over UI checks**
- **Least-privilege access by default**
- **Private-by-default data ownership**
- **Explicit sharing with revocable access**
- **Fail closed on all security errors**

All sensitive decisions are enforced **server-side**.

---

## Identity & Authentication

- Authentication is handled via Lovable Cloud Auth
- Each authenticated user has a unique `auth.uid`
- Authentication alone does **not** grant access to data or features
- Two-factor authentication (TOTP) is supported with recovery codes
- Device trust tracking with login notifications

Authentication answers *who you are*.  
Authorization answers *what you are allowed to do*.

### Two-Factor Authentication

| Component | Purpose |
|-----------|---------|
| `TwoFactorSetup` | TOTP enrollment via QR code |
| `TwoFactorVerify` | Verification during login |
| `RecoveryCodes` | Backup codes (SHA-256 hashed) |
| `TrustedDevicesManager` | Device trust management |

Recovery codes are:
- Stored as SHA-256 hashes
- One-time use with timestamp tracking
- Auto-expire after 1 year
- Count tracked in `user_2fa_settings.recovery_codes_remaining`

---

## Authorization Layers

Authorization is enforced through **multiple independent layers**:

### 1. Route Guards (UI Layer)
- Prevent navigation to unauthorized pages
- Improve UX and reduce accidental access
- **Not trusted as a security boundary**

### 2. Edge Functions / RPC (Server Logic Layer)
- Enforce:
  - Subscription tier limits
  - Role restrictions
  - Rate limits
  - AI safety constraints
- Reject invalid requests regardless of client behavior

### 3. Row Level Security (RLS) — Primary Enforcement
- Enforced directly at the database level
- Cannot be bypassed by client manipulation
- Applies to all CRUD operations

**If RLS denies access, the operation cannot succeed.**

---

## Role Model

CoParrent supports multiple roles with **strict capability separation**:

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Parent** | Primary account holder and data owner | Full access to all features |
| **Guardian** | Secondary parent equivalent | Full access (treated as parent) |
| **Third-Party** | Invited participant (step-parent, grandparent) | Read-only access to calendar, messages |
| **Child** | Restricted account for children | Minimal access with parental controls |

### Per-Family Roles

**CRITICAL**: Role is a property of **family membership**, not the user globally.

- A user can be Parent in Family A and Third-Party in Family B
- Switching families changes available permissions immediately
- All role checks use `useFamilyRole()` which reads from active family context

### Role Enforcement Functions

| Function | Purpose |
|----------|---------|
| `is_parent_or_guardian(user_id)` | Returns true if user has parent/guardian role |
| `is_family_member(user_id, family_id)` | Validates family membership |
| `is_parent_in_family(user_id, family_id)` | Parent check scoped to specific family |
| `can_write_in_family(user_id, family_id)` | Write permission check |
| `is_admin()` | Admin role check |

---

## Data Ownership Model

- All data is **owned by a single parent user**
- Ownership is immutable unless explicitly transferred
- Ownership determines:
  - Edit permissions
  - Delete permissions
  - Sharing authority

No automatic co-parent visibility exists for private content.

---

## Sharing Model

- All data is **private by default**
- Sharing is:
  - Explicit
  - Item-level
  - Revocable
- Shared users receive:
  - Read access
  - Export / print access (where applicable)
- Shared users **cannot**:
  - Edit
  - Delete
  - Regenerate
  - Move content

Sharing is enforced via server-side policies and RLS joins.

---

## Subscription Enforcement

Subscription tiers are enforced **server-side**, never trusted to the client.

### Enforcement Points

| Layer | Mechanism |
|-------|-----------|
| Edge Functions | `aiGuard` module validates subscription |
| RPC Functions | Check `profiles.subscription_tier` |
| RLS Policies | Some features blocked at database level |

### Subscription Invariants

| Invariant | Description |
|-----------|-------------|
| **Trial ≠ Premium** | Trial users tracked distinctly from paid |
| **Expired Trial = Free Immediately** | No grace period; real-time check |
| **Stripe Webhook = Source of Truth** | Profile fields written only by webhooks |
| **Server Never Trusts Client Tier** | All functions re-validate from database |

A client claiming a higher tier does not grant access.

---

## AI Tool Security

AI-powered features follow strict safety boundaries:

- AI outputs are **non-diagnostic and non-authoritative**
- No medical, legal, or treatment advice is provided
- Emergency scenarios defer immediately to local emergency services
- AI prompts and system instructions are locked server-side
- User input is sanitized and validated
- Requests are rate-limited per user

### AI Rate Limits

| Tier | Daily Limit |
|------|-------------|
| Free | 10 requests |
| Trial | 50 requests |
| Power | 200 requests |

AI tools are treated as **support tools**, not decision-makers.

---

## Push Notification Security

Push notifications follow the same zero-trust model:

### Subscription Storage
- Push subscriptions stored in `push_subscriptions` table
- RLS ensures users can only manage their own subscriptions
- Subscription endpoints never exposed after registration

### VAPID Key Handling
- VAPID keys stored as server-side secrets
- Public key exposed only during subscription registration
- Private key never leaves the server environment

### Notification Payload Safety
- Notification bodies are sanitized (emails, phone numbers stripped)
- Maximum payload length enforced (200 chars)
- No private message content in push payloads
- Deep links are relative paths, resolved within authenticated session

### Admin Push Testing
- Admin-only test push tool requires `is_admin()` check
- Test sends are audit-logged with action `TEST_PUSH_SENT`
- Rate-limited server-side to prevent abuse

---

## Email Notification Security

### Privacy Rules
- **No sensitive content** in email body
- **No message previews** (only "You have a new message")
- **Generic copy** referencing notification type
- **Clear CTA link** back to the app
- **Unsubscribe link** to settings

### Audit Logging
All email sends are logged to `audit_logs` with:
- `action`: `NOTIFICATION_EMAIL_SENT` or `NOTIFICATION_EMAIL_FAILED`
- `entity_type`: `notification`
- `metadata`: type, recipient_id, channel, success (no payload content)

---

## Rate Limiting & Abuse Prevention

| Layer | Mechanism |
|-------|-----------|
| AI Functions | `aiRateLimit` module with daily limits |
| Edge Functions | `functionRateLimit` for abuse prevention |
| Auth Forms | hCaptcha for bot protection |
| Invitations | Plan-based limits on third-party invites |

---

## File & Storage Security

- All generated files are stored in protected storage buckets
- Access is restricted by:
  - Owner identity
  - Explicit share permissions
- No public buckets
- No anonymous access
- File URLs are scoped and revocable

Exported documents never expose internal identifiers.

---

## Audit Logging

### Data Completeness

| Field | Required | Description |
|-------|----------|-------------|
| `actor_user_id` | ✅ | Auth UID of actor |
| `actor_role_at_action` | ✅ | Role snapshot at time of action |
| `child_id` | ⚠️ | Child record being accessed |
| `before` | ⚠️ | JSONB snapshot before mutation |
| `after` | ⚠️ | JSONB snapshot after mutation |
| `created_at` | ✅ | UTC timestamp (server-generated) |

### Tamper Resistance

| Protection | Implementation |
|------------|----------------|
| **No Client-Side INSERT** | RLS `WITH CHECK (false)` policy |
| **No UPDATE Allowed** | RLS policy blocks updates |
| **No DELETE Allowed** | RLS policy blocks deletes |
| **Writes via SECURITY DEFINER** | `log_audit_event()` RPC only |
| **Actor ID from auth.uid()** | Cannot be spoofed by client |

Logs are designed for **auditability and court-defensibility**.

---

## Intentional Security Limitations

The following limitations are intentional:

- No public share links
- No client-controlled permission elevation
- No child-initiated data creation
- No background monitoring of user activity
- No automated decision-making affecting custody or care

---

## Failure Handling

When security rules block an action:
- The system fails **closed**
- Users receive clear, non-technical messaging
- No internal state or identifiers are exposed
- Errors are logged with sanitization

Security errors are handled as product behavior, not exceptions.

---

## Executable Assertion Tests

This security model is enforced by executable tests in:

| File | Purpose |
|------|---------|
| `src/lib/securityAssertions.ts` | Runtime assertion tests |
| `src/lib/securityGuards.ts` | Server-verified guard functions |
| `src/lib/securityInvariants.ts` | Invariant enforcement utilities |
| `src/hooks/useSecurityContext.ts` | React hook for security context |
| `src/components/gates/SecurityBoundary.tsx` | Error boundary for violations |

### Invariants Tested

| Invariant | Enforcement Layer |
|-----------|-------------------|
| Third-party cannot write | RLS + Edge Functions |
| Child cannot access parent routes | ProtectedRoute + ChildAccountGate |
| Child cannot create data | RLS + UI Gate |
| Admin via user_roles only | `is_admin()` RPC |
| Client gating never trusted alone | RLS + Edge Functions |
| Subscription from server only | Profile DB |
| Trial expiry checked real-time | aiGuard |
| Fail closed on error | All guards |

---

## Related Documentation

- `README.md` — Design principles and product intent  
- `docs/GATED_FEATURES.md` — Feature access and enforcement rules  
- `docs/GATED_FEATURES_AUDIT.md` — Audit verification status
- `docs/DESIGN_CONSTITUTION.md` — Visual design rules

---

_End of Security Model_
