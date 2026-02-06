# CoParrent Visual & Interaction Constitution

> **Version**: 2.1  
> **Status**: ENFORCED  
> **Last Updated**: 2026-02-06  
> **Scope**: All UI across Dashboard, Calendar, Messaging, Expenses, Documents, Kids Hub, Help Center, and future features

---

## Foundational Premise

CoParrent is a **trust-critical platform** operating in emotionally charged, legally sensitive environments. Design inconsistency is not cosmetic debt — it is **credibility debt**.

This constitution codifies non-negotiable design rules so the platform cannot visually regress as features expand.

**Design decisions must be systemic, not page-specific.**

---

## The Seven Design Laws

### LAW 1 — Pages Have Roles

Every page must explicitly conform to **one primary role**:

| Role | Behavior | Examples |
|------|----------|----------|
| **Overview** | Summary-first, minimal actions | Dashboard, Kids Hub |
| **Action** | Focused controls, limited scope | Calendar Wizard, Add Expense |
| **Evidence** | Neutral, printable, court-ready | Court Records, Expense Reports |
| **Reference** | Read-only, low cognitive load | Law Library, Help Center |

**Violations**:
- A page that visually behaves like multiple roles at once
- A page whose role cannot be immediately identified

**Annotation Requirement**: Every page component MUST include a comment block declaring its role:
```tsx
/**
 * @page-role Overview
 * @summary-pattern Dashboard home showing parenting time, messages, children
 * @court-view N/A
 */
```

---

### LAW 2 — Summary Before Detail

Any page containing complex or consequential data must begin with **summary components**.

Summary components must answer:
1. **What is happening?**
2. **Who owns what?**
3. **What is unresolved?**

Detail may only follow once these are clear.

**Mandatory Pages**:
- Dashboard
- Expenses
- Calendar
- Documents
- Messaging threads with obligations

---

### LAW 3 — Ownership Must Be Visible

Wherever data involves multiple parties:

| Requirement | Implementation |
|-------------|----------------|
| Ownership is explicit | Use `.parent-a` / `.parent-b` semantic classes |
| Language is neutral | Never "your ex" — always "Co-Parent" |
| Visual distinction is consistent | Same colors everywhere |

**Semantic Tokens** (defined in `index.css`):
```css
--parent-a: 222 60% 50%;      /* Blue - Current user */
--parent-a-light: 222 60% 96%;
--parent-b: 152 50% 42%;      /* Green - Co-Parent */
--parent-b-light: 152 50% 94%;
```

**Violation**: "You" vs "Co-Parent" relies on context alone.

---

### LAW 4 — Same Concept, Same Shape

If two elements represent the same concept, they must:
- Look the same
- Behave the same
- Be placed consistently

**Applies to**:
- Summary cards
- Dual-view toggles (Calendar View / Court View)
- Status indicators
- Badges
- Action buttons
- Help article layouts

**Violation**: Near-duplicates. If `ExpenseCard` and `DocumentCard` have similar purpose, they must share a common ancestor component or identical visual patterns.

---

### LAW 5 — Color Is Semantic, Not Decorative

Colors may only be used to **convey meaning**, never emotion.

| Use Case | Token | Purpose |
|----------|-------|---------|
| Identity | `parent-a`, `parent-b` | Ownership distinction |
| System | `primary`, `muted`, `border` | UI structure |
| Status | `success`, `warning`, `destructive` | State feedback (use sparingly) |

**Prohibited**:
- Alarmist colors without cause
- Emotional emphasis
- Decorative gradients that imply meaning

**Invariant**: If color communicates something in one place, it must communicate the same thing everywhere.

---

### LAW 6 — Court View Is a First-Class Citizen

Any data that may be exported, printed, or reviewed by third parties must support a **Court View** or equivalent neutral mode.

**Court View Principles**:
- Reduced visual noise
- Neutral language
- Clear attribution
- Print-safe layout

**Mandatory Where**:
- Expenses → Court Report generator
- Documents → Court Export dialog
- Calendar → Printable schedule view
- Messages → Export history

**Export Branding Contract** (see `src/lib/creationsExport.ts`):
- Centered "CoParrent Creations" header for Kids Hub exports
- No domain URLs, no generation timestamps
- Professional, minimal layout

---

### LAW 7 — Mobile Is Not a Degraded Experience

Responsive design must preserve:
- Hierarchy
- Ownership clarity
- Primary actions
- Summary visibility

