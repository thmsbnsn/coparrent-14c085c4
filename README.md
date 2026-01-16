# CoParrent - Modern Co-Parenting Custody Toolkit

<p align="center">
  <img src="src/assets/coparrent-logo.svg" alt="CoParrent Logo" width="200"/>
</p>

**CoParrent** is a comprehensive web application designed to help separated or divorced parents manage their co-parenting responsibilities with ease. The platform provides smart scheduling, secure messaging, document management, and court-ready exports to reduce conflict and keep children's well-being at the center.

---

## 📋 Table of Contents

- [Project Summary](#-project-summary)
- [Tech Stack](#-tech-stack)
- [Typography & Design System](#-typography--design-system)
- [3rd Party Connections](#-3rd-party-connections)
- [AI Assistant](#-ai-assistant)
- [Features & Components](#-features--components)
- [Application Wire Tree](#-application-wire-tree)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Incomplete Tasks / TODO](#-incomplete-tasks--todo)

---

## 🎯 Project Summary

CoParrent helps co-parents:

- **Coordinate custody schedules** with visual calendars showing each parent's time
- **Communicate securely** through the Messaging Hub with group and direct messaging (court-admissible)
- **Share children's information** including medical records, school details, and emergency contacts
- **Store and share documents** with access logging for legal purposes
- **Manage schedule changes** with formal request/approval workflows
- **Invite third-party members** (step-parents, grandparents, babysitters) via email invitation

The application is designed with a **calm, professional, court-friendly aesthetic** using navy blue and sage green as primary colors to reduce stress during what can be a difficult time.

## 🧭 Project State

**Current Maturity:** Beta-Candidate — core workflows function, but security, billing, and edge cases need validation before production.

**Current Phase:** Active Development (Beta-Ready)  
**Environment:** Lovable Cloud + Supabase  
**Stripe Mode:** Test  
**Last Verified Build:** 2026-01-16  
**Verified By:** Lovable  
**Last README Update:** 2026-01-16

> **Note:** The `Last Verified Build` and `Verified By` fields must be updated whenever a behavioral or architectural change is made.

### Current Focus

- Youth Sports Hub feature with calendar integration
- Smart reminder notifications with leave-by time calculations
- Delete child profile with cascade cleanup
- Expanding Law Library with comprehensive state-by-state legal resources
- Child account system with parental controls and COPPA compliance
- PWA enhancements with iOS push notifications

### Known Blocking Issues

_None currently. All previously identified blocking issues have been resolved._

_Last updated: 2026-01-16_

---

## 📊 Feature Completion Matrix

This section inventories the app's major features and systems with their current implementation status.

### Authentication & User Management

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| Email/Password Auth | Standard authentication with email confirmation | ✅ Complete | Lovable Cloud Auth | None | Low |
| Google OAuth | Social login via Google | ✅ Complete | Google OAuth credentials | None | Low |
| Apple OAuth | Social login via Apple | ⚠️ Partial | Apple OAuth credentials | Not tested in production | Medium |
| Password Reset | Forgot password flow via email | ✅ Complete | Resend (email) | None | Low |
| Session Management | Active session tracking and logout | ✅ Complete | None | Session invalidation on permission change | Low |
| Two-Factor Auth | TOTP-based 2FA setup | ⚠️ Partial | None | Not persisted to database (UI only) | High |
| Device Trust | Trusted device management | ⚠️ Partial | user_devices table | Login notification triggers need validation | Medium |
| Recovery Codes | Backup codes for 2FA | ⚠️ Partial | None | Not persisted, UI placeholder only | High |

### Parent / Co-Parent Permissions

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| Co-Parent Invitation | Email-based invitation system | ✅ Complete | Resend, invitations table | None | Low |
| Co-Parent Linking | Automatic linking on invite acceptance | ✅ Complete | profiles.co_parent_id | None | Low |
| Third-Party Invitations | Invite step-parents, grandparents, etc. | ✅ Complete | family_members table | Plan limits not enforced in RLS | Medium |
| Role Detection | Parent vs third-party role resolution | ✅ Complete | useFamilyRole hook | None | Low |
| Feature Gating | Route/feature restrictions by role | ✅ Complete | ProtectedRoute, RoleGate | Some edge cases may bypass | Medium |

### Child Account System

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| Child Profile Creation | Create child records with medical/school info | ✅ Complete | children table, RPC | None | Low |
| Child Account Linking | Link auth account to child profile | ✅ Complete | profiles.linked_child_id | None | Low |
| Permission Controls | Parent manages child permissions | ✅ Complete | child_permissions table | Needs real-world testing | Low |
| Kids Dashboard | Child-specific dashboard view | ✅ Complete | KidsDashboard component | Limited features exposed | Low |
| Login Enable/Disable | Parent can disable child login | ✅ Complete | profiles.login_enabled | None | Low |
| COPPA Compliance | Default-off notifications, no tracking | ✅ Complete | N/A | Legal review pending | Medium |

### Youth Sports Hub

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| Activity Management | Create/edit child activities | ✅ Complete | child_activities table | None | Low |
| Event Scheduling | Create games, practices, tournaments | ✅ Complete | activity_events table | None | Low |
| Calendar Integration | Sports events show in custody calendar | ✅ Complete | useSportsEvents hook | Visual differentiation could improve | Low |
| Map Navigation | Directions to venues (Google/Apple/Waze) | ✅ Complete | useMapNavigation hook | Requires native app links | Low |
| Parent Responsibilities | Assign drop-off/pick-up per event | ✅ Complete | activity_events columns | None | Low |
| Smart Reminders | Leave-by time calculations | ⚠️ Partial | sports-event-reminders function | Not tested with real users | Medium |
| Equipment Checklists | Track required gear per event | ✅ Complete | equipment_needed JSON | None | Low |

### AI Features

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| Message Tone Analysis | Analyze message for hostile patterns | ✅ Complete | ai-message-assist function | None | Low |
| Message Rephrasing | AI rewrites for court-appropriate tone | ✅ Complete | ai-message-assist function | None | Low |
| Quick Tone Check | Local pattern matching (no AI call) | ✅ Complete | Frontend only | None | Low |
| Schedule Suggestions | AI-powered custody pattern recommendations | ✅ Complete | ai-schedule-suggest function | Limited pattern library | Low |
| Rate Limiting | Per-user daily AI request limits | ✅ Complete | ai_usage_daily table | Limit thresholds need tuning | Low |

### Payments & Subscriptions

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| Stripe Checkout | Create checkout sessions | ✅ Complete | Stripe, create-checkout function | Test mode only | High |
| Subscription Webhooks | Handle Stripe events | ✅ Complete | stripe-webhook function | Not tested with live events | High |
| Customer Portal | Manage billing in Stripe | ✅ Complete | customer-portal function | None | Low |
| Trial System | 14-day trial tracking | ✅ Complete | profiles.trial_ends_at | Auto-downgrade not tested | Medium |
| Feature Gating | Premium features locked by tier | ✅ Complete | PremiumFeatureGate, usePremiumAccess | Some features may not gate properly | Medium |
| Plan Limits | Third-party member limits by plan | ⚠️ Partial | count_third_party_members RPC | Not enforced at RLS level | Medium |

### Notifications & Reminders

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| In-App Notifications | Notification bell and list | ✅ Complete | notifications table | None | Low |
| Browser Push | Web push notifications | ⚠️ Partial | usePushNotifications hook | VAPID keys needed for production | Medium |
| iOS Push | iOS PWA push support | ⚠️ Partial | Service worker, Push API | Limited iOS Safari support | High |
| Email Notifications | Transactional emails | ⚠️ Partial | Resend, edge functions | Not all events trigger emails | Medium |
| Exchange Reminders | Custody exchange alerts | ✅ Complete | exchange-reminders function | Cron trigger needs setup | Medium |
| Sports Reminders | Activity event reminders | ✅ Complete | sports-event-reminders function | Cron trigger needs setup | Medium |

### Exports (PDF / Calendar)

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| Message PDF Export | Export messaging thread to PDF | ✅ Complete | jspdf, pdfExport.ts | Formatting could improve | Low |
| Expense Report PDF | Generate expense reports | ✅ Complete | generate-expense-report function | None | Low |
| Calendar Export (ICS) | Export schedule to ICS format | ✅ Complete | calendarExport.ts | None | Low |
| Court-Ready Exports | Comprehensive legal documentation | ❌ Missing | N/A | Major gap for legal use case | High |

### Admin & Moderation

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| Admin Dashboard | User management interface | ✅ Complete | AdminDashboard, user_roles | Limited functionality | Low |
| Role Management | Admin/moderator role assignment | ✅ Complete | user_roles table, has_role RPC | None | Low |
| Law Library Admin | Upload/manage legal resources | ✅ Complete | AdminLawLibraryManager | None | Low |
| Blog Management | Create/edit blog posts | ✅ Complete | blog_posts table | No preview before publish | Low |
| User Administration | View/manage users | ⚠️ Partial | admin-manage-users function | Limited actions available | Medium |

### Security Guards & Rate Limiting

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| Row Level Security | Database access control | ✅ Complete | RLS policies | Complex policies need audit | Medium |
| Route Guards | Protected route enforcement | ✅ Complete | ProtectedRoute component | None | Low |
| AI Rate Limiting | Per-user AI request limits | ✅ Complete | aiRateLimit.ts, aiGuard.ts | None | Low |
| Function Rate Limiting | Edge function abuse prevention | ✅ Complete | functionRateLimit.ts | Not applied to all functions | Medium |
| hCaptcha | Bot protection on auth forms | ✅ Complete | hCaptcha integration | None | Low |
| Input Validation | Zod schema validation | ✅ Complete | validations.ts | Not comprehensive | Medium |
| Audit Logging | Change tracking | ⚠️ Partial | audit_logs table, log_audit_event | Not all actions logged | Medium |

### PWA & Offline

| Feature | Description | Status | Dependencies | Known Gaps | Risk |
|---------|-------------|--------|--------------|------------|------|
| PWA Manifest | App installation metadata | ✅ Complete | vite-plugin-pwa | None | Low |
| Service Worker | Offline caching | ✅ Complete | public/sw.js | Limited offline functionality | Medium |
| Offline Indicator | Show offline status | ✅ Complete | OfflineIndicator component | None | Low |
| Background Sync | Sync queued actions | ⚠️ Partial | Service worker | Not fully implemented | Medium |
| Install Prompt | PWA install suggestion | ✅ Complete | PWAInstallPrompt component | None | Low |

---

## 🛠 Tech Stack

### Frontend

| Technology               | Version   | Purpose                     |
| ------------------------ | --------- | --------------------------- |
| **React**                | ^18.3.1   | UI Framework                |
| **TypeScript**           | -         | Type Safety                 |
| **Vite**                 | -         | Build Tool & Dev Server     |
| **Tailwind CSS**         | -         | Utility-First Styling       |
| **shadcn/ui**            | -         | Component Library           |
| **Framer Motion**        | ^12.23.26 | Animations                  |
| **React Router DOM**     | ^6.30.1   | Client-Side Routing         |
| **TanStack React Query** | ^5.83.0   | Data Fetching & Caching     |
| **React Hook Form**      | ^7.61.1   | Form Management             |
| **Zod**                  | ^3.25.76  | Schema Validation           |
| **date-fns**             | ^3.6.0    | Date Utilities              |
| **Recharts**             | ^2.15.4   | Charts & Data Visualization |
| **Lucide React**         | ^0.462.0  | Icon Library                |

### Backend (Lovable Cloud / Supabase)

| Technology                   | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| **Supabase**                 | Database, Auth, Storage, Edge Functions |
| **PostgreSQL**               | Relational Database                     |
| **Row Level Security (RLS)** | Data Access Control                     |
| **Edge Functions (Deno)**    | Serverless Backend Logic                |

### PWA Support

| Technology          | Purpose                     |
| ------------------- | --------------------------- |
| **vite-plugin-pwa** | Progressive Web App Support |
| **Service Worker**  | Offline Caching             |

---

## 🧱 Architectural Guardrails

These rules should be preserved unless explicitly revised.

### Routing & Auth

- Public routes must never render authenticated layouts or sidebar navigation
- Protected routes must always be wrapped in auth guards
- SEO-critical pages (Blog, Pricing, About) must remain publicly accessible

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

## 🎨 Typography & Design System

### Fonts

- **Display Font**: `Outfit` (headings, titles) - Modern geometric sans-serif
- **Body Font**: `Inter` (body text, UI) - Highly legible system font

### Color Palette

#### Light Mode

| Token          | HSL Value   | Usage                                   |
| -------------- | ----------- | --------------------------------------- |
| `--primary`    | 222 47% 20% | Deep Navy Blue - Trust, Professionalism |
| `--secondary`  | 150 25% 92% | Warm Sage Green - Calm, Growth          |
| `--accent`     | 174 42% 90% | Soft Teal - Clarity, Balance            |
| `--background` | 210 25% 98% | Light gray background                   |
| `--foreground` | 222 47% 11% | Dark text                               |

#### Parent-Specific Colors

| Token        | Usage                              |
| ------------ | ---------------------------------- |
| `--parent-a` | Primary parent indicator (Blue)    |
| `--parent-b` | Secondary parent indicator (Green) |

#### Semantic Colors

- `--success`: Green for positive states
- `--warning`: Orange for alerts
- `--destructive`: Red for errors/deletions
- `--info`: Blue for informational messages

### Design Utilities

- `.glass` - Glassmorphism effect with blur
- `.shadow-elegant` - Subtle professional shadows
- `.shadow-glow` - Soft accent glow
- `.text-gradient` - Hero gradient text
- `.skeleton-shimmer` / `.skeleton-wave` - Loading animations

---

### Explicit Non-Goals (For Now)

The following are explicitly out of scope and should be treated as constraints unless explicitly revised:

- Real-time location tracking
- Legal advice or court filing automation
- Direct communication with courts
- Financial arbitration or forced payment handling
- Native mobile apps beyond PWA

These non-goals may be revisited post-beta.

## 🔌 3rd Party Connections

### Integrated Services

| Service                   | Purpose                                                   | Status    |
| ------------------------- | --------------------------------------------------------- | --------- |
| **Lovable Cloud Auth**    | User authentication (Email, Google, Apple OAuth)          | ✅ Active |
| **Lovable Cloud Storage** | Document storage with access logging                      | ✅ Active |
| **Stripe**                | Subscription payments & billing                           | ✅ Active |
| **Resend**                | Transactional emails (invitations, notifications)         | ✅ Active |
| **hCaptcha**              | Bot protection on auth forms                              | ✅ Active |
| **Google OAuth**          | Social login                                              | ✅ Active |
| **Apple OAuth**           | Social login                                              | ✅ Active |
| **Lovable AI Gateway**    | AI-powered message tone assistance & schedule suggestions | ✅ Active |

### Environment Variables (Secrets)

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `LOVABLE_API_KEY` (AI Gateway)
- `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`
- `HCAPTCHA_SECRET_KEY`
- `OPENROUTER_API_KEY` (AI edge functions)

---

## 🤖 AI Assistant

CoParrent integrates AI-powered features to help co-parents communicate professionally and create optimal custody arrangements. All AI interactions are authenticated and processed through secure edge functions.

### AI Capabilities

| Feature                   | Description                                                           | Edge Function         |
| ------------------------- | --------------------------------------------------------------------- | --------------------- |
| **Message Tone Analysis** | Analyzes messages for hostile or inflammatory language patterns       | `ai-message-assist`   |
| **Message Rephrasing**    | Rewrites messages to be court-appropriate and professional            | `ai-message-assist`   |
| **Quick Tone Check**      | Real-time pattern matching for problematic phrases                    | `ai-message-assist`   |
| **Schedule Suggestions**  | AI-powered custody schedule recommendations based on family situation | `ai-schedule-suggest` |

### AI Files & Components

#### Edge Functions (Backend)

| File                                              | Purpose                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `supabase/functions/ai-message-assist/index.ts`   | Handles message tone analysis, rephrasing, and quick checks                                      |
| `supabase/functions/ai-schedule-suggest/index.ts` | Generates custody schedule suggestions based on children's ages, conflict level, and preferences |

#### Frontend Components

| File                                               | Purpose                                                           |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| `src/components/messages/MessageToneAssistant.tsx` | UI component for tone analysis and message rephrasing suggestions |
| `src/components/calendar/CalendarWizard.tsx`       | Schedule setup wizard with AI-powered pattern suggestions         |

### AI Message Assist (`ai-message-assist`)

The message assistance function provides three actions:

1. **`quick-check`**: Pattern-based analysis without AI calls
   - Detects hostile patterns (e.g., "you always", "you never", personal attacks)
   - Checks for ALL CAPS usage
   - Returns immediate feedback with suggestions

2. **`analyze`**: Full AI-powered tone analysis
   - Returns overall tone (positive/neutral/concerning)
   - Tone score (1-10)
   - Child-focused assessment
   - Court-appropriateness evaluation
   - Specific suggestions and positive aspects

3. **`rephrase`**: AI-powered message rewriting
   - Removes emotional language and personal attacks
   - Focuses on facts and children's wellbeing
   - Maintains professional, business-like tone
   - Keeps requests clear and actionable

### AI Schedule Suggest (`ai-schedule-suggest`)

Generates custody schedule recommendations based on:

- **Children Information**: Count and ages
- **Conflict Level**: High-conflict vs standard co-parenting
- **State**: Jurisdiction for legal context
- **Preferences**: Parent-specified preferences

Returns 2-3 pattern suggestions with:

- Pattern name and description
- Pros and cons for the specific situation
- 14-day visual representation
- Holiday handling tips
- Exchange timing recommendations
- Age-appropriate considerations

### Tone Check Patterns

The quick-check system detects these patterns locally (no AI call required):

| Pattern              | Example                          | Suggestion                          |
| -------------------- | -------------------------------- | ----------------------------------- |
| Generalizations      | "you always", "you never"        | Focus on specific situations        |
| Blame                | "your fault", "blame you"        | Use 'I feel' statements             |
| Personal attacks     | "stupid", "idiot", "incompetent" | Remove attacks, focus on issue      |
| Demands              | "demand", "insist", "must"       | Use "request" or "would appreciate" |
| Multiple exclamation | "!!!"                            | One exclamation is sufficient       |
| Inflammatory         | "can't believe", "ridiculous"    | Express concerns calmly             |
| Threats              | "never see", "my lawyer"         | Focus on finding solutions          |
| ALL CAPS             | "THREE+ WORDS SHOUTING"          | Avoid shouting                      |

### Security & Authentication

All AI endpoints require authentication:

- JWT token verification before processing
- User ID logged for audit purposes
- No user data stored by AI services
- Rate limiting recommended (TODO)

### AI Model Configuration

Both edge functions use OpenRouter API with:

- **Model**: `google/gemini-2.0-flash-exp:free`
- **Temperature**: 0.7
- **Max Tokens**: 1000-2000

### Environment Variables

| Variable             | Purpose                              |
| -------------------- | ------------------------------------ |
| `OPENROUTER_API_KEY` | Authentication for OpenRouter AI API |

### User Interaction Flow

```
User Types Message
       │
       ▼
┌──────────────────┐
│  Quick Check     │ ◄── Local pattern matching (no AI)
│  (500ms debounce)│
└──────────────────┘
       │
       ▼ (if issues found)
┌──────────────────┐
│  Show Warnings   │
│  + Analyze/      │
│    Rephrase      │
│    Buttons       │
└──────────────────┘
       │
       ├─────────────────────┐
       ▼                     ▼
┌──────────────┐     ┌──────────────┐
│   Analyze    │     │   Rephrase   │
│   (AI Call)  │     │   (AI Call)  │
└──────────────┘     └──────────────┘
       │                     │
       ▼                     ▼
┌──────────────┐     ┌──────────────┐
│  Show Full   │     │  Show        │
│  Analysis    │     │  Suggestion  │
│  Panel       │     │  + Apply Btn │
└──────────────┘     └──────────────┘
```

### Guidelines for AI Modifications

When modifying AI functionality:

1. **Never remove authentication** - All AI endpoints must verify JWT tokens
2. **Preserve audit logging** - Keep user ID logging for security audit
3. **Maintain court-friendly focus** - AI prompts must prioritize professional, court-appropriate output
4. **Child-focused messaging** - All suggestions should center on children's wellbeing
5. **No data persistence** - AI functions should not store user messages or children's information
6. **Error handling** - Return appropriate error responses, never expose internal errors to clients

## ✨ Features & Components

### 1. Landing Pages

| Feature  | Components                                            | Description                  |
| -------- | ----------------------------------------------------- | ---------------------------- |
| Homepage | `Navbar`, `Hero`, `Features`, `Footer`                | Marketing landing page       |
| Pricing  | `Pricing` page                                        | Subscription tier comparison |
| About    | `About` page                                          | Company/product information  |
| Blog     | `BlogPage`, `BlogPostPage`, `BlogCard`, `ShareDialog` | Content marketing            |

### 2. Authentication

| Feature          | Components                        | Description                   |
| ---------------- | --------------------------------- | ----------------------------- |
| Login            | `Login`, `SocialLoginButtons`     | Email/password + Google OAuth |
| Signup           | `Signup`, `SocialLoginButtons`    | User registration with trial  |
| Password Reset   | `ForgotPassword`, `ResetPassword` | Password recovery flow        |
| Protected Routes | `ProtectedRoute`, `AuthContext`   | Route guards                  |

### 3. Dashboard

| Feature          | Components                                  | Description                                |
| ---------------- | ------------------------------------------- | ------------------------------------------ |
| Main Dashboard   | `Dashboard`, `DashboardLayout`              | Overview with schedule, messages, children |
| Navigation       | `NavLink`, sidebar navigation               | Responsive sidebar with collapse           |
| Notifications    | `NotificationDropdown`, `NotificationsPage` | Real-time notification system              |
| Blog Integration | `BlogDashboardCard`                         | Latest blog posts in dashboard             |

### 4. Custody Calendar

| Feature                | Components              | Description                        |
| ---------------------- | ----------------------- | ---------------------------------- |
| Calendar View          | `CalendarPage`          | Visual custody schedule            |
| Schedule Setup         | `CalendarWizard`        | Pattern-based schedule creation    |
| Change Requests        | `ScheduleChangeRequest` | Formal swap/cancel requests        |
| Realtime Updates       | `useRealtimeSchedule`   | Live schedule synchronization      |
| **Sports Integration** | `SportsEventDetail`     | View sports events in calendar     |
| **Multi-Event Popup**  | `SportsEventListPopup`  | Select from multiple events on day |

### 5. Children Management

| Feature          | Components                           | Description                       |
| ---------------- | ------------------------------------ | --------------------------------- |
| Children List    | `ChildrenPage`                       | Child profile cards               |
| Child Details    | Medical, school, emergency info      | Comprehensive child records       |
| Realtime Sync    | `useRealtimeChildren`, `useChildren` | Live data updates                 |
| **Delete Child** | `DeleteChildDialog`                  | Cascade cleanup with confirmation |
| **Gift Lists**   | `GiftsPage`, `GiftListCard`          | Shared gift coordination          |
| **Gift Items**   | `GiftItemCard`, `AddGiftItemDialog`  | Gift claiming and tracking        |

### 6. Messaging Hub

| Feature               | Components             | Description                              |
| --------------------- | ---------------------- | ---------------------------------------- |
| **Family Channel**    | `MessagingHubPage`     | Group messaging for entire family        |
| **Direct Messages**   | `MessagingHubPage`     | 1-on-1 messaging between family members  |
| **AI Tone Assistant** | `MessageToneAssistant` | AI-powered message tone suggestions      |
| **Typing Indicators** | `useTypingIndicator`   | Real-time typing status display          |
| **Message History**   | `useMessagingHub`      | Thread and message data management       |
| **Role Badges**       | Visual role indicators | Show parent/third-party role in messages |
| **Court-Friendly**    | Immutable messages     | Messages cannot be edited or deleted     |

### 7. Documents

| Feature              | Components                      | Description                   |
| -------------------- | ------------------------------- | ----------------------------- |
| **Document Library** | `DocumentsPage`, `DocumentCard` | File organization by category |
| **Upload**           | `DocumentUploadDialog`          | Drag-and-drop file upload     |
| **Access Logging**   | `DocumentAccessLogDialog`       | Court-ready access trail      |
| **Secure Storage**   | `useDocuments`                  | Cloud storage integration     |

### 8. Expenses

| Feature                    | Components         | Description                          |
| -------------------------- | ------------------ | ------------------------------------ |
| **Expense List**           | `ExpensesPage`     | Shared expense tracking              |
| **Expense Categories**     | Category filtering | Medical, education, activities, etc. |
| **Reimbursement Requests** | Request workflow   | Formal reimbursement approval system |
| **Expense Reports**        | PDF generation     | Court-ready expense documentation    |

### 9. Journal

| Feature             | Components      | Description                                |
| ------------------- | --------------- | ------------------------------------------ |
| **Journal Entries** | `JournalPage`   | Private journaling for custody notes       |
| **Mood Tracking**   | Mood indicators | Track emotional state during exchanges     |
| **Exchange Notes**  | Linked entries  | Journal entries tied to exchange check-ins |
| **Tags**            | Tag system      | Organize entries with custom tags          |

### 10. Youth Sports Hub (Premium)

| Feature                   | Components                              | Description                             |
| ------------------------- | --------------------------------------- | --------------------------------------- |
| **Sports Activities**     | `SportsPage`, `ActivityCard`            | Track sports/activities per child       |
| **Activity Events**       | `EventCard`, `CreateEventDialog`        | Games, practices, tournaments           |
| **Calendar Integration**  | `useSportsEvents`                       | Sports events show in calendar          |
| **Map Navigation**        | `DirectionsDialog`, `useMapNavigation`  | Get directions (Google/Apple/Waze)      |
| **Parent Responsibility** | Drop-off/pick-up assignments            | Per-event responsibility tracking       |
| **Equipment Checklist**   | Equipment needed per event              | Track required equipment                |
| **Venue Notes**           | Parking, field numbers, tips            | Location-specific information           |
| **Smart Reminders**       | `sports-event-reminders` edge function  | Leave-by time, responsibility reminders |
| **Edit/Cancel Events**    | `EditActivityDialog`, `EditEventDialog` | Full CRUD with cancel toggle            |

### 11. Law Library

| Feature                   | Components                         | Description                                |
| ------------------------- | ---------------------------------- | ------------------------------------------ |
| **Legal Resources**       | `LawLibraryPage`, `LawLibraryCard` | State-specific legal documents             |
| **State Filtering**       | Filter by state                    | Find jurisdiction-relevant resources       |
| **Category Organization** | Legal categories                   | Parenting time, child support, custody law |
| **Disclaimer**            | `LawLibraryDisclaimer`             | Legal information disclaimer               |
| **Parenting Guidelines**  | All 50 states + DC                 | State parenting time guidelines            |
| **Child Support**         | All 50 states + DC                 | Child support calculators and guidelines   |
| **Custody Laws**          | All 50 states + DC                 | Modification and enforcement laws          |
| **Relocation Laws**       | All 50 states + DC                 | Move-away requirements and procedures      |

### 12. Settings & Account

| Feature                 | Components             | Description                             |
| ----------------------- | ---------------------- | --------------------------------------- |
| **Settings Page**       | `SettingsPage`         | Account management hub                  |
| **Co-Parent Invite**    | `CoParentInvite`       | Email invitation system                 |
| **Third-Party Manager** | `ThirdPartyManager`    | Invite step-parents, grandparents, etc. |
| **Trial Status**        | `TrialStatus`          | Subscription/trial tracking             |
| **Notifications**       | `NotificationSettings` | Notification preferences                |
| **Subscription**        | `useSubscription`      | Stripe subscription management          |
| **Role-Based Access**   | `useFamilyRole`        | Permission enforcement                  |

### 13. Admin

| Feature                 | Components                | Description                       |
| ----------------------- | ------------------------- | --------------------------------- |
| **Admin Dashboard**     | `AdminDashboard`          | User management, analytics        |
| **User Roles**          | Role-based access control | admin, moderator, user roles      |
| **Law Library Manager** | `AdminLawLibraryManager`  | Upload and manage legal resources |
| **Blog Management**     | Blog CRUD                 | Create and edit blog posts        |

### 14. UI Components (shadcn/ui + Custom)

| Component                        | Variants/Features                                     |
| -------------------------------- | ----------------------------------------------------- |
| `Button`                         | default, destructive, outline, secondary, ghost, link |
| `Card`                           | Standard card with header, content, footer            |
| `Dialog` / `AlertDialog`         | Modal dialogs                                         |
| `Drawer` / `Sheet`               | Slide-out panels                                      |
| `Input` / `Textarea`             | Form inputs                                           |
| `Select` / `Checkbox` / `Switch` | Form controls                                         |
| `Tabs`                           | Tab navigation                                        |
| `Table`                          | Data tables                                           |
| `Toast` / `Sonner`               | Notifications                                         |
| `Skeleton`                       | shimmer, wave loading states                          |
| `LoadingSpinner`                 | Branded video loading animation                       |
| `Calendar`                       | Date picker                                           |
| `Avatar`                         | User avatars                                          |
| `Badge`                          | Status indicators                                     |
| `Tooltip` / `Popover`            | Contextual info                                       |
| `Logo`                           | Animated brand logo                                   |

### 14. Custom Hooks

| Hook                     | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `useAuth`                | Authentication state management            |
| `useFamilyRole`          | Family role detection (parent/third-party) |
| `useMessagingHub`        | Messaging threads and messages             |
| `useTypingIndicator`     | Typing indicator broadcast/subscribe       |
| `useGiftLists`           | Gift list and item management              |
| `useChildren`            | Children data CRUD                         |
| `useRealtimeChildren`    | Realtime children updates                  |
| `useDocuments`           | Document management                        |
| `useMessages`            | Legacy messaging functionality             |
| `useExpenses`            | Expense tracking and reimbursements        |
| `useLawLibrary`          | Law library resource access                |
| `useAdminLawLibrary`     | Admin law library management               |
| `useNotifications`       | Notification management                    |
| `useNotificationService` | Notification dispatch service              |
| `usePushNotifications`   | Browser push notifications                 |
| `useRealtimeSchedule`    | Live schedule updates                      |
| `useSchedulePersistence` | Schedule data persistence                  |
| `useScheduleRequests`    | Schedule change requests                   |
| `useSubscription`        | Stripe subscription status                 |
| `usePremiumAccess`       | Premium feature access checks              |
| `useUserPreferences`     | User preference management                 |
| `useLoginNotification`   | Device tracking and login alerts           |
| `useMobile`              | Responsive breakpoint detection            |
| `useToast`               | Toast notifications                        |

---

## 🌳 Application Wire Tree

```
CoParrent Application
│
├── 🏠 PUBLIC ROUTES
│   ├── / (Index)
│   │   ├── Navbar
│   │   ├── Hero
│   │   ├── Features
│   │   └── Footer
│   │
│   ├── /pricing
│   ├── /about
│   ├── /features → redirects to /about
│   ├── /blog
│   │   └── Blog listing with cards
│   │
│   ├── /login
│   │   ├── Email/Password form
│   │   └── SocialLoginButtons (Google)
│   │
│   ├── /signup
│   │   ├── Registration form
│   │   └── SocialLoginButtons (Google)
│   │
│   ├── /forgot-password
│   ├── /reset-password
│   └── /accept-invite
│       └── Co-parent invitation acceptance
│
├── 🔒 PROTECTED ROUTES (require auth)
│   │
│   ├── /onboarding
│   │   └── Initial setup wizard
│   │
│   ├── /dashboard
│   │   ├── DashboardLayout (sidebar + header)
│   │   ├── Welcome section
│   │   ├── Today's Schedule card
│   │   ├── Quick Stats grid
│   │   │   ├── Upcoming Exchanges
│   │   │   ├── Recent Messages
│   │   │   └── Children Quick Access
│   │   └── BlogDashboardCard
│   │
│   ├── /dashboard/calendar
│   │   ├── Calendar view (parent-coded days)
│   │   ├── CalendarWizard (schedule setup)
│   │   └── ScheduleChangeRequest
│   │
│   ├── /dashboard/children
│   │   ├── Children cards grid
│   │   ├── Add child modal
│   │   └── Child details (medical, school, emergency)
│   │
│   ├── /dashboard/messages
│   │   ├── MessagingHub (tabs: Family/Direct)
│   │   ├── Family Channel (group chat)
│   │   ├── Direct Messages (1-on-1)
│   │   └── Message composer with PDF export
│   │
│   ├── /dashboard/documents
│   │   ├── Category tabs
│   │   ├── DocumentCard grid
│   │   ├── DocumentUploadDialog
│   │   └── DocumentAccessLogDialog
│   │
│   ├── /dashboard/settings
│   │   ├── Account settings
│   │   ├── CoParentInvite
│   │   ├── ThirdPartyManager
│   │   ├── NotificationSettings
│   │   └── TrialStatus
│   │
│   ├── /dashboard/notifications
│   │   └── Notification list
│   │
│   ├── /dashboard/blog
│   │   └── Blog listing (authenticated view)
│   │
│   ├── /dashboard/blog/:slug
│   │   └── Blog post detail
│   │
│   └── /admin
│       └── AdminDashboard (admin-only)
│
└── 🚫 404 - NotFound
```

### User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER JOURNEY                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │        Landing Page (/)        │
                    │   Hero, Features, CTA          │
                    └────────────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │     /signup     │    │     /login      │    │    /pricing     │
    │  Create Account │    │   Existing User │    │  Compare Plans  │
    └─────────────────┘    └─────────────────┘    └─────────────────┘
              │                      │
              └──────────┬───────────┘
                         ▼
              ┌─────────────────────┐
              │    /onboarding      │
              │  Initial Setup      │
              └─────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │    /dashboard       │◄────────────────┐
              │  Main Hub           │                 │
              └─────────────────────┘                 │
                         │                            │
    ┌────────────────────┼────────────────────┐       │
    ▼                    ▼                    ▼       │
┌────────┐         ┌──────────┐         ┌─────────┐  │
│Calendar│◄───────►│ Messages │◄───────►│Children │  │
└────────┘         └──────────┘         └─────────┘  │
    │                    │                    │       │
    │                    ▼                    │       │
    │              ┌──────────┐               │       │
    └─────────────►│Documents │◄──────────────┘       │
                   └──────────┘                       │
                         │                            │
                         ▼                            │
                   ┌──────────┐                       │
                   │ Settings │───────────────────────┘
                   │ Co-parent│
                   │ Invite   │
                   └──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   /accept-invite    │
              │  (Co-parent joins)  │
              └─────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  LINKED CO-PARENTS  │
              │  Shared calendar,   │
              │  messaging, docs    │
              └─────────────────────┘
```

---

## 🗄 Database Schema

### Core Tables

| Table                     | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `profiles`                | User profiles with subscription and co-parent linking   |
| `children`                | Child information (medical, school, emergency contacts) |
| `parent_children`         | Junction table linking parents to children              |
| `family_members`          | Third-party family members (step-parents, grandparents) |
| `custody_schedules`       | Custody patterns and schedule definitions               |
| `schedule_requests`       | Schedule change requests                                |
| `exchange_checkins`       | Exchange confirmation records                           |
| `message_threads`         | Messaging threads (family channel + direct messages)    |
| `thread_messages`         | Immutable messages within threads                       |
| `typing_indicators`       | Real-time typing status for messaging                   |
| `group_chat_participants` | Participants in group chat threads                      |
| `message_read_receipts`   | Read receipt tracking for messages                      |
| `messages`                | Legacy co-parent messages (deprecated)                  |
| `gift_lists`              | Shared gift lists per child/occasion                    |
| `gift_items`              | Individual gift items with claim tracking               |
| `documents`               | Document metadata                                       |
| `document_access_logs`    | Document access audit trail                             |
| `expenses`                | Shared expense tracking                                 |
| `reimbursement_requests`  | Expense reimbursement workflows                         |
| `journal_entries`         | Private journal entries                                 |
| `notifications`           | User notifications                                      |
| `invitations`             | Co-parent and third-party invitations                   |
| `step_parents`            | Step-parent approval tracking                           |
| `user_devices`            | Trusted device tracking for login notifications         |
| `law_library_resources`   | State-specific legal documents                          |
| `blog_posts`              | Blog content                                            |
| `user_roles`              | Role-based access (admin, moderator, user)              |

### Edge Functions

| Function                   | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `admin-manage-users`       | Admin user management                         |
| `ai-message-assist`        | AI-powered message tone analysis & rephrasing |
| `ai-schedule-suggest`      | AI-powered schedule pattern recommendations   |
| `check-subscription`       | Verify Stripe subscription status             |
| `create-checkout`          | Create Stripe checkout session                |
| `customer-portal`          | Stripe customer portal access                 |
| `exchange-reminders`       | Automated exchange reminder notifications     |
| `generate-expense-report`  | PDF expense report generation                 |
| `login-notification`       | Device tracking and login alerts              |
| `notify-third-party-added` | Notification when third-party joins family    |
| `send-coparent-invite`     | Send co-parent invitation emails              |
| `send-third-party-invite`  | Send third-party invitation emails            |
| `send-notification`        | Push notification delivery                    |
| `stripe-webhook`           | Stripe webhook event processing               |

---

## 🧠 Decision Log

| Date       | Decision                                | Reason                                    |
| ---------- | --------------------------------------- | ----------------------------------------- |
| 2025-12-26 | AI endpoints require JWT authentication | Security: prevent unauthorized AI usage   |
| 2025-12-26 | Shared Gift Lists for children          | Coordination and conflict reduction       |
| 2025-12-26 | Typing indicators via realtime table    | Low-latency UX for messaging              |
| 2025-12-26 | Step-Parent → Third-Party role rename   | More inclusive naming for extended family |
| 2025-12-26 | Third-Party invitation-only model       | Security: prevent unauthorized access     |
| 2025-12-26 | Messaging Hub replaces 1-on-1 messages  | Support group + DM within family group    |
| YYYY-MM-DD | Blog kept public and SEO-indexed        | Marketing + organic discovery             |
| YYYY-MM-DD | Stripe webhooks limited to 4 events     | Reduce noise + simplify edge logic        |
| YYYY-MM-DD | Dashboard UI gated strictly behind auth | Prevent data leakage                      |

> **Policy:** Decision Log entries must never be rewritten; new decisions are appended only.

---

## 🔄 Change Log

> **Policy:** Any change affecting routing, authentication, payments, data integrity, or user access must be recorded here. Do not remove existing entries.

### 2025-12-26

- **Security:** AI Edge Function Authentication
  - Added JWT token verification to `ai-message-assist` edge function
  - Added JWT token verification to `ai-schedule-suggest` edge function
  - All AI endpoints now require authenticated requests
  - User ID logged for audit purposes
- **Feature:** Shared Gift Lists
  - Created `gift_lists` and `gift_items` tables with RLS policies
  - Parents can create gift lists per child/occasion (Birthday, Holiday, Custom)
  - Family members can view and claim gifts to avoid duplicates
  - Third-party members have limited access (view, claim only)
  - Created `useGiftLists` hook for gift management
  - Created gift components: `GiftListCard`, `GiftItemCard`, `CreateGiftListDialog`, `AddGiftItemDialog`
  - Created `GiftsPage` for gift list management
- **Feature:** Typing Indicators
  - Created `typing_indicators` table with realtime enabled
  - Created `useTypingIndicator` hook for broadcast/subscribe
  - Added typing indicator display in MessagingHubPage
  - Animated dots show when other family members are typing
- **Feature:** Third-Party Join Notification
  - AcceptInvite page now triggers `notify-third-party-added` edge function
  - Parents notified when third-party members accept invitations

- **Major:** Third-Party Accounts System
  - Replaced Step-Parent concept with Third-Party role (step-parents, grandparents, babysitters, etc.)
  - Third-Party accounts can ONLY be added via email invitation from Parents/Guardians
  - Created `family_members` table with RLS policies
  - Created `ThirdPartyManager` component for invitation management
  - Created `send-third-party-invite` edge function
  - Plan limits enforced: Free (0), Pro (2), MVP (6) third-party members
- **Major:** Messaging Hub Implementation
  - Created new `MessagingHubPage` with Family Channel (group) and Direct Messages (1-on-1)
  - Users can only message people within their family group
  - Created `message_threads` and `thread_messages` tables with RLS
  - Messages are immutable (court-friendly) - no edit/delete
  - Role badges displayed in messages (Parent/Family)
  - Created `useMessagingHub` hook for messaging functionality
  - Created `useFamilyRole` hook for role detection
- **Major:** Permission System
  - Third-Party permissions enforced via route guards and RLS
  - Third-Party allowed: Messaging Hub, Journal, Law Library, Blog
  - Third-Party NOT allowed: Calendar edit, Children edit, Documents, Expenses, Settings, Admin
  - Navigation items hidden based on user role
  - `ProtectedRoute` component updated with role-based restrictions

### 2025-12-25

- **Added:** Law Library - Parenting time guidelines for 14 states (AZ, CA, CO, FL, GA, IL, NY, OH, PA, TX, WA, VA, Federal)
- **Added:** Law Library - Child support guidelines and calculators for all 50 states + DC
- **Added:** Law Library - Custody modification and enforcement laws for all 50 states + DC
- **Added:** Law Library - Relocation and move-away laws for all 50 states + DC
- **Fixed:** "Failed to add child" error - Updated `useRealtimeChildren` to use secure `create_child_with_link` RPC function instead of direct INSERT
- **Fixed:** White screen on create actions (Children, Expenses, Documents)
  - Added `isSaving` state with loading indicators to Children page Add/Edit dialogs
  - Wrapped async mutations in try-catch blocks with proper error handling
  - All three pages have ErrorBoundary wrappers
- **Fixed:** Blog route rendering authenticated layout when logged out
  - Created `PublicLayout` component with Navbar/Footer for public pages
  - Updated `/blog` and `/blog/:slug` routes to use public layout
  - Dashboard blog routes still available at `/dashboard/blog` for authenticated users
- **Added:** Comprehensive error boundary coverage
  - Created `RouteErrorBoundary` for route-level errors with navigation options
  - Created `FeatureErrorBoundary` for feature-level errors with retry capability
  - Wrapped all routes in `App.tsx` with `RouteErrorBoundary`
  - Updated Documents, Expenses, and Children pages to use `FeatureErrorBoundary`

### Previous Changes

- Integrated Stripe webhook via Supabase Edge Function
- Locked webhook events to Lovable-required set

---

## 🧪 QA Acceptance Checks

### Third-Party Access

- Free accounts cannot invite third-party members
- Pro accounts limited to 2 third-party members
- MVP+ accounts limited to 6 third-party members
- Third-party can only access: Dashboard, Messaging Hub, Journal, Law Library, Blog
- Third-party CANNOT access: Calendar (edit), Children (edit), Documents, Expenses, Settings
- Removed third-party members lose access immediately

### Auth & Routing

- Logged-out users never see dashboard sidebar
- Blog page loads publicly and is crawlable
- Third-party users see filtered navigation

### Core CRUD

- Add Child opens a form or modal and saves successfully
- Add Expense never results in a blank page
- Add Document renders upload UI reliably

### Payments

- Subscription state updates only after webhook receipt
- Failed payments downgrade access correctly

### SEO & Public Pages

- Public routes render without auth context
- No dashboard UI or sidebar leaks on public pages
- Blog pages are crawlable without JavaScript auth

---

## 🚦 Production Readiness Checklist

This section provides an honest assessment of what must be completed before deploying to production.

### Security & Auth

| Item | Status | Notes |
|------|--------|-------|
| RLS policies enabled on all tables | ✅ Ready | All tables have RLS enabled |
| RLS policies tested for edge cases | ⚠️ Needs Validation | Complex family member policies need audit |
| Password strength requirements | ✅ Ready | Enforced on signup |
| Two-factor authentication persisted | ❌ Missing | Currently UI-only, not saved to database |
| Recovery codes stored securely | ❌ Missing | Not implemented in backend |
| Session timeout/invalidation | ⚠️ Needs Validation | Basic implementation exists |
| Rate limiting on auth endpoints | ✅ Ready | hCaptcha protects forms |
| JWT token expiration configured | ✅ Ready | Supabase defaults |
| Admin role protection | ✅ Ready | has_role() RPC enforces |
| Child account isolation | ⚠️ Needs Validation | New feature, needs security review |

### Payments & Billing

| Item | Status | Notes |
|------|--------|-------|
| Stripe live mode configured | ❌ Missing | Currently test mode only |
| Webhook signature verification | ✅ Ready | Implemented in stripe-webhook |
| Failed payment handling | ⚠️ Needs Validation | Logic exists, not tested live |
| Subscription cancellation flow | ✅ Ready | Customer portal handles |
| Trial expiration handling | ⚠️ Needs Validation | Auto-downgrade needs testing |
| Plan feature enforcement | ⚠️ Needs Validation | Some features may not gate properly |
| Refund handling | ❌ Missing | No refund workflow implemented |
| Invoice/receipt emails | ⚠️ Needs Validation | Stripe handles, not customized |
| Tax handling (VAT/Sales tax) | ❌ Missing | Not configured in Stripe |

### Legal & Compliance

| Item | Status | Notes |
|------|--------|-------|
| Terms of Service page | ❌ Missing | No ToS page exists |
| Privacy Policy page | ❌ Missing | No privacy policy exists |
| Cookie consent banner | ❌ Missing | Not implemented |
| COPPA compliance for child accounts | ⚠️ Needs Validation | Defaults are safe, legal review pending |
| GDPR data export capability | ❌ Missing | No user data export |
| GDPR data deletion capability | ⚠️ Needs Validation | Profile deletion exists, cascade unclear |
| CCPA compliance | ❌ Missing | Not addressed |
| Data retention policy | ❌ Missing | No defined retention limits |
| Audit log completeness | ⚠️ Needs Validation | Partial coverage |

### Performance & Scalability

| Item | Status | Notes |
|------|--------|-------|
| Database indexes on common queries | ⚠️ Needs Validation | Some indexes exist, need audit |
| Image optimization | ⚠️ Needs Validation | Using src/assets, lazy loading partial |
| Bundle size optimization | ⚠️ Needs Validation | No code splitting implemented |
| CDN configuration | ✅ Ready | Lovable Cloud provides |
| API response times < 500ms | ⚠️ Needs Validation | Not benchmarked |
| Concurrent user testing | ❌ Missing | No load testing performed |
| Realtime subscription cleanup | ⚠️ Needs Validation | Some components may leak |
| Memory leak prevention | ⚠️ Needs Validation | Not profiled |

### Data Integrity & Backups

| Item | Status | Notes |
|------|--------|-------|
| Database backups configured | ✅ Ready | Lovable Cloud provides |
| Point-in-time recovery | ✅ Ready | Supabase feature |
| Foreign key constraints | ⚠️ Needs Validation | Most exist, some missing |
| Cascade delete behavior | ⚠️ Needs Validation | Child deletion RPC exists |
| Data migration scripts | ✅ Ready | Migrations in supabase/migrations/ |
| Seed data for testing | ❌ Missing | No seed scripts |

### Monitoring & Observability

| Item | Status | Notes |
|------|--------|-------|
| Error tracking (Sentry/similar) | ❌ Missing | Not integrated |
| Application performance monitoring | ❌ Missing | Not integrated |
| Database query monitoring | ✅ Ready | Supabase dashboard |
| Edge function logs | ✅ Ready | Supabase dashboard |
| User action audit trail | ⚠️ Needs Validation | Partial implementation |
| Health check endpoint | ❌ Missing | Not implemented |
| Alerting on failures | ❌ Missing | Not configured |

### UX & Edge Cases

| Item | Status | Notes |
|------|--------|-------|
| Empty states for all lists | ✅ Ready | Implemented |
| Loading states for all async | ✅ Ready | Implemented |
| Error handling with user feedback | ✅ Ready | Toast notifications |
| Offline fallback experience | ⚠️ Needs Validation | Basic implementation |
| Mobile responsive design | ✅ Ready | Tailwind responsive |
| Accessibility (a11y) audit | ⚠️ Needs Validation | Not formally audited |
| Browser compatibility testing | ⚠️ Needs Validation | Not systematically tested |
| Form validation feedback | ✅ Ready | React Hook Form + Zod |
| Deep link handling | ⚠️ Needs Validation | Basic routing works |

### Operational Readiness

| Item | Status | Notes |
|------|--------|-------|
| Domain configured | ⚠️ Needs Validation | Using Lovable subdomain |
| SSL certificate | ✅ Ready | Lovable Cloud provides |
| Environment variables documented | ✅ Ready | In README |
| Deployment pipeline | ✅ Ready | Lovable handles |
| Rollback procedure | ⚠️ Needs Validation | Git history available |
| Incident response plan | ❌ Missing | Not documented |
| User support channel | ❌ Missing | Not established |
| Status page | ❌ Missing | Not implemented |

### Known Risks & Constraints

| Risk | Severity | Mitigation |
|------|----------|------------|
| 2FA not persisted | High | Users think they have 2FA but don't; implement database storage |
| Stripe in test mode | High | Cannot accept real payments; switch to live mode before launch |
| No Terms of Service | High | Legal exposure; create and display ToS |
| No Privacy Policy | High | Legal exposure and app store rejection risk; create policy |
| Limited error monitoring | Medium | Bugs may go unnoticed; integrate Sentry or similar |
| Untested payment webhooks | Medium | Revenue issues possible; test with live Stripe events |
| Child account security | Medium | New feature; conduct security review |
| Court export incomplete | Medium | Core value prop gap; implement comprehensive exports |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

The `.env` file is auto-configured by Lovable Cloud with:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## 📝 Incomplete Tasks / TODO

### High Priority

- [ ] **Push Notifications**: Complete browser push notification implementation with service worker
- [ ] **Email Notifications**: Send transactional emails for messages, schedule changes, document uploads
- [ ] **Court Export**: Generate court-ready PDF exports of communications, schedules, and expense reports
- [ ] **Production Stripe**: Switch from test mode to live Stripe integration with proper webhooks

### Medium Priority

- [ ] **Holiday Schedules**: Add holiday/special occasion override scheduling with templates
- [ ] **Recurring Events**: Child activities, doctor appointments, school events scheduling
- [ ] **File Previews**: In-app document preview for PDFs and images without download
- [ ] **Message Search**: Full-text search through message history
- [ ] **Mobile App**: Native iOS/Android apps (currently PWA only)
- [ ] **Grandparent Rights**: Add grandparent visitation laws to law library
- [ ] **Domestic Violence Resources**: Add protective order and DV resources to law library

### Low Priority / Nice to Have

- [ ] **Dark Mode Toggle**: UI toggle for dark/light mode (CSS variables ready)
- [ ] **Multiple Children Calendars**: Per-child schedule overrides for split custody
- [ ] **Mileage Tracking**: Exchange location distance tracking and reimbursement
- [ ] **Integration with Family Law Portals**: Direct court filing integration
- [ ] **Mediation Scheduling**: Built-in mediation appointment booking
- [ ] **Co-parent Activity Feed**: Shared timeline of child activities and updates

### Completed Features ✅

- [x] **Visual Custody Calendar**: Interactive calendar with parent-coded days and pattern display
- [x] **Schedule Pattern Engine**: Complete pattern-based schedule generation (weekly, bi-weekly, custom)
- [x] **Expense Tracking & Reimbursements**: Full expense management with categories, receipts, and reimbursement requests
- [x] **Journal/Notes**: Private journaling with mood tracking, tags, and exchange notes
- [x] **Law Library - Parenting Time**: Guidelines for all 50 states + DC
- [x] **Law Library - Child Support**: Calculators and guidelines for all 50 states + DC
- [x] **Law Library - Custody Laws**: Modification and enforcement laws for all 50 states + DC
- [x] **Law Library - Relocation Laws**: Move-away requirements for all 50 states + DC
- [x] **AI Message Tone Assistant**: AI-powered suggestions for professional communication
- [x] **Exchange Check-ins**: Custody exchange confirmation and logging
- [x] **Real-time Updates**: Live data synchronization for schedules, children, and messages
- [x] **Document Management**: Upload, categorize, and share documents with access logging
- [x] **Co-Parent Invitations**: Email invitation system to link co-parents
- [x] **Step-Parent Access**: Dual-approval system for step-parent view access
- [x] **Admin Dashboard**: User management, analytics, and content management
- [x] **Blog System**: Full blog with categories, tags, and sharing
- [x] **Error Boundaries**: Comprehensive error handling with fallback UIs
- [x] **Children CRUD**: Add, edit, and manage child profiles with medical/school info

### Technical Debt

- [ ] **Unit Tests**: Add comprehensive test coverage with Vitest
- [ ] **E2E Tests**: Playwright or Cypress end-to-end testing
- [ ] **Accessibility Audit**: Full WCAG 2.1 AA compliance review
- [ ] **Performance Optimization**: Lazy loading for routes, image optimization, bundle splitting
- [ ] **API Rate Limiting**: Add rate limiting to edge functions
- [ ] **Audit Logging**: Comprehensive audit trail for all data changes

### Known Issues to Verify

- [ ] Verify step-parent approval flow works end-to-end in production
- [ ] Test subscription webhook handling with live Stripe events
- [ ] Validate realtime subscriptions cleanup on component unmount
- [ ] Test law library file downloads with actual uploaded PDFs

---

## 📜 README Governance

The `README.md` is the **authoritative reference** for architecture, routing, authentication, and behavioral expectations for the CoParrent project.

### Pre-Implementation Validation Checklist

Before implementing any change, verify the following:

- [ ] **Routing**: Does this change affect public vs protected routes? Check [Application Wire Tree](#-application-wire-tree)
- [ ] **Auth**: Does this touch authentication flow? Review [Architectural Guardrails > Routing & Auth](#routing--auth)
- [ ] **Payments**: Does this affect subscription or billing? Check [Architectural Guardrails > Payments](#payments)
- [ ] **Data**: Does this modify database schema or RLS? Review [Database Schema](#-database-schema)
- [ ] **Non-Goals**: Does this introduce a feature listed in [Explicit Non-Goals](#explicit-non-goals-for-now)? If yes, stop and clarify.
- [ ] **Blocking Issues**: Is this related to a [Known Blocking Issue](#known-blocking-issues)? Prioritize accordingly.

### Conflict Resolution

If a requested change conflicts with documented architecture or guardrails:

1. **Pause execution** — do not proceed with implementation
2. **Cite the conflict** — reference the specific README section
3. **Request clarification** — ask whether the README should be updated or the request revised
4. **Document decision** — if proceeding, add entry to Decision Log

### Post-Implementation Updates

After completing changes:

| Change Type                     | Update Required                         |
| ------------------------------- | --------------------------------------- |
| Fixed a blocking issue          | Update **Project State** → Known Issues |
| Changed routing, auth, payments | Add entry to **Change Log**             |
| Made architectural decision     | Append to **Decision Log**              |
| Behavioral or structural change | Update **Last Verified Build** date     |

### Rules

1. If a requested change conflicts with the README, execution should pause and request clarification before proceeding.
2. When implementing fixes or changes, update:
   - **Project State** if the issue is blocking
   - **Change Log** once resolved
3. Decision Log entries must never be rewritten; new decisions are appended only.
4. The README should evolve incrementally, not be rewritten wholesale.

---

## 📄 License

This project is proprietary software. All rights reserved. Unauthorized reproduction, distribution, or reverse engineering is prohibited.

---

## 🤝 Contributing

This is a private project. For access or contribution inquiries, please contact the project maintainers.

---

<p align="center">
  <strong>CoParrent</strong> - Putting children first through organized co-parenting
</p>
