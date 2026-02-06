# CoParrent — Investor-Facing Project Handoff

> **Prepared**: 2026-02-06  
> **Version**: 1.0  
> **Status**: Production-Ready  
> **Live URL**: https://coparrent.lovable.app

---

## Executive Summary

**CoParrent** is a production-ready SaaS web application that helps separated and divorced parents coordinate custody, communicate professionally, and manage their children's lives — all within a single, court-friendly platform.

The product is **live**, **billing-enabled** (Stripe), and **fully functional** with a freemium model. It is built as a Progressive Web App (PWA) installable on iOS, Android, and desktop with push notification support.

---

## Market Opportunity

### Problem

Co-parenting after separation is chaotic. Parents juggle:
- Custody calendars across text threads and spreadsheets
- Hostile or emotionally charged messaging
- Scattered school, medical, and legal documents
- Shared expenses with no accountability
- Court proceedings requiring organized evidence

### Existing Solutions & Gaps

| Competitor | Gap |
|-----------|-----|
| OurFamilyWizard | Expensive ($100+/yr per parent), dated UX |
| TalkingParents | Messaging-only, no scheduling or documents |
| Cozi / Google Calendar | No co-parenting features, no court readiness |
| AppClose | Limited feature set, no AI tools |

### CoParrent Differentiators

1. **AI-Powered Communication** — Real-time tone analysis rewrites hostile messages into court-appropriate language
2. **Court-Ready by Design** — Immutable audit logs, timestamped exports, professional formatting
3. **All-in-One Platform** — Calendar + Messages + Documents + Expenses + Kids Hub in one app
4. **Affordable** — $5/month Power plan vs. competitors at $10-15+/month per parent
5. **Family-Wide Access** — One subscription benefits the entire family (co-parent, grandparents, children)
6. **PWA Architecture** — No app store dependency, instant updates, works on all platforms

---

## Product Overview

### Core Feature Set

| Feature | Description | Plan |
|---------|-------------|------|
| **Custody Calendar** | Visual schedule with parent-coded days, AI suggestions, ICS export | Free |
| **Messaging Hub** | Family channels, DMs, reactions, search, court-view export | Free |
| **Children Profiles** | Medical records, school info, emergency contacts, photo gallery | Free |
| **Document Vault** | Categorized storage with access logging and court exports | Free |
| **Gift Lists** | Per-child wishlists with cross-parent claiming | Free |
| **Law Library** | State-grouped legal resources and articles | Free |
| **Expense Tracking** | Split percentages, receipt uploads, court-ready reports | Power |
| **Youth Sports Hub** | Activities, events, equipment checklists, map navigation | Power |
| **Kids Hub** | AI tools: Nurse Nancy, Activity Generator, Coloring Pages | Power |
| **Chore Charts** | Multi-household chore management with completion tracking | Power |
| **AI Tone Assistant** | Message rephrasing, analysis, and drafting | Power |
| **Court Exports** | Professional PDF exports of all platform data | Power |

### AI Capabilities

CoParrent integrates AI through a managed AI gateway (no per-user API keys required):

| AI Feature | Purpose |
|------------|---------|
| **Message Tone Analysis** | Flags hostile/inflammatory language before sending |
| **Message Rephrasing** | Rewrites messages to be professional and court-appropriate |
| **Nurse Nancy** | Child health guidance chatbot (non-diagnostic, with safety disclaimers) |
| **Activity Generator** | Age-appropriate activity suggestions for children |
| **Coloring Page Creator** | Custom AI-generated coloring pages |
| **Schedule Suggestions** | AI-recommended custody patterns based on family needs |

All AI features include safety boundaries: non-diagnostic, non-authoritative, emergency deferral to 911.

---

## Revenue Model

### Pricing

| Plan | Price | Target |
|------|-------|--------|
| **Free** | $0/month | User acquisition, basic co-parenting needs |
| **Power** | $5/month | Full platform access, AI tools, court readiness |

### Revenue Mechanics

- **Stripe integration** (Live mode) handles all billing
- Subscription state managed via Stripe webhooks (tamper-proof)
- Family-wide access model: one Power subscription benefits all family members
- Free trial support with real-time expiration enforcement
- Customer portal for self-service subscription management

### Growth Levers

1. **Co-parent invitation flow** — Every user invites at least one co-parent (built-in viral loop)
2. **Third-party invites** — Step-parents, grandparents, babysitters expand the user base
3. **Court-readiness upsell** — Free users who need court exports upgrade to Power
4. **AI tool upsell** — Free users who want tone analysis or Nurse Nancy upgrade to Power
5. **Law office partnerships** — Dedicated law office signup flow for professional referrals

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Lovable Cloud (PostgreSQL, Auth, Storage, Edge Functions) |
| **Payments** | Stripe (Live mode) |
| **Email** | Resend |
| **AI** | Lovable AI Gateway (Gemini, GPT models) |
| **Bot Protection** | hCaptcha |
| **Auth** | Email/password + Google OAuth + 2FA (TOTP) |