**Rule**: Mobile views may simplify layout, but may **never remove meaning**.

If a concept exists on desktop, it must survive on mobile.

---

## Page Role Registry

| Page | Role | Summary Pattern | Court View |
|------|------|-----------------|------------|
| Dashboard | Overview | Parenting time + messages + children | N/A |
| Calendar | Overview/Action | Custody schedule + events | Print export |
| Expenses | Overview | Totals + pending requests + recent | Court Report |
| Documents | Reference | Category counts + document grid | Court Export |
| Messages | Action | Thread list + active conversation | Export history |
| Kids Hub | Overview | Activity cards + creation library | N/A |
| Nurse Nancy | Action | Chat interface | N/A |
| Chore Charts | Action | Household toggle + chart view | Print/PDF export |
| Sports Hub | Overview | Activities + events | N/A |
| Law Library | Reference | Article list (read-only) | N/A |
| Settings | Action | Focused configuration sections | N/A |
| Creations Library | Overview | Folders + creation grid | PDF/Print export |
| Help Center | Reference | Topic card grid | N/A |
| Help Articles | Reference | Card-based content with callouts | N/A |

---

## Component Standards

### Summary Cards
All summary cards must use:
```tsx
<div className="rounded-2xl border border-border bg-card p-6">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div>
      <h2 className="font-display font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
  {children}
</div>
```

### Help Article Cards
Help articles use a consistent card system with variants:
```tsx
<HelpCard variant="primary" icon={<Shield />} title="Security">
  Content here
</HelpCard>
```

Variants: `default`, `primary`, `warning`, `tip`, `numbered`

### Ownership Distinction
```tsx
// Current user's content
<div className="bg-parent-a-light border border-parent-a text-parent-a">

// Co-parent's content
<div className="bg-parent-b-light border border-parent-b text-parent-b">
```

### Status Badges
Use semantic colors consistently:
```tsx
<Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
<Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>
<Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>
```

### Loading States
Use consistent skeleton patterns:
```tsx
<Skeleton className="h-8 w-full" />  // Inline
<Card className="border-dashed">
  <CardContent className="p-6">
    <Skeleton className="h-24 w-full" />
  </CardContent>
</Card>  // Full card
```

---

## Disclaimer & Safety Patterns

### Safety Disclaimers
Used on pages with health/medical/legal information:
```tsx
<HelpDisclaimer
  title="Important Safety Notice"
  variant="warning"
  icon={<AlertTriangle />}
>
  This information is for general guidance only and is not a substitute
  for professional medical or legal advice.
</HelpDisclaimer>
```

### Legal Disclaimers
Used on pages with court-facing or legal content:
```tsx
<HelpDisclaimer
  title="Legal Notice"
  variant="default"
  icon={<Scale />}
>
  CoParrent is not a law firm and does not provide legal advice.
  Consult a qualified attorney for legal guidance.
</HelpDisclaimer>
```

---

## Gate Component Styling

### PremiumFeatureGate (Locked State)
```tsx
<Card className="border-dashed border-2 border-primary/20 bg-primary/5">
  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
    {/* Crown/Lock icon in circle */}
    {/* Title + description */}
    {/* Upgrade button */}
  </CardContent>
</Card>
```

### RoleGate (Restricted State)
```tsx
<Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/5">
  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
    {/* Users icon in circle */}
    {/* Title + description */}
    {/* Return to dashboard button */}
  </CardContent>
</Card>
```

---

## Enforcement Checklist

Before merging any UI change:

- [ ] Page role is declared in component comment
- [ ] Summary appears before detail where required
- [ ] Ownership uses `parent-a`/`parent-b` tokens (not inline colors)
- [ ] Same concepts use identical shapes/patterns
- [ ] Colors are semantic (no decorative gradients)
- [ ] Court View exists where legally plausible
- [ ] Mobile preserves all meaning from desktop
- [ ] Gate states match component standards
- [ ] Loading states use consistent skeleton patterns
- [ ] Safety/legal disclaimers present where appropriate

---

## Success Criteria

A future contributor should be able to:
1. Build a new feature
2. Follow this system
3. Produce UI that feels *inevitably* CoParrent

**If personal taste is required to decide layout, this constitution has failed.**

---

## Final Test

Before any major UI change:

> "If this platform doubled in size tomorrow, would this system prevent visual chaos?"

If the answer is not an immediate **yes**, revise.

---

*Design discipline is how this platform earns long-term trust.*