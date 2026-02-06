# Gated Features Documentation

> **Version**: 2.1  
> **Status**: Production  
> **Last Updated**: 2026-02-06

This document lists all premium, role-gated, and admin-restricted features in CoParrent,
along with where each gate is enforced (UI component + server-side).

---

## Enforcement Model

All gated features in CoParrent are enforced at the **server level**, never by UI logic alone.

| Enforcement Layer | Purpose |
|------------------|--------|
| Route Guards | Prevent unauthorized navigation |
| RPC / Edge Functions | Enforce plan limits and roles |
| Row Level Security (RLS) | Enforce data access rules |
| Storage Policies | Restrict file access |

Client-side checks are considered **advisory only**.

---

## Plan Structure

CoParrent uses a two-tier subscription model:

| Plan | Price | Max Kids | Max Third-Party | Key Features |
|------|-------|----------|-----------------|--------------|
| **Free** | $0 | 4 | 4 | Calendar, Messages, Children, Documents, Kids Hub*, Law Library |
| **Power** | $5/month | 6 | 6 | Everything in Free + Expenses, Court Exports, Sports Hub, Full AI |

*Kids Hub in Free tier has limited AI usage (10 requests/day)

**Plan Configuration:** `src/lib/planLimits.ts`

### Family-Wide AI Access

**CRITICAL**: AI tool access is determined at the **family level**, not per-user.

- If ANY member of a family has a Power subscription, ALL family members (parents, co-parents, third-party, children) can access AI tools
- This is enforced both in the UI (`PremiumFeatureGate` with `useFamilySubscription`) and server-side (`aiGuard` checks family membership)
- Third-party and child accounts inherit AI access from any subscribing family member

---

## Privacy Defaults

Unless explicitly shared by the owner:

- All creations are **private per parent**
- Co-parents do not see each other's generated content
- Children cannot generate or access creations
- Third-party users have no default visibility

Sharing is:
- Explicit
- Item-level
- Revocable at any time

---

## Role Capability Matrix

| Action | Parent (Owner) | Co-Parent | Third-Party | Child |
|--------|---------------|-----------|-------------|-------|
| **AI Tools (Nurse Nancy, Activity Generator, Coloring Pages)** | ✅* | ✅* | ✅* | ✅* |
| View Private Creations | ✅ | ❌ | ❌ | ❌ |
| View Shared Creations | ✅ | ✅ | ✅ | ✅ |
| Edit Creations | ✅ | ❌ | ❌ | ❌ |
| Export / Print Shared | ✅ | ✅ | ✅ | ✅ |
| Manage Sharing | ✅ | ❌ | ❌ | ❌ |
| Edit Calendar | ✅ | ✅ | ❌ | ❌ |
| View Calendar | ✅ | ✅ | ✅ | ✅ |
| Send Messages | ✅ | ✅ | ✅ | ⚠️** |
| Manage Documents | ✅ | ✅ | ❌ | ❌ |
| Manage Expenses | ✅ | ✅ | ❌ | ❌ |
| Access Settings | ✅ | ✅ | ❌ | ❌ |

*AI Tools require Power plan - if ANY family member has Power, ALL family members can access
**Child messaging requires parent-enabled permissions

---

## Gate Types

| Gate Type | Description | UI Component | Server Check |
|-----------|-------------|--------------|--------------|
| **PowerGate** | Requires Power subscription or trial | `PremiumFeatureGate` | Edge function `aiGuard` |
| **RoleGate** | Requires parent/guardian role | `RoleGate`, `ProtectedRoute` | RLS policies + `is_parent_or_guardian()` |
| **AdminGate** | Requires admin role | `AdminGate` | `is_admin()` DB function |
| **ChildGate** | Enforces child restrictions | `ChildAccountGate` | `get_child_permissions()` RPC |

---

## Power-Gated Features

Features requiring Power subscription, trial, or free_access grant.

| Feature | UI Gate Location | Server Gate | Notes |
|---------|------------------|-------------|-------|
| Expenses Tracking | `ExpensesPage.tsx` | RLS `is_parent_or_guardian()` | Power-only |
| Court Exports | `CourtExportDialog.tsx` | RLS on export data | Power-only |
| Sports & Events Hub | `SportsPage.tsx` | RLS on `child_activities` | Power-only |
| Kids Hub (Full AI) | `KidsHubPage.tsx` | `aiGuard` in edge functions | Power-only (family-level) |
| Nurse Nancy | `NurseNancyPage.tsx` | `aiGuard` + rate limits | Power-only (family-level) |
| Coloring Page Creator | `ColoringPagesPage.tsx` | `aiGuard` + rate limits | Power-only (family-level) |
| Activity Generator | `ActivitiesPage.tsx` | `aiGuard` + rate limits | Power-only (family-level) |
| Chore Charts | `ChoreChartPage.tsx` | RLS on `chore_lists` | Power-only |
| AI Message Rephrase | `MessageToneAssistant.tsx` | `aiGuard` | Power-only |
| AI Message Draft | `MessageToneAssistant.tsx` | `aiGuard` | Power-only |
| AI Schedule Suggest | `CalendarWizard.tsx` | `aiGuard` | Power-only |

