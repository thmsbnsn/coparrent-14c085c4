import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

/**
 * Invitations Help - Specific Article
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Explains how to invite co-parents and step-parents
 * - Provides clear step-by-step guidance
 */

const HelpInvitations = () => {
  return (
    <HelpArticleLayout
      category="Getting Started"
      title="Inviting a co-parent or step-parent"
      description="How to add family members to your CoParrent account."
      primaryAction={{
        label: "Open Settings",
        href: "/dashboard/settings",
      }}
      relatedLinks={[
        { title: "Account setup and basics", href: "/help/getting-started" },
        { title: "Roles and permissions", href: "/help/privacy" },
        { title: "Your account settings", href: "/help/account" },
      ]}
    >
      <section>
        <h2>Inviting your co-parent</h2>
        <p>
          Your co-parent is the other parent of your child(ren). They have full 
          access to shared calendars, messages, documents, and expenses.
        </p>
        <ol>
          <li>Go to Settings and find the "Co-Parent" section.</li>
          <li>Enter your co-parent's email address.</li>
          <li>Click "Send Invitation."</li>
          <li>Your co-parent receives an email with a link to create their account.</li>
          <li>Once they accept, you're connected and can start coordinating.</li>
        </ol>
      </section>

      <section>
        <h2>Inviting a step-parent</h2>
        <p>
          Step-parents can be added with limited access to help with day-to-day 
          coordination. Their permissions are controlled by the primary parent 
          who invited them.
        </p>
        <ol>
          <li>Go to Settings and find the "Step-Parent" section.</li>
          <li>Enter the step-parent's email address.</li>
          <li>Configure their access level (what they can see and do).</li>
          <li>Send the invitation.</li>
        </ol>
      </section>

      <section>
        <h2>Step-parent permissions</h2>
        <p>
          When adding a step-parent, you can control their access to:
        </p>
        <ul>
          <li>Calendar viewing and event creation</li>
          <li>Message threads (view-only or participation)</li>
          <li>Document access</li>
          <li>Expense viewing</li>
        </ul>
        <p>
          You can adjust these permissions at any time from Settings.
        </p>
      </section>

      <section>
        <h2>Adding third-party access</h2>
        <p>
          In some cases, you may need to grant access to professionals like 
          attorneys, mediators, or therapists. Third-party users have view-only 
          access to specific records you choose to share.
        </p>
        <ol>
          <li>Go to Settings and find "Third-Party Access."</li>
          <li>Enter the professional's email and their role.</li>
          <li>Specify what records they can access.</li>
          <li>They receive an invitation to view the shared information.</li>
        </ol>
      </section>

      <section>
        <h2>Revoking access</h2>
        <p>
          You can remove a step-parent or third-party user at any time. Go to 
          Settings, find their entry, and click "Remove Access." Their access 
          ends immediately.
        </p>
        <p>
          Note: You cannot remove your co-parent's access—they are a permanent 
          part of the shared account.
        </p>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpInvitations;
