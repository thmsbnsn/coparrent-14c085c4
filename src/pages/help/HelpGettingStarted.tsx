import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

/**
 * Getting Started - Help Article
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Provides real, actionable guidance
 * - Explains what this area is for and what problems it solves
 * - Directs users to relevant features in the app
 */

const HelpGettingStarted = () => {
  return (
    <HelpArticleLayout
      category="Getting Started"
      title="Account setup and basics"
      description="Everything you need to know to set up your CoParrent account and start coordinating."
      primaryAction={{
        label: "Go to Dashboard",
        href: "/dashboard",
      }}
      relatedLinks={[
        { title: "Inviting a co-parent or step-parent", href: "/help/getting-started/invitations" },
        { title: "Understanding custody schedule patterns", href: "/help/scheduling/patterns" },
        { title: "Your account and billing", href: "/help/account" },
      ]}
    >
      <section>
        <h2>What CoParrent helps you do</h2>
        <p>
          CoParrent is a coordination platform for separated or divorced parents. 
          It provides shared calendars, documented messaging, expense tracking, 
          and document storage—all designed to reduce conflict and create clear records.
        </p>
      </section>

      <section>
        <h2>Your first steps</h2>
        <ol>
          <li>
            <strong>Complete your profile</strong> — Add your name, contact preferences, 
            and timezone in Settings.
          </li>
          <li>
            <strong>Add your children</strong> — Go to the Children section to create 
            profiles for each child, including their school, medical information, and 
            emergency contacts.
          </li>
          <li>
            <strong>Set up your custody schedule</strong> — Use the Calendar to establish 
            your custody pattern (e.g., week-on/week-off, 2-2-3).
          </li>
          <li>
            <strong>Invite your co-parent</strong> — Send an invitation so they can 
            access shared information and communicate through the platform.
          </li>
        </ol>
      </section>

      <section>
        <h2>Key features to explore</h2>
        <ul>
          <li>
            <strong>Calendar</strong> — View and manage custody schedules, request changes, 
            and track who has the children on any given day.
          </li>
          <li>
            <strong>Messages</strong> — Communicate with your co-parent in a documented, 
            timestamped format suitable for legal records.
          </li>
          <li>
            <strong>Documents</strong> — Store and share important files like custody 
            agreements, medical records, and school forms.
          </li>
          <li>
            <strong>Expenses</strong> — Track shared expenses, request reimbursements, 
            and maintain a clear financial record.
          </li>
        </ul>
      </section>

      <section>
        <h2>Roles and permissions</h2>
        <p>
          CoParrent supports different roles with appropriate access levels:
        </p>
        <ul>
          <li><strong>Primary Parent</strong> — Full access to all features and settings.</li>
          <li><strong>Co-Parent</strong> — Access to shared calendars, messages, and documents.</li>
          <li><strong>Step-Parent</strong> — Limited access as configured by a primary parent.</li>
          <li><strong>Third Party</strong> — View-only access for legal professionals or therapists.</li>
        </ul>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpGettingStarted;
