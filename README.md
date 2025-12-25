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
- [Features & Components](#-features--components)
- [Application Wire Tree](#-application-wire-tree)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Incomplete Tasks / TODO](#-incomplete-tasks--todo)

---

## 🎯 Project Summary

CoParrent helps co-parents:

- **Coordinate custody schedules** with visual calendars showing each parent's time
- **Communicate securely** through logged messaging (court-admissible)
- **Share children's information** including medical records, school details, and emergency contacts
- **Store and share documents** with access logging for legal purposes
- **Manage schedule changes** with formal request/approval workflows
- **Invite step-parents** with dual-approval system

The application is designed with a **calm, professional, court-friendly aesthetic** using navy blue and sage green as primary colors to reduce stress during what can be a difficult time.

## 🧭 Project State

**Current Phase:** Active Development (Pre-Beta)  
**Environment:** Lovable Cloud + Supabase  
**Stripe Mode:** Test (as of YYYY-MM-DD)  
**Last Verified Build:** 2025-12-25  
**Verified By:** Lovable

> **Note:** The `Last Verified Build` and `Verified By` fields must be updated whenever a behavioral or architectural change is made.

### Current Focus

- Stabilizing core CRUD flows (Children, Expenses, Documents)
- Fixing auth-gated routing inconsistencies
- Hardening Stripe subscription lifecycle

### Known Blocking Issues

_None currently. All previously identified blocking issues have been resolved._

_Last updated: 2025-12-25_

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

---

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

| Feature          | Components              | Description                     |
| ---------------- | ----------------------- | ------------------------------- |
| Calendar View    | `CalendarPage`          | Visual custody schedule         |
| Schedule Setup   | `CalendarWizard`        | Pattern-based schedule creation |
| Change Requests  | `ScheduleChangeRequest` | Formal swap/cancel requests     |
| Realtime Updates | `useRealtimeSchedule`   | Live schedule synchronization   |

### 5. Children Management

| Feature       | Components                           | Description                 |
| ------------- | ------------------------------------ | --------------------------- |
| Children List | `ChildrenPage`                       | Child profile cards         |
| Child Details | Medical, school, emergency info      | Comprehensive child records |
| Realtime Sync | `useRealtimeChildren`, `useChildren` | Live data updates           |

### 6. Messaging

| Feature               | Components             | Description                         |
| --------------------- | ---------------------- | ----------------------------------- |
| **Message Thread**    | `MessagesPage`         | Secure co-parent messaging          |
| **AI Tone Assistant** | `MessageToneAssistant` | AI-powered message tone suggestions |
| **Message History**   | `useMessages`          | Message data management             |
| **Read Receipts**     | Timestamp tracking     | Message read confirmation           |

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

### 10. Law Library

| Feature                   | Components                         | Description                          |
| ------------------------- | ---------------------------------- | ------------------------------------ |
| **Legal Resources**       | `LawLibraryPage`, `LawLibraryCard` | State-specific legal documents       |
| **State Filtering**       | Filter by state                    | Find jurisdiction-relevant resources |
| **Category Organization** | Legal categories                   | Custody, support, visitation, etc.   |
| **Disclaimer**            | `LawLibraryDisclaimer`             | Legal information disclaimer         |

### 11. Settings & Account

| Feature                 | Components             | Description                      |
| ----------------------- | ---------------------- | -------------------------------- |
| **Settings Page**       | `SettingsPage`         | Account management hub           |
| **Co-Parent Invite**    | `CoParentInvite`       | Email invitation system          |
| **Step-Parent Manager** | `StepParentManager`    | Dual-approval step-parent access |
| **Trial Status**        | `TrialStatus`          | Subscription/trial tracking      |
| **Notifications**       | `NotificationSettings` | Notification preferences         |
| **Subscription**        | `useSubscription`      | Stripe subscription management   |

### 12. Admin

| Feature                 | Components                | Description                       |
| ----------------------- | ------------------------- | --------------------------------- |
| **Admin Dashboard**     | `AdminDashboard`          | User management, analytics        |
| **User Roles**          | Role-based access control | admin, moderator, user roles      |
| **Law Library Manager** | `AdminLawLibraryManager`  | Upload and manage legal resources |
| **Blog Management**     | Blog CRUD                 | Create and edit blog posts        |

### 13. UI Components (shadcn/ui + Custom)

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

| Hook                     | Purpose                             |
| ------------------------ | ----------------------------------- |
| `useAuth`                | Authentication state management     |
| `useChildren`            | Children data CRUD                  |
| `useRealtimeChildren`    | Realtime children updates           |
| `useDocuments`           | Document management                 |
| `useMessages`            | Messaging functionality             |
| `useExpenses`            | Expense tracking and reimbursements |
| `useLawLibrary`          | Law library resource access         |
| `useAdminLawLibrary`     | Admin law library management        |
| `useNotifications`       | Notification management             |
| `useNotificationService` | Notification dispatch service       |
| `usePushNotifications`   | Browser push notifications          |
| `useRealtimeSchedule`    | Live schedule updates               |
| `useSchedulePersistence` | Schedule data persistence           |
| `useScheduleRequests`    | Schedule change requests            |
| `useSubscription`        | Stripe subscription status          |
| `useMobile`              | Responsive breakpoint detection     |
| `useToast`               | Toast notifications                 |

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
│   │   ├── Message thread view
│   │   ├── Message composer
│   │   └── Message history
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
│   │   ├── StepParentManager
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

| Table                    | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `profiles`               | User profiles with subscription and co-parent linking   |
| `children`               | Child information (medical, school, emergency contacts) |
| `parent_children`        | Junction table linking parents to children              |
| `custody_schedules`      | Custody patterns and schedule definitions               |
| `schedule_requests`      | Schedule change requests                                |
| `exchange_checkins`      | Exchange confirmation records                           |
| `messages`               | Co-parent messages                                      |
| `documents`              | Document metadata                                       |
| `document_access_logs`   | Document access audit trail                             |
| `expenses`               | Shared expense tracking                                 |
| `reimbursement_requests` | Expense reimbursement workflows                         |
| `journal_entries`        | Private journal entries                                 |
| `notifications`          | User notifications                                      |
| `invitations`            | Co-parent invitations                                   |
| `step_parents`           | Step-parent access with dual approval                   |
| `law_library_resources`  | State-specific legal documents                          |
| `blog_posts`             | Blog content                                            |
| `user_roles`             | Role-based access (admin, moderator, user)              |

### Edge Functions

| Function                  | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| `admin-manage-users`      | Admin user management                     |
| `ai-message-assist`       | AI-powered message tone suggestions       |
| `ai-schedule-suggest`     | AI-powered schedule recommendations       |
| `check-subscription`      | Verify Stripe subscription status         |
| `create-checkout`         | Create Stripe checkout session            |
| `customer-portal`         | Stripe customer portal access             |
| `exchange-reminders`      | Automated exchange reminder notifications |
| `generate-expense-report` | PDF expense report generation             |
| `send-coparent-invite`    | Send invitation emails via Resend         |
| `send-notification`       | Push notification delivery                |

---

## 🧠 Decision Log

| Date       | Decision                                | Reason                             |
| ---------- | --------------------------------------- | ---------------------------------- |
| YYYY-MM-DD | Blog kept public and SEO-indexed        | Marketing + organic discovery      |
| YYYY-MM-DD | Stripe webhooks limited to 4 events     | Reduce noise + simplify edge logic |
| YYYY-MM-DD | Dashboard UI gated strictly behind auth | Prevent data leakage               |

> **Policy:** Decision Log entries must never be rewritten; new decisions are appended only.

---

## 🔄 Change Log

> **Policy:** Any change affecting routing, authentication, payments, data integrity, or user access must be recorded here. Do not remove existing entries.

### 2025-12-25

- **Fixed:** White screen on create actions (Children, Expenses, Vault)
  - Added `isSaving` state with loading indicators to Children page Add/Edit dialogs
  - Wrapped async mutations in try-catch blocks with proper error handling
  - All three pages already had ErrorBoundary wrappers
- **Fixed:** Blog route rendering authenticated layout when logged out
  - Created `PublicLayout` component with Navbar/Footer for public pages
  - Updated `/blog` and `/blog/:slug` routes to use public layout
  - Dashboard blog routes still available at `/dashboard/blog` for authenticated users

### YYYY-MM-DD

- Integrated Stripe webhook via Supabase Edge Function
- Locked webhook events to Lovable-required set

---

## 🧪 QA Acceptance Checks

### Auth & Routing

- Logged-out users never see dashboard sidebar
- Blog page loads publicly and is crawlable

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

- [x] ~~**Calendar Integration**: Implement visual calendar with custody pattern display~~ ✅ Implemented
- [x] ~~**Schedule Pattern Engine**: Complete pattern-based schedule generation~~ ✅ Implemented
- [ ] **Push Notifications**: Complete browser push notification implementation
- [ ] **Email Notifications**: Send emails for messages, schedule changes, etc.
- [ ] **Court Export**: Generate court-ready PDF exports of communications and schedules

### Medium Priority

- [ ] **Holiday Schedules**: Add holiday/special occasion override scheduling
- [ ] **Recurring Events**: Child activities, appointments scheduling
- [ ] **File Previews**: In-app document preview (PDF, images)
- [ ] **Message Search**: Search through message history
- [ ] **Mobile App**: Native iOS/Android apps (currently PWA only)

### Low Priority / Nice to Have

- [ ] **Dark Mode Toggle**: UI toggle for dark/light mode (CSS ready)
- [ ] **Multiple Children Calendars**: Per-child schedule overrides
- [x] ~~**Expense Tracking**: Shared expense management~~ ✅ Implemented
- [ ] **Mileage Tracking**: Exchange location distance tracking
- [ ] **Integration with Family Law Portals**: Direct court filing integration
- [x] ~~**AI-Powered Message Assistance**: Analyze messages for tone issues~~ ✅ Implemented

### Completed Features

- [x] **Expense Tracking & Reimbursements**: Full expense management with categories and reimbursement requests
- [x] **Journal/Notes**: Private journaling with mood tracking and exchange notes
- [x] **Law Library**: State-specific legal resources with admin management
- [x] **AI Message Tone Assistant**: AI-powered suggestions for professional communication
- [x] **Exchange Check-ins**: Custody exchange confirmation and logging
- [x] **Real-time Updates**: Live data synchronization for schedules and children

### Technical Debt

- [ ] **Unit Tests**: Add comprehensive test coverage
- [ ] **E2E Tests**: Playwright or Cypress testing
- [ ] **Error Boundaries**: Add React error boundaries
- [ ] **Accessibility Audit**: Full WCAG compliance review
- [ ] **Performance Optimization**: Lazy loading for routes, image optimization

### Bug Fixes Needed

- [ ] Verify step-parent approval flow works end-to-end
- [ ] Test subscription webhook handling with Stripe
- [ ] Validate realtime subscriptions cleanup on unmount

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

| Change Type                          | Update Required                         |
| ------------------------------------ | --------------------------------------- |
| Fixed a blocking issue               | Update **Project State** → Known Issues |
| Changed routing, auth, payments      | Add entry to **Change Log**             |
| Made architectural decision          | Append to **Decision Log**              |
| Behavioral or structural change      | Update **Last Verified Build** date     |

### Rules

1. If a requested change conflicts with the README, execution should pause and request clarification before proceeding.
2. When implementing fixes or changes, update:
   - **Project State** if the issue is blocking
   - **Change Log** once resolved
3. Decision Log entries must never be rewritten; new decisions are appended only.
4. The README should evolve incrementally, not be rewritten wholesale.

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🤝 Contributing

This is a private project. For access or contribution inquiries, please contact the project maintainers.

---

<p align="center">
  <strong>CoParrent</strong> - Putting children first through organized co-parenting
</p>