---

## Role-Gated Features (Parent/Guardian Only)

Features restricted from Third-Party members.

| Feature | UI Gate Location | Server Gate |
|---------|------------------|-------------|
| Edit Calendar/Schedule | `RoleGate` | RLS on `custody_schedules` |
| Edit Children Info | `ProtectedRoute` | RLS on `children`, `parent_children` |
| Manage Documents | `ProtectedRoute` | RLS on `documents` |
| Manage Expenses | `ProtectedRoute` | RLS on `expenses` |
| Settings Access | `ProtectedRoute` | Profile RLS |
| Submit Schedule Requests | Component-level | RLS on `schedule_requests` |
| Sports Activities CRUD | `RoleGate` | RLS on `child_activities` |
| Chore Chart Management | `RoleGate` | RLS on `chore_lists` |

### Third-Party Allowed Routes (Read Access)

- `/dashboard` - Dashboard overview
- `/dashboard/messages` - Messaging Hub (can send in allowed threads)
- `/dashboard/calendar` - Calendar (view only)
- `/dashboard/journal` - Journal
- `/dashboard/law-library` - Law Library
- `/dashboard/blog` - Blog
- `/dashboard/notifications` - Notifications
- `/dashboard/gifts` - Gift lists (view only)
- `/dashboard/kids-hub` - Kids Hub (if family has Power plan)
- `/dashboard/kids-hub/nurse-nancy` - Nurse Nancy (if family has Power plan)
- `/dashboard/kids-hub/coloring-pages` - Coloring Pages (if family has Power plan)
- `/dashboard/kids-hub/activities` - Activities (if family has Power plan)

---

## Admin-Gated Features

Features restricted to users with `admin` role in `user_roles` table.

| Feature | UI Gate Location | Server Gate |
|---------|------------------|-------------|
| Law Library Upload | `AdminGate` in `AdminLawLibraryManager.tsx` | RLS `is_admin()` |
| Law Library Edit | `AdminGate` in `AdminLawLibraryManager.tsx` | RLS `is_admin()` |
| Law Library Delete | `AdminGate` in `AdminLawLibraryManager.tsx` | RLS `is_admin()` |
| Admin Dashboard | `ProtectedRoute` - `/admin` | `is_admin()` function |
| User Management | `AdminDashboard.tsx` | `admin-manage-users` edge function |
| Push Notification Tester | `AdminPushTester.tsx` | `is_admin()` + audit logging |
| Migration Dry-Run | `MigrationDryRunPanel.tsx` | Admin check |
| Production Checklist | `ProductionChecklist.tsx` | Admin check |

---

## Child Account Restrictions

| Restriction | UI Gate | Server Gate |
|-------------|---------|-------------|
| Blocked from Settings | `ProtectedRoute` | Redirect only |
| Blocked from Expenses | `ProtectedRoute` | Redirect only |
| Blocked from Documents | `ProtectedRoute` | Redirect only |
| Blocked from Audit | `ProtectedRoute` | Redirect only |
| Blocked from Kids Hub | `ProtectedRoute` | Redirect only |
| Calendar Read-Only | `ChildAccountGate` | RLS blocks mutations |
| Messages (conditional) | Permission check | RLS with child_permissions |

---

## AI Feature Permissions Matrix

| Action | Auth Required | Premium Required | Rate Limited | Family-Level Access |
|--------|---------------|------------------|--------------|---------------------|
| `quick-check` | ✅ | ❌ | ❌ | N/A |
| `analyze` | ✅ | ✅ | ✅ | ✅ |
| `rephrase` | ✅ | ✅ | ✅ | ✅ |
| `draft` | ✅ | ✅ | ✅ | ✅ |
| `schedule-suggest` | ✅ | ✅ | ✅ | ✅ |
| `nurse-nancy-chat` | ✅ | ✅ | ✅ | ✅ |
| `generate-activity` | ✅ | ✅ | ✅ | ✅ |
| `generate-coloring-page` | ✅ | ✅ | ✅ | ✅ |

### AI Rate Limits

| Tier | Daily Limit |
|------|-------------|
| Free | 10 requests |
| Trial | 50 requests |
| Power | 200 requests |

---

## Server-Side Enforcement

### Edge Functions with aiGuard

