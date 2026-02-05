import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpStep,
  HelpCallout
} from "@/components/help/HelpCard";
import { 
  DollarSign, 
  Receipt,
  PieChart,
  Download,
  Heart,
  GraduationCap,
  Shirt,
  Baby,
  Users,
  Calculator,
  FileText,
  CheckCircle
} from "lucide-react";

/**
 * Expenses Help - Main Category Page
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Explains expense tracking and reimbursement
 * - Provides clear operational guidance
 */

const HelpExpenses = () => {
  return (
    <HelpArticleLayout
      category="Expenses"
      title="Tracking and reimbursements"
      description="How to log shared expenses, request reimbursements, and maintain financial records."
      headerIcon={<DollarSign className="w-7 h-7 text-primary" />}
      primaryAction={{
        label: "Open Expenses",
        href: "/dashboard/expenses",
      }}
      relatedLinks={[
        { title: "Court records and exports", href: "/court-records" },
        { title: "Your account and billing", href: "/help/account" },
        { title: "Exporting documents", href: "/help/documents/exports" },
      ]}
    >
      {/* What expense tracking does */}
      <HelpCallout variant="primary">
        The Expenses feature helps you maintain a clear record of shared child-related 
        costs. This is particularly useful when custody agreements require splitting 
        certain expenses (like medical bills or extracurricular activities).
      </HelpCallout>

      {/* Adding an expense */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          Adding an expense
        </h2>
        <div className="space-y-4">
          <HelpStep number={1} title="Navigate to Expenses">
            Go to the Expenses section from your dashboard.
          </HelpStep>
          <HelpStep number={2} title="Click Add Expense">
            Start a new expense entry with the "Add Expense" button.
          </HelpStep>
          <HelpStep number={3} title="Enter the details">
            Add the amount, date, and a clear description of the expense.
          </HelpStep>
          <HelpStep number={4} title="Categorize it">
            Select a category (medical, school, activities, etc.) for easy tracking.
          </HelpStep>
          <HelpStep number={5} title="Add documentation">
            Upload a receipt photo if available and set the split percentage.
          </HelpStep>
        </div>
      </section>

      {/* Expense categories */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Expense categories
        </h2>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={Heart} title="Medical" variant="default">
            Doctor visits, prescriptions, therapy, dental, vision, and other health expenses
          </HelpCard>
          <HelpCard icon={GraduationCap} title="Education" variant="default">
            School supplies, tuition, tutoring, educational materials and programs
          </HelpCard>
          <HelpCard icon={Users} title="Activities" variant="default">
            Sports registration, music lessons, camps, clubs, and extracurriculars
          </HelpCard>
          <HelpCard icon={Baby} title="Childcare" variant="default">
            Daycare, babysitting, after-school care, and summer programs
          </HelpCard>
          <HelpCard icon={Shirt} title="Clothing" variant="default">
            Necessary clothing purchases, uniforms, seasonal gear
          </HelpCard>
          <HelpCard icon={DollarSign} title="Other" variant="default">
            Miscellaneous child-related costs that don't fit other categories
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* Requesting reimbursement */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Requesting reimbursement
        </h2>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-4">
            When you pay for a shared expense, you can request reimbursement from 
            your co-parent. Each request includes:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Full expense details with receipt</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Amount owed based on your split</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Clear record for your co-parent</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Documented approval/decline</span>
            </div>
          </div>
        </div>
      </section>

      {/* Viewing expense history */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Viewing expense history
        </h2>
        <HelpCard icon={PieChart} title="Complete expense overview" variant="tip">
          The Expenses section shows a complete history of all logged expenses, 
          filterable by date, category, or child. Summary charts help you understand 
          spending patterns, outstanding balances, and who owes whom.
        </HelpCard>
      </section>

      {/* Exporting records */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Exporting expense records
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">PDF expense reports</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Export your expense history as a detailed PDF report for tax purposes 
                or legal documentation:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• All logged expenses with dates and amounts</li>
                <li>• Category breakdowns and summaries</li>
                <li>• Receipt images included</li>
                <li>• Running totals and outstanding balances</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Financial disclaimer */}
      <HelpDisclaimer type="legal">
        CoParrent expense tracking is for documentation and coordination purposes. 
        It does not constitute financial or tax advice. Consult with a qualified 
        accountant or tax professional for financial guidance.
      </HelpDisclaimer>

      <HelpDisclaimer type="important">
        Keep original receipts for major expenses. While CoParrent stores receipt 
        images, original documentation may be required for tax filings or legal proceedings.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpExpenses;