### Architecture Highlights

- **Progressive Web App (PWA)** — Installable on all platforms, push notifications, offline support
- **Row Level Security (RLS)** — Database-level access control, cannot be bypassed by client manipulation
- **Defense-in-Depth Security** — Three independent enforcement layers (UI, Edge Functions, RLS)
- **Immutable Audit Logs** — Court-defensible, tamper-resistant with role snapshots
- **Per-Family Roles** — Users can have different roles in different families
- **Real-Time Features** — Live message delivery and typing indicators

### Security Posture

| Security Feature | Status |
|-----------------|--------|
| Row Level Security (RLS) on all tables | ✅ Active |
| Two-Factor Authentication (TOTP) | ✅ Supported |
| Recovery Codes (SHA-256 hashed) | ✅ Implemented |
| Input Validation (Zod schemas) | ✅ All edge functions |
| XSS Protection (DOMPurify) | ✅ Active |
| Bot Protection (hCaptcha) | ✅ Auth forms |
| Secure File Names (crypto.randomUUID) | ✅ Active |
| Error Sanitization (no internal IDs) | ✅ Active |
| Webhook Idempotency | ✅ Active |
| Immutable Audit Trail | ✅ Active |

---

## Data & Compliance

### Privacy Model

- **Private by default** — All data owned by individual parent
- **Explicit sharing** — Item-level, revocable at any time
- **No public links** — Content never publicly accessible
- **No surveillance** — No background monitoring or tracking

### Legal Compliance

| Requirement | Status |
|-------------|--------|
| GDPR-compliant cookie consent | ✅ Implemented |
| Privacy Policy | ✅ Published at /privacy |
| Terms of Service | ✅ Published at /terms |
| CCPA California Privacy Rights | ✅ Included |
| User data export (JSON) | ✅ Self-service via Settings |
| Data retention schedules | ✅ Documented in Privacy Policy |

### Court Readiness

CoParrent's data model is designed for legal proceedings:

- **Immutable audit logs** with actor role snapshots
- **Timestamped exports** with neutral formatting
- **Access logging** on sensitive documents
- **No editable history** — messages and records preserve original state
- **Court Records page** explains platform's record-keeping to judges

---

## User Roles & Access

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Parent** | Primary account holder | Full access to all features |
| **Co-Parent** | Invited partner | Full access (inherits subscription) |
| **Third-Party** | Step-parent, grandparent, babysitter | Read-only access to calendar, messages |
| **Child** | Restricted child account | Limited access with parental controls |
| **Admin** | Platform administrator | Law library management, user management |

---

## Platform Metrics & Capacity

### Current Limits

| Metric | Free | Power |
|--------|------|-------|
| Children | 4 | 6 |
| Third-Party Members | 4 | 6 |
| Parent Accounts | 2 | 2 |
| AI Requests/Day | 10 | 200 |

### Infrastructure

- **Hosting**: Lovable Cloud (managed infrastructure)
- **Database**: PostgreSQL with automatic backups
- **CDN**: Edge-distributed static assets
- **Edge Functions**: 18 serverless functions for backend logic
- **Storage**: Protected buckets for documents and generated content

---

## Edge Functions Inventory

| Function | Purpose |
|----------|---------|
| `ai-message-assist` | Message tone analysis & rephrasing |
| `ai-schedule-suggest` | Custody schedule recommendations |
| `nurse-nancy-chat` | Child health guidance chatbot |
| `kid-activity-generator` | Age-appropriate activity ideas |
| `generate-coloring-page` | AI coloring page creation |
| `create-checkout` | Stripe checkout session creation |
| `stripe-webhook` | Payment event processing |
| `check-subscription` | Subscription verification |
| `customer-portal` | Stripe customer portal |
| `send-coparent-invite` | Co-parent invitation emails |
| `send-third-party-invite` | Third-party invitation emails |
| `send-notification` | Email notification delivery |
| `send-push` | Push notification delivery |
| `exchange-reminders` | Custody exchange reminders |
| `sports-event-reminders` | Sports event notifications |
| `export-user-data` | GDPR-compliant data export |
| `admin-manage-users` | Admin user management |
| `health` | System health check |

---

## Help & Support Infrastructure

### Help Center

14 fully authored help articles covering:
- Getting started and account setup
- Scheduling and custody patterns
- Messaging and communication
- Documents and court exports
- Expenses and financial tracking
- Privacy, security, and account management
- Trial and subscription management
- Contact support