All AI edge functions use the shared `aiGuard` module which:
1. Validates JWT token from Authorization header
2. Fetches user profile and determines family role
3. Checks subscription/trial status via profile **and family membership**
4. Enforces action allowlist based on role + plan
5. Returns structured `{ error, code }` on rejection

### Database RLS Policies

All tables have Row Level Security enabled. Key patterns:
- User-owned data: `auth.uid() = user_id`
- Family-shared data: Uses `is_family_member()` function
- Admin data: Uses `is_admin()` function
- Parent-only mutations: Uses `is_parent_or_guardian()` function

### Parent-Only RLS Enforcement

All mutation policies for parent-only resources verify the user is not a third-party member or child account.

**Tables with Parent-Only Mutation Policies:**

| Table | Operations Protected |
|-------|---------------------|
| `expenses` | INSERT, UPDATE, DELETE |
| `documents` | INSERT, UPDATE, DELETE |
| `custody_schedules` | INSERT, UPDATE, DELETE |
| `schedule_requests` | INSERT |
| `child_activities` | INSERT, UPDATE, DELETE |
| `activity_events` | INSERT, UPDATE, DELETE |
| `child_photos` | INSERT, UPDATE, DELETE |
| `gift_lists` | INSERT, UPDATE, DELETE |
| `gift_items` | INSERT, UPDATE, DELETE |
| `chore_lists` | INSERT, UPDATE, DELETE |
| `chores` | INSERT, UPDATE, DELETE |
| `children` | INSERT (RPC only) |

---

## Push Notifications

### Platform Support

| Platform | Browser Mode | Installed PWA |
|----------|-------------|---------------|
| **Android Chrome** | ✅ | ✅ |
| **iOS Safari 16.4+** | ❌ | ✅ |
| **Desktop Chrome/Edge** | ✅ | ✅ |
| **Firefox** | ✅ | ✅ |

### Push Payload Privacy

All push notifications follow strict privacy rules:
- **No message content** in payload
- **No internal identifiers** exposed
- **Neutral, short copy only** (e.g., "New message waiting")
- **Route link only** for deep-linking

---

## Email Notifications

### Supported Notification Types

| Type | Email Subject | Action URL |
|------|---------------|------------|
| `new_message` | "New message in CoParrent" | `/dashboard/messages` |
| `schedule_change` | "Schedule change request" | `/dashboard/calendar` |
| `schedule_response` | "Schedule request update" | `/dashboard/calendar` |
| `document_upload` | "New document shared" | `/dashboard/documents` |
| `child_update` | "Child information updated" | `/dashboard/children` |
| `exchange_reminder` | "Upcoming custody exchange" | `/dashboard/calendar` |

### Email Privacy Rules

- **No sensitive content** in email body
- **No message previews** (only "You have a new message")
- **Generic copy** referencing notification type
- **Clear CTA link** back to the app
- **Unsubscribe link** to settings

---

## Gate Component Usage

### PremiumFeatureGate
```tsx
<PremiumFeatureGate featureName="AI Analysis">
  <AIAnalysisPanel />
</PremiumFeatureGate>
```

### RoleGate
```tsx
<RoleGate requireParent restrictedMessage="Only parents can edit schedules">
  <ScheduleEditor />
</RoleGate>
```

### AdminGate
```tsx
<AdminGate>
  <AdminLawLibraryManager />
</AdminGate>
```

---

## AI Tool Safety Scope

AI-powered tools in CoParrent are intentionally constrained:

- Provide **general, educational support only**
- Do **not** provide medical, legal, or diagnostic advice
- Always defer emergencies to **local emergency services (911)**
- Enforce **rate limits** and safety rules server-side
- Preserve user privacy (no sensitive data logging)
- Include **safety disclaimers** on all AI-generated content

---

## Intentional Limitations

The following limitations are **by design**, not omissions:

- No public sharing links
- No co-parent editing of privately owned creations
- No AI-generated diagnoses or treatment guidance
- No child-initiated AI content creation
- No family-wide default visibility

---

## Security Notes

- All gate checks are duplicated server-side
- UI gates improve UX but don't provide security
- Bypass attempts are logged
- Error responses are sanitized to prevent information leakage

---

## Help Center

The Help Center (`/help`) provides 14 production-ready help articles covering all platform features. Each article includes:
- Visual card-based layouts with icons
- Step-by-step guides
- Safety and legal disclaimers where appropriate
- Cross-links to related topics

---

## Cross-Reference

- Security architecture: **`docs/SECURITY_MODEL.md`**
- Design principles: **`docs/DESIGN_CONSTITUTION.md`**
- Audit verification: **`docs/GATED_FEATURES_AUDIT.md`**
- Investor overview: **`docs/INVESTOR_HANDOFF.md`**

---

_End of Gated Features Documentation_