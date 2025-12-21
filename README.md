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

### Backend (Lovable Cloud / Supabase)
| Technology | Purpose |
|------------|---------|
| **Supabase** | Database, Auth, Storage, Edge Functions |
| **PostgreSQL** | Relational Database |
| **Row Level Security (RLS)** | Data Access Control |
| **Edge Functions (Deno)** | Serverless Backend Logic |

### PWA Support
| Technology | Purpose |
|------------|---------|
| **vite-plugin-pwa** | Progressive Web App Support |
| **Service Worker** | Offline Caching |

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

## 🔌 3rd Party Connections

### Integrated Services
| Service | Purpose | Status |
|---------|---------|--------|
| **Supabase Auth** | User authentication (Email, Google OAuth) | ✅ Active |
| **Supabase Storage** | Document storage with access logging | ✅ Active |
| **Stripe** | Subscription payments & billing | ✅ Active |
| **Resend** | Transactional emails (invitations) | ✅ Active |
| **hCaptcha** | Bot protection on auth forms | ✅ Active |
| **Google OAuth** | Social login | ✅ Active |

### Environment Variables (Secrets)
- `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`
- `HCAPTCHA_SECRET_KEY`
- `GOOGLE_UNRESTRICTED_API_KEY`

---

## ✨ Features & Components

### 1. Landing Pages
| Feature | Components | Description |
|---------|------------|-------------|
| Homepage | `Navbar`, `Hero`, `Features`, `Footer` | Marketing landing page |
| Pricing | `Pricing` page | Subscription tier comparison |
| About | `About` page | Company/product information |
| Blog | `BlogPage`, `BlogPostPage`, `BlogCard`, `ShareDialog` | Content marketing |

### 2. Authentication
| Feature | Components | Description |
|---------|------------|-------------|
| Login | `Login`, `SocialLoginButtons` | Email/password + Google OAuth |
| Signup | `Signup`, `SocialLoginButtons` | User registration with trial |
| Password Reset | `ForgotPassword`, `ResetPassword` | Password recovery flow |
| Protected Routes | `ProtectedRoute`, `AuthContext` | Route guards |

### 3. Dashboard
| Feature | Components | Description |
|---------|------------|-------------|
| Main Dashboard | `Dashboard`, `DashboardLayout` | Overview with schedule, messages, children |
| Navigation | `NavLink`, sidebar navigation | Responsive sidebar with collapse |
| Notifications | `NotificationDropdown`, `NotificationsPage` | Real-time notification system |
| Blog Integration | `BlogDashboardCard` | Latest blog posts in dashboard |

### 4. Custody Calendar
| Feature | Components | Description |
|---------|------------|-------------|
| Calendar View | `CalendarPage` | Visual custody schedule |
| Schedule Setup | `CalendarWizard` | Pattern-based schedule creation |
| Change Requests | `ScheduleChangeRequest` | Formal swap/cancel requests |
| Realtime Updates | `useRealtimeSchedule` | Live schedule synchronization |

### 5. Children Management
| Feature | Components | Description |
|---------|------------|-------------|
| Children List | `ChildrenPage` | Child profile cards |
| Child Details | Medical, school, emergency info | Comprehensive child records |
| Realtime Sync | `useRealtimeChildren`, `useChildren` | Live data updates |

### 6. Messaging
| Feature | Components | Description |
|---------|------------|-------------|
| Message Thread | `MessagesPage` | Secure co-parent messaging |
| Message History | `useMessages` | Message data management |
| Read Receipts | Timestamp tracking | Message read confirmation |

### 7. Documents
| Feature | Components | Description |
|---------|------------|-------------|
| Document Library | `DocumentsPage`, `DocumentCard` | File organization by category |
| Upload | `DocumentUploadDialog` | Drag-and-drop file upload |
| Access Logging | `DocumentAccessLogDialog` | Court-ready access trail |
| Secure Storage | `useDocuments` | Supabase Storage integration |

