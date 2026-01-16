# Gated Features Documentation

This document lists all premium, role-gated, and admin-restricted features in CoParrent,
along with where each gate is enforced (UI component + server-side).

## Gate Types

| Gate Type | Description | UI Component | Server Check |
|-----------|-------------|--------------|--------------|
| **PremiumGate** | Requires active subscription or trial | `PremiumFeatureGate` | Edge function `aiGuard` |
| **RoleGate** | Requires parent/guardian role (not third-party) | `RoleGate`, `ProtectedRoute` | RLS policies, edge function `aiGuard` |
| **AdminGate** | Requires admin role in user_roles table | `AdminGate` | `is_admin()` DB function, RLS |

---

## Premium-Gated Features

Features requiring subscription, trial, or free_access grant.

| Feature | UI Gate Location | Server Gate | Notes |
|---------|------------------|-------------|-------|
| AI Message Rephrase | `MessageToneAssistant.tsx` - mode dropdown | `ai-message-assist/index.ts` - aiGuard | quick-check allowed for all |
| AI Message Draft | `MessageToneAssistant.tsx` | `ai-message-assist/index.ts` - aiGuard | |
| AI Message Analyze | `MessageToneAssistant.tsx` | `ai-message-assist/index.ts` - aiGuard | Allowed for all auth users |
| AI Schedule Suggest | `CalendarWizard.tsx` | `ai-schedule-suggest/index.ts` - aiGuard | Parent/Admin + plan |
| Rewrite Style Modes | `MessageToneAssistant.tsx` - dropdown hidden for non-premium | Mode passed to server but neutral default works for all | |
| Kid Center AI Tools | `KidCenterPage.tsx` - `PremiumFeatureGate` | Coming soon | Coloring, crafts, activities, recipes |

---

## Role-Gated Features (Parent/Guardian Only)

Features restricted from Third-Party members.

| Feature | UI Gate Location | Server Gate | Notes |
|---------|------------------|-------------|-------|
| Edit Calendar/Schedule | `ProtectedRoute`, `RoleGate` | RLS on `custody_schedules` | Third-party has read-only |
| Edit Children Info | `ProtectedRoute` - `/dashboard/children` | RLS on `children`, `parent_children` | |
| Manage Documents | `ProtectedRoute` - `/dashboard/documents` | RLS on `documents` | |
| Manage Expenses | `ProtectedRoute` - `/dashboard/expenses` | RLS on `expenses` | |
| Settings Access | `ProtectedRoute` - `/dashboard/settings` | Profile RLS | |
| Submit Schedule Requests | Component-level disable | RLS on `schedule_requests` | Third-party can view |
| Send Messages | Open for all family members | RLS on `messages`, `thread_messages` | |

### Third-Party Allowed Routes (Read Access)
- `/dashboard` - Dashboard overview
- `/dashboard/messages` - Messaging Hub (can send in allowed threads)
- `/dashboard/calendar` - Calendar (view only)
- `/dashboard/journal` - Journal
- `/dashboard/law-library` - Law Library
- `/dashboard/blog` - Blog
- `/dashboard/notifications` - Notifications
- `/dashboard/kid-center` - Kid Center (premium features gated separately)
- `/dashboard/sports` - Sports activities
- `/dashboard/gifts` - Gift lists

---

## Admin-Gated Features

Features restricted to users with `admin` role in `user_roles` table.

| Feature | UI Gate Location | Server Gate | Notes |
|---------|------------------|-------------|-------|
| Law Library Upload | `AdminLawLibraryManager.tsx` + `AdminGate` | RLS on `law_library_resources` | |
| Law Library Edit | `AdminLawLibraryManager.tsx` + `AdminGate` | RLS on `law_library_resources` | |
| Law Library Delete | `AdminLawLibraryManager.tsx` + `AdminGate` | RLS, storage policies | |
| Admin Dashboard | `ProtectedRoute` - `/admin` | `is_admin()` function | |
| User Management | `AdminDashboard.tsx` | `admin-manage-users` edge function | |

---

## AI Feature Permissions Matrix

| Action | Auth Required | Parent/Admin Required | Premium Required | Rate Limited |
|--------|---------------|----------------------|------------------|--------------|
| `quick-check` | ✅ | ❌ | ❌ | ❌ |
| `analyze` | ✅ | ✅ | ✅ | ✅ |
| `rephrase` | ✅ | ✅ | ✅ | ✅ |
| `draft` | ✅ | ✅ | ✅ | ✅ |
| `schedule-suggest` | ✅ | ✅ | ✅ | ✅ |

### AI Rewrite Modes (Premium Only)
- `neutral` - Default, available to all who can rephrase
- `deescalate` - Premium mode selector
- `facts_only` - Premium mode selector
- `boundary_setting` - Premium mode selector

---

## Server-Side Enforcement

### Edge Functions with aiGuard
All AI edge functions use the shared `aiGuard` module which:
1. Validates JWT token from Authorization header
2. Fetches user profile and determines family role
3. Checks subscription/trial status via profile
4. Enforces action allowlist based on role + plan
5. Returns structured `{ error, code }` on rejection with appropriate HTTP status

### Database RLS Policies
All tables have Row Level Security enabled. Key patterns:
- User-owned data: `auth.uid() = user_id`
- Family-shared data: Uses `is_family_member()` function
- Admin data: Uses `is_admin()` function

### Rate Limiting
AI functions use `aiRateLimit` module:
- Tracks daily usage in `ai_usage_daily` table
- Limits: Free=10/day, Trial=50/day, Premium=200/day
- Returns HTTP 429 with `{ error, code: "RATE_LIMIT" }`

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

## Security Notes

1. **Never trust client-side role checks alone** - Always enforce on server
2. **Admin role stored in separate `user_roles` table** - Not in profile to prevent escalation
3. **Use `SECURITY DEFINER` functions** for role checks to avoid RLS recursion
4. **Log access denials** for security auditing
5. **Structured error responses** - Always return `{ error, code }` for proper client handling