All articles include safety disclaimers, legal notices, and emergency resources where appropriate.

### Support Channels

- In-app Help Center at `/help`
- Contact form at `/help/contact`
- Emergency resources with 911 and crisis hotline references

---

## Documentation Suite

| Document | Purpose |
|----------|---------|
| `README.md` | Complete project overview, tech stack, architecture |
| `docs/SECURITY_MODEL.md` | Security architecture, trust boundaries, enforcement layers |
| `docs/GATED_FEATURES.md` | Feature access rules, plan enforcement, role matrix |
| `docs/GATED_FEATURES_AUDIT.md` | Security audit verification with pass/fail results |
| `docs/DESIGN_CONSTITUTION.md` | Visual design rules, component standards, page roles |
| `docs/PWA_TEST_CHECKLIST.md` | Manual QA checklist for PWA functionality |
| `docs/MIGRATION_DRY_RUN.md` | Data migration validation system |
| `docs/INVESTOR_HANDOFF.md` | This document |

---

## Development & Quality

### Testing

| Test Type | Coverage |
|-----------|----------|
| E2E (Playwright) | Auth flows, route access, subscription gating, role enforcement |
| Runtime Assertions | Security invariants, role checks, subscription state |
| Migration Dry-Run | Data integrity validation before production changes |
| Admin Checklist | Pre-launch verification tool |

### Code Quality

- TypeScript strict mode
- Zod schema validation on all inputs
- Centralized error handling with sanitization
- Reusable component library (shadcn/ui + custom)
- Semantic design token system (no hardcoded colors)
- Comprehensive audit logging

---

## Roadmap Opportunities

### Near-Term (3-6 months)

| Opportunity | Impact |
|-------------|--------|
| **Mobile app wrappers** | App store presence via Capacitor/PWA wrappers |
| **Multi-language support** | Expand TAM to non-English markets |
| **Mediator/attorney portal** | Professional referral channel |
| **Advanced analytics dashboard** | Usage insights for parents |

### Medium-Term (6-12 months)

| Opportunity | Impact |
|-------------|--------|
| **Family plan pricing** | Both parents pay, reduced per-parent cost |
| **Court integration API** | Direct filing support in select jurisdictions |
| **AI custody recommendations** | Pattern analysis for optimal schedules |
| **White-label for law firms** | B2B revenue stream |

### Long-Term (12+ months)

| Opportunity | Impact |
|-------------|--------|
| **International expansion** | Localized legal libraries per country |
| **Insurance partnerships** | Co-parenting tools bundled with family coverage |
| **Academic research integration** | Child welfare outcome tracking (opt-in, anonymized) |

---

## Key Metrics to Track

| Metric | Why It Matters |
|--------|---------------|
| **User signups** | Top-of-funnel growth |
| **Co-parent invitation acceptance rate** | Viral coefficient |
| **Free → Power conversion rate** | Revenue efficiency |
| **Daily active users (DAU)** | Engagement and retention |
| **AI feature usage** | Value perception of premium tier |
| **Court export frequency** | Legal utility validation |
| **Churn rate** | Product-market fit indicator |
| **Average revenue per user (ARPU)** | Business model health |

---

## Intellectual Property

### Assets

- **CoParrent brand** — Name, logo, mark (mono and color variants)
- **Design system** — Custom semantic token system, component library
- **AI prompt engineering** — Tuned prompts for tone analysis, health guidance, activity generation
- **Security architecture** — Defense-in-depth model with executable assertions
- **Court-ready export system** — Professional document generation pipeline

### Codebase

- ~200+ React components
- 18 Edge Functions
- 30+ database tables with RLS policies
- 20+ custom React hooks
- Comprehensive documentation suite (7 markdown documents)

---

## Team & Handoff

### Current State

The platform was built using **Lovable**, an AI-powered development platform. The entire codebase is:
- Version-controlled and exportable
- Built on standard, widely-understood technologies (React, TypeScript, PostgreSQL)
- Well-documented with inline comments and dedicated documentation files
- Ready for a development team to take over and extend

### Handoff Readiness

| Aspect | Status |
|--------|--------|
| Codebase documented | ✅ Complete |
| Security model documented | ✅ Complete |
| Feature access rules documented | ✅ Complete |
| Design system documented | ✅ Complete |
| Database schema documented | ✅ Complete |
| Environment variables documented | ✅ Complete |
| Help Center content authored | ✅ Complete |
| Legal pages published | ✅ Complete |
| Billing integration live | ✅ Complete |

---

## Contact & Access

- **Live Application**: https://coparrent.lovable.app
- **Platform**: Lovable Cloud (managed infrastructure)
- **Source Code**: Available via Lovable project export or GitHub integration

---

_End of Investor Handoff Document_