### 8. Settings & Account
| Feature | Components | Description |
|---------|------------|-------------|
| Settings Page | `SettingsPage` | Account management hub |
| Co-Parent Invite | `CoParentInvite` | Email invitation system |
| Step-Parent Manager | `StepParentManager` | Dual-approval step-parent access |
| Trial Status | `TrialStatus` | Subscription/trial tracking |
| Notifications | `NotificationSettings` | Notification preferences |
| Subscription | `useSubscription` | Stripe subscription management |

### 9. Admin
| Feature | Components | Description |
|---------|------------|-------------|
| Admin Dashboard | `AdminDashboard` | User management, analytics |
| User Roles | Role-based access control | admin, moderator, user roles |

### 10. UI Components (shadcn/ui + Custom)
| Component | Variants/Features |
|-----------|-------------------|
| `Button` | default, destructive, outline, secondary, ghost, link |
| `Card` | Standard card with header, content, footer |
| `Dialog` / `AlertDialog` | Modal dialogs |
| `Input` / `Textarea` | Form inputs |
| `Select` / `Checkbox` / `Switch` | Form controls |
| `Tabs` | Tab navigation |
| `Table` | Data tables |
| `Toast` / `Sonner` | Notifications |
| `Skeleton` | shimmer, wave loading states |
| `LoadingSpinner` | Branded video loading animation |
| `Calendar` | Date picker |
| `Avatar` | User avatars |
| `Badge` | Status indicators |
| `Tooltip` / `Popover` | Contextual info |

### 11. Custom Hooks
| Hook | Purpose |
|------|---------|
| `useAuth` | Authentication state management |
| `useChildren` | Children data CRUD |
| `useRealtimeChildren` | Realtime children updates |
| `useDocuments` | Document management |
| `useMessages` | Messaging functionality |
| `useNotifications` | Notification management |
| `usePushNotifications` | Browser push notifications |
| `useRealtimeSchedule` | Live schedule updates |
| `useScheduleRequests` | Schedule change requests |
| `useSubscription` | Stripe subscription status |
| `useMobile` | Responsive breakpoint detection |
| `useToast` | Toast notifications |

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
| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to auth.users |
| `children` | Child information |
| `parent_children` | Junction table linking parents to children |
| `custody_schedules` | Custody patterns and schedule definitions |
| `schedule_requests` | Schedule change requests |
| `messages` | Co-parent messages |
| `documents` | Document metadata |
| `document_access_logs` | Document access audit trail |
| `notifications` | User notifications |
| `invitations` | Co-parent invitations |
| `step_parents` | Step-parent access with dual approval |
| `blog_posts` | Blog content |
| `user_roles` | Role-based access (admin, moderator, user) |

### Edge Functions
| Function | Purpose |
|----------|---------|
| `admin-manage-users` | Admin user management |
| `check-subscription` | Verify Stripe subscription status |
| `create-checkout` | Create Stripe checkout session |
| `customer-portal` | Stripe customer portal access |
| `send-coparent-invite` | Send invitation emails via Resend |

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
- [ ] **Calendar Integration**: Implement visual calendar with custody pattern display
- [ ] **Schedule Pattern Engine**: Complete pattern-based schedule generation (week-on/week-off, 2-2-3, etc.)
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
- [ ] **Expense Tracking**: Shared expense management
- [ ] **Mileage Tracking**: Exchange location distance tracking
- [ ] **Integration with Family Law Portals**: Direct court filing integration
- [ ] **AI-Powered Conflict Detection**: Analyze messages for tone issues

### Technical Debt
- [ ] **Unit Tests**: Add comprehensive test coverage
- [ ] **E2E Tests**: Playwright or Cypress testing
- [ ] **Error Boundaries**: Add React error boundaries
- [ ] **Accessibility Audit**: Full WCAG compliance review
- [ ] **Performance Optimization**: Lazy loading for routes, image optimization
- [ ] **Analytics Integration**: Add usage analytics (Posthog, Mixpanel)

### Bug Fixes Needed
- [ ] Verify step-parent approval flow works end-to-end
- [ ] Test subscription webhook handling with Stripe
- [ ] Validate realtime subscriptions cleanup on unmount
- [ ] Check document upload size limits

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
