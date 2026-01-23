# Security Model

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

All sensitive decisions are enforced **server-side**.

---

## Identity & Authentication

- Authentication is handled via a trusted identity provider.
- Each authenticated user has a unique `auth.uid`.
- Authentication alone does **not** grant access to data or features.

Authentication answers *who you are*.  
Authorization answers *what you are allowed to do*.

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
- Applies to:
  - Reads
  - Writes
  - Updates
  - Deletes

If RLS denies access, the operation **cannot succeed**.

---

## Role Model

CoParrent supports multiple roles with **strict capability separation**:

| Role | Description |
|-----|------------|
| Parent | Primary account holder and data owner |
| Co-Parent | Secondary parent with limited access |
| Third-Party | Read-only invited participant |
| Child | Restricted account with no data creation rights |

Roles are enforced server-side and cannot be escalated client-side.

---

## Data Ownership Model

- All data is **owned by a single parent user**
- Ownership is immutable unless explicitly transferred (future feature)
- Ownership determines:
  - Edit permissions
  - Delete permissions
  - Sharing authority

No automatic co-parent visibility exists.

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

Enforcement points:
- Edge functions
- RPC validation
- Database constraints
- RLS where applicable

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

AI tools are treated as **support tools**, not decision-makers.

---

## Rate Limiting & Abuse Prevention

Rate limits are enforced server-side to prevent:
- Abuse
- Cost overruns
- Model exhaustion
- Prompt manipulation

Rate limiting applies to:
- AI interactions
- Resource-heavy operations
- Export generation

Exceeding limits returns structured, user-safe errors.

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

## Logging & Observability

- Sensitive content is not logged in plaintext
- Logs capture:
  - Operation type
  - Actor role
  - Timestamp
  - Success/failure
- AI prompts and outputs are not persisted beyond operational need

Logs are designed for **auditability**, not surveillance.

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

Security errors are handled as product behavior, not exceptions.

---

## Review & Evolution

This security model evolves intentionally.

Changes require:
- Architectural review
- RLS validation
- Documentation updates

Security changes are considered **breaking changes** unless explicitly backward compatible.

---

## Executable Assertion Tests

This security model is enforced by executable tests in:

- `src/lib/securityAssertions.ts` — Runtime assertion tests for all security invariants
- `src/lib/securityGuards.ts` — Server-verified guard functions
- `src/lib/securityInvariants.ts` — Invariant enforcement utilities
- `src/hooks/useSecurityContext.ts` — React hook for security context
- `src/components/gates/SecurityBoundary.tsx` — Error boundary for security violations

### Invariants Tested

| Invariant | Code Reference | Enforcement Layer |
|-----------|---------------|-------------------|
| Third-party cannot write | `THIRD_PARTY_RESTRICTED_ACTIONS` | RLS + Edge Functions |
| Child cannot access parent routes | `PARENT_ONLY_ROUTES` | ProtectedRoute + ChildAccountGate |
| Child cannot create data | `assertChildCannotCreateData()` | RLS + UI Gate |
| Admin via user_roles only | `assertAdminAccessSource()` | is_admin() RPC |
| Client gating never trusted alone | `SERVER_ENFORCED_FEATURES` | RLS + Edge Functions |
| Subscription from server only | `assertSubscriptionNotClientTrusted()` | Profile DB |
| Trial expiry checked real-time | `assertTrialExpiryCheckedRealtime()` | aiGuard |
| Fail closed on error | `assertFailClosed()` | All guards |

### Failure Conditions

Every assertion explicitly fails if:
- A role escalation bug is introduced
- A new route is added without enforcement
- A server endpoint trusts client input

---

## Related Documentation

- `README.md` — Design principles and product intent  
- `GATED_FEATURES.md` — Feature access and enforcement rules  
- `GATED_FEATURES_AUDIT.md` — Audit verification status

---

_End of Security Model_
