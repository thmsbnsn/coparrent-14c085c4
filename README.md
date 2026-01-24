# CoParrent - Modern Co-Parenting Custody Toolkit

<p align="center">
  <img src="src/assets/coparrent-logo.svg" alt="CoParrent Logo" width="200"/>
</p>

**CoParrent** is a comprehensive web application designed to help separated or divorced parents manage their co-parenting responsibilities with ease. The platform provides smart scheduling, secure messaging, document management, and court-ready exports to reduce conflict and keep children's well-being at the center.

---

## 📋 Table of Contents

- [Project Summary](#-project-summary)
- [Project State](#-project-state)
- [Tech Stack](#-tech-stack)
- [Typography & Design System](#-typography--design-system)
- [3rd Party Connections](#-3rd-party-connections)
- [AI Assistant](#-ai-assistant)
- [Features & Components](#-features--components)
- [Application Wire Tree](#-application-wire-tree)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)

---

## 🎯 Project Summary

CoParrent helps co-parents:

- **Coordinate custody schedules** with visual calendars showing each parent's time
- **Communicate securely** through the Messaging Hub with group and direct messaging (court-admissible)
- **Share children's information** including medical records, school details, and emergency contacts
- **Store and share documents** with access logging for legal purposes
- **Manage schedule changes** with formal request/approval workflows
- **Invite third-party members** (step-parents, grandparents, babysitters) via email invitation
- **Access AI-powered tools** including Nurse Nancy, Activity Generator, and Coloring Page Creator

The application is designed with a **calm, professional, court-friendly aesthetic** using navy blue and sage green as primary colors to reduce stress during what can be a difficult time.

---

## Design Principles

CoParrent is built around a small set of non-negotiable design principles that guide architecture, UX decisions, and feature boundaries:

- **Child-first clarity over convenience**  
- **Server-enforced rules over client trust**  
- **Documentation over memory**  
- **Private by default, share by choice**  
- **Calm, neutral UX over adversarial workflows**

These principles intentionally shape decisions such as role-based access, gated features, and private ownership of generated content.

---

## Data Ownership & Privacy Model

CoParrent uses a **parent-owned data model**:

- Each parent owns their own data and generated content.
- Content is **private by default**.
- Sharing is **explicit and revocable** per item.
- Shared access is **read-only** unless otherwise stated.
- No content is publicly accessible or indexed.

This model applies to messages, documents, and all Kids Hub creations.

---

## 🧭 Project State

**Current Maturity:** Production-Ready — core workflows function, security is audited, billing is live.

**Current Phase:** Production  
**Environment:** Lovable Cloud  
**Stripe Mode:** Live  
**Last Verified Build:** 2026-01-24  
**Verified By:** Lovable  
**Last README Update:** 2026-01-24

> **Note:** The `Last Verified Build` and `Verified By` fields must be updated whenever a behavioral or architectural change is made.

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Authentication** | ✅ Complete | Email, Google OAuth, 2FA, Recovery Codes |
| **Messaging Hub** | ✅ Complete | Family channels, DMs, reactions, search, export |
| **Custody Calendar** | ✅ Complete | Visual schedule, AI suggestions, ICS export |
| **Document Vault** | ✅ Complete | Categories, access logging, court export |
| **Expense Tracking** | ✅ Complete | Split tracking, receipts, PDF reports (Power) |
| **Children Profiles** | ✅ Complete | Medical, school, emergency info |
| **Youth Sports Hub** | ✅ Complete | Activities, events, map nav, reminders (Power) |
| **Kids Hub** | ✅ Complete | Nurse Nancy, Activities, Coloring, Chores (Power) |
| **Gift Lists** | ✅ Complete | Per-child wishlists with claiming |
| **Law Library** | ✅ Complete | State-grouped legal resources |
| **PWA & Push** | ✅ Complete | Install, offline, push notifications |
| **Third-Party Invites** | ✅ Complete | Step-parents, grandparents with role limits |
| **Child Accounts** | ✅ Complete | Limited access with parental controls |
| **Subscription Billing** | ✅ Complete | Stripe integration, Free/Power tiers |
| **Audit Logging** | ✅ Complete | Immutable, court-defensible logs |

---

## Plan Structure

CoParrent uses a simplified two-tier subscription model:

| Plan | Price | Max Kids | Max Third-Party | Features |
|------|-------|----------|-----------------|----------|
| **Free** | $0 | 4 | 4 | Calendar, Messages, Child Info, Documents, Kids Hub*, Law Library, Blog |
| **Power** | $5/month | 6 | 6 | Everything in Free + Expenses, Court Exports, Sports Hub, Full AI Access |

*Kids Hub in Free tier has limited AI usage

**Key Points:**
- Legacy tiers (Premium, MVP) automatically map to Power tier
- Plan limits enforced server-side via PostgreSQL RPCs
- All tier checks use `normalizeTier()` for legacy compatibility
- `src/lib/planLimits.ts` is the single source of truth

---

## PWA Support

CoParrent is a Progressive Web App (PWA) with full push notification support:

| Platform | Installation | Push Notifications |
|----------|-------------|-------------------|
| **Android** | Install via browser "Add to Home Screen" | ✅ Supported |
| **iOS 16.4+** | Add to Home Screen via Safari Share button | ✅ Supported (PWA mode only) |
| **Desktop** | Install via browser address bar icon | ✅ Supported |

### Enabling Push Notifications

1. Navigate to **Settings → Notifications**
2. Tap **Enable Notifications**
3. Grant permission when prompted
4. Verify status shows "Subscribed"

**iOS Users:** You must install the app to your Home Screen first. Safari browser mode does not support push.

### Verifying PWA Health

Internal diagnostics available at `/pwa-diagnostics` (authenticated users only) shows:
- Service worker status
- Push subscription state
- Platform detection
- Backend health

---

## Operational Guarantees

The following guarantees are enforced by design:

- Plan limits are enforced **server-side** via RPC functions
- Role permissions are enforced via **Row Level Security (RLS)**
- Exported documents are **deterministic** and court-ready
- Private data is never auto-shared
- Deletions respect defined retention rules
- Audit logs are **immutable** with role snapshots

---

## What CoParrent Is Not

To avoid misuse or misinterpretation:

- CoParrent is **not** a replacement for legal counsel
- CoParrent is **not** a medical advice platform
- CoParrent is **not** an emergency communication system
- CoParrent is **not** a surveillance or monitoring tool

For exact access rules and plan enforcement, see **`docs/GATED_FEATURES.md`**.
For security architecture, see **`docs/SECURITY_MODEL.md`**.

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^18.3.1 | UI Framework |
| **TypeScript** | - | Type Safety |
| **Vite** | - | Build Tool & Dev Server |
| **Tailwind CSS** | - | Utility-First Styling |
| **shadcn/ui** | - | Component Library |
| **Framer Motion** | ^12.23.26 | Animations |
| **React Router DOM** | ^6.30.1 | Client-Side Routing |
| **TanStack React Query** | ^5.83.0 | Data Fetching & Caching |
| **React Hook Form** | ^7.61.1 | Form Management |
| **Zod** | ^3.25.76 | Schema Validation |
| **date-fns** | ^3.6.0 | Date Utilities |
| **Recharts** | ^2.15.4 | Charts & Data Visualization |
| **Lucide React** | ^0.462.0 | Icon Library |
| **jsPDF** | ^4.0.0 | PDF Generation |

### Backend (Lovable Cloud)

| Technology | Purpose |
|------------|---------|
| **Lovable Cloud** | Database, Auth, Storage, Edge Functions |
| **PostgreSQL** | Relational Database |
| **Row Level Security (RLS)** | Data Access Control |
| **Edge Functions (Deno)** | Serverless Backend Logic |

### External Services

| Service | Purpose | Status |
|---------|---------|--------|
| **Stripe** | Subscription payments & billing | ✅ Active (Live) |
| **Resend** | Transactional emails | ✅ Active |
| **hCaptcha** | Bot protection on auth forms | ✅ Active |
| **Google OAuth** | Social login | ✅ Active |
| **Lovable AI Gateway** | AI-powered features | ✅ Active |

---

## 🎨 Typography & Design System

### Fonts

- **Display Font**: `Outfit` (headings, titles) - Modern geometric sans-serif
- **Body Font**: `Inter` (body text, UI) - Highly legible system font

### Color Palette

#### Light Mode

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--primary` | 222 47% 20% | Deep Navy Blue - Trust, Professionalism |
| `--secondary` | 150 25% 92% | Warm Sage Green - Calm, Growth |
| `--accent` | 174 42% 90% | Soft Teal - Clarity, Balance |
| `--background` | 210 25% 98% | Light gray background |
| `--foreground` | 222 47% 11% | Dark text |

#### Parent-Specific Colors

| Token | Usage |
|-------|-------|
| `--parent-a` | Primary parent indicator (Blue) |
| `--parent-b` | Secondary parent indicator (Green) |

### Design Utilities

- `.glass` - Glassmorphism effect with blur
- `.shadow-elegant` - Subtle professional shadows
- `.shadow-glow` - Soft accent glow
- `.text-gradient` - Hero gradient text
- `.skeleton-shimmer` / `.skeleton-wave` - Loading animations

---

## 🔌 3rd Party Connections

### Environment Variables (Secrets)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Database URL (auto-configured) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client key (auto-configured) |
| `STRIPE_SECRET_KEY` | Stripe API (Live mode) |
| `RESEND_API_KEY` | Email delivery |
| `LOVABLE_API_KEY` | AI Gateway |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Push notifications |
| `HCAPTCHA_SECRET_KEY` | Bot protection |

---

## 🤖 AI Assistant

CoParrent integrates AI-powered features to help co-parents communicate professionally and create optimal custody arrangements.

### AI Capabilities

| Feature | Description | Edge Function |
|---------|-------------|---------------|
| **Message Tone Analysis** | Analyzes messages for hostile or inflammatory language | `ai-message-assist` |
| **Message Rephrasing** | Rewrites messages to be court-appropriate | `ai-message-assist` |
| **Quick Tone Check** | Real-time pattern matching (no AI call) | `ai-message-assist` |
| **Schedule Suggestions** | AI-powered custody schedule recommendations | `ai-schedule-suggest` |
| **Nurse Nancy** | Child health guidance chat (non-diagnostic) | `nurse-nancy-chat` |
| **Activity Generator** | Age-appropriate activity ideas | `kid-activity-generator` |
| **Coloring Page Creator** | Custom coloring pages for children | `generate-coloring-page` |

### AI Safety Boundaries

- AI outputs are **non-diagnostic and non-authoritative**
- No medical, legal, or treatment advice
- Emergency scenarios defer to local emergency services
- User input is sanitized and validated
- Requests are rate-limited per user

---

## ✨ Features & Components

### Core Features

| Feature | Components | Description |
|---------|------------|-------------|
| **Dashboard** | `Dashboard`, `DashboardLayout` | Overview with schedule, messages, children |
| **Custody Calendar** | `CalendarPage`, `CalendarWizard` | Visual schedule with parent-coded days |
| **Messaging Hub** | `MessagingHubPage`, `DeliberateComposer` | Family channels, DMs, reactions |
| **Children Profiles** | `ChildrenPage`, `ChildPhotoGallery` | Medical, school, emergency info |
| **Document Vault** | `DocumentsPage`, `CourtExportDialog` | Categories, access logs, court export |
| **Expense Tracking** | `ExpensesPage`, `ExpenseCharts` | Split tracking, receipts, reports |
| **Youth Sports Hub** | `SportsPage`, `ActivityCard` | Activities, events, map navigation |
| **Kids Hub** | `KidsHubPage`, `NurseNancyPage` | AI tools for parents and children |
| **Chore Charts** | `ChoreChartPage`, `ChoreChartView` | Multi-household chore management |
| **Gift Lists** | `GiftsPage`, `GiftListCard` | Per-child wishlists with claiming |
| **Law Library** | `UnifiedLawLibraryPage` | State-grouped legal resources |

### Gate Components

| Component | Purpose |
|-----------|---------|
| `ProtectedRoute` | Route-level auth + role enforcement |
| `PremiumFeatureGate` | Blocks non-Power plan users |
| `RoleGate` | Blocks third-party/child accounts |
| `AdminGate` | Blocks non-admin users |
| `ChildAccountGate` | Enforces child restrictions |

### Custom Hooks

| Hook | Purpose | Status |
|------|---------|--------|
| `useAuth` | Authentication state | Active |
| `useFamilyRole` | Family role detection (per-family) | Active |
| `usePermissions` | Unified permission flags | Active |
| `useMessagingHub` | Primary messaging hook | Active |
| `useUnreadMessages` | Unread count tracking | Active |
| `useChildren` | Children data CRUD | Active |
| `useDocuments` | Document management | Active |
| `useExpenses` | Expense tracking | Active |
| `useSubscription` | Stripe subscription status | Active |
| `usePremiumAccess` | Premium feature access checks | Active |
| `usePushNotifications` | Browser push notifications | Active |
| `useChoreCharts` | Chore chart management | Active |

---

## 🗄 Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with subscription and role |
| `families` | Family units for multi-family support |
| `family_members` | Family membership with roles |
| `children` | Child information |
| `parent_children` | Parent-child junction |
| `custody_schedules` | Custody patterns |
| `message_threads` | Messaging threads |
| `thread_messages` | Messages within threads |
| `documents` | Document metadata |
| `expenses` | Shared expense tracking |
| `child_activities` | Sports/activities per child |
| `activity_events` | Games, practices, tournaments |
| `chore_lists` | Multi-household chore configurations |
| `chores` | Individual chore definitions |
| `chore_completions` | Chore completion tracking |
| `audit_logs` | Immutable audit trail |

### Key Security Tables

| Table | Purpose |
|-------|---------|
| `user_roles` | Admin/moderator roles |
| `push_subscriptions` | Push notification endpoints |
| `user_2fa_settings` | Two-factor auth settings |
| `user_recovery_codes` | 2FA recovery codes (hashed) |

---

## 🚀 Getting Started

### Local Development

```bash
npm install
npm run dev
```

Required environment variables (auto-configured by Lovable Cloud):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test suites
npx playwright test --grep "auth"
npx playwright test --grep "subscription"
```

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/SECURITY_MODEL.md` | Security architecture and trust boundaries |
| `docs/GATED_FEATURES.md` | Feature access rules and enforcement |
| `docs/GATED_FEATURES_AUDIT.md` | Audit verification status |
| `docs/DESIGN_CONSTITUTION.md` | Visual and interaction design rules |
| `docs/PWA_TEST_CHECKLIST.md` | Manual QA for PWA functionality |
| `docs/MIGRATION_DRY_RUN.md` | Data migration validation system |

---

## Architectural Guardrails

These rules should be preserved unless explicitly revised:

### Routing & Auth
- Public routes must never render authenticated layouts
- Protected routes must always be wrapped in auth guards
- SEO-critical pages must remain publicly accessible

### State & UI Safety
- No route or action should ever fail silently
- All async mutations must have loading + error states
- White/blank screens are considered critical bugs

### Payments
- Stripe webhooks are the source of truth for subscription state
- UI should never assume payment success without webhook confirmation

### Data Integrity
- All child-related data must be linked through parent-child junction tables
- No destructive action without confirmation and audit logging
- Role is per-family, not global

---

## Explicit Non-Goals

The following are explicitly out of scope:

- Real-time location tracking
- Legal advice or court filing automation
- Direct communication with courts
- Financial arbitration or forced payment handling
- Native mobile apps beyond PWA

---

_End of README_
