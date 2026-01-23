import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

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
      <section>
        <h2>What expense tracking does</h2>
        <p>
          The Expenses feature helps you maintain a clear record of shared child-related 
          costs. This is particularly useful when custody agreements require splitting 
          certain expenses (like medical bills or extracurricular activities).
        </p>
      </section>

      <section>
        <h2>Adding an expense</h2>
        <ol>
          <li>Go to the Expenses section from your dashboard.</li>
          <li>Click "Add Expense."</li>
          <li>Enter the amount, date, and description.</li>
          <li>Select a category (medical, school, activities, etc.).</li>
          <li>Optionally associate with a specific child.</li>
          <li>Upload a receipt photo if available.</li>
          <li>Set the split percentage if applicable.</li>
        </ol>
      </section>

      <section>
        <h2>Expense categories</h2>
        <ul>
          <li><strong>Medical</strong> — Doctor visits, prescriptions, therapy</li>
          <li><strong>Education</strong> — School supplies, tuition, tutoring</li>
          <li><strong>Activities</strong> — Sports, music lessons, camps</li>
          <li><strong>Childcare</strong> — Daycare, babysitting</li>
          <li><strong>Clothing</strong> — Necessary clothing purchases</li>
          <li><strong>Other</strong> — Miscellaneous child-related costs</li>
        </ul>
      </section>

      <section>
        <h2>Requesting reimbursement</h2>
        <p>
          When you pay for a shared expense, you can request reimbursement from 
          your co-parent. The request includes:
        </p>
        <ul>
          <li>The expense details and receipt</li>
          <li>The amount owed based on your split agreement</li>
          <li>A clear record that your co-parent can review and approve</li>
        </ul>
      </section>

      <section>
        <h2>Viewing expense history</h2>
        <p>
          The Expenses section shows a complete history of all logged expenses, 
          filterable by date, category, or child. Summary charts help you understand 
          spending patterns and outstanding balances.
        </p>
      </section>

      <section>
        <h2>Exporting expense records</h2>
        <p>
          You can export your expense history as a PDF report, which includes 
          all logged expenses, receipts, and running totals. This is useful for 
          tax purposes or legal documentation.
        </p>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpExpenses;
