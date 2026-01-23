import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

/**
 * Account Help - Main Category Page
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Explains account management, billing, and settings
 * - Provides clear guidance on subscription and trial status
 */

const HelpAccount = () => {
  return (
    <HelpArticleLayout
      category="Account"
      title="Billing and settings"
      description="Managing your CoParrent account, subscription, and personal preferences."
      primaryAction={{
        label: "Open Settings",
        href: "/dashboard/settings",
      }}
      relatedLinks={[
        { title: "What happens when a trial ends", href: "/help/account/trial-ending" },
        { title: "Your privacy and security", href: "/help/privacy" },
        { title: "Getting started guide", href: "/help/getting-started" },
      ]}
    >
      <section>
        <h2>Your account settings</h2>
        <p>
          Access your account settings from the dashboard to manage:
        </p>
        <ul>
          <li>Profile information (name, email, timezone)</li>
          <li>Notification preferences</li>
          <li>Privacy settings</li>
          <li>Subscription and billing</li>
          <li>Connected accounts and devices</li>
        </ul>
      </section>

      <section>
        <h2>Subscription plans</h2>
        <p>
          CoParrent offers different subscription tiers to match your needs:
        </p>
        <ul>
          <li>
            <strong>Free</strong> — Basic calendar and messaging with limited history.
          </li>
          <li>
            <strong>Premium</strong> — Full access to all features including document 
            storage, expense tracking, court exports, and unlimited message history.
          </li>
        </ul>
        <p>
          View current pricing and upgrade options on the <a href="/pricing">Pricing page</a>.
        </p>
      </section>

      <section>
        <h2>Managing your subscription</h2>
        <p>
          From Settings, you can:
        </p>
        <ul>
          <li>View your current plan and usage</li>
          <li>Upgrade or change your subscription</li>
          <li>Update payment methods</li>
          <li>View billing history and invoices</li>
          <li>Cancel your subscription</li>
        </ul>
      </section>

      <section>
        <h2>Notification settings</h2>
        <p>
          Control how and when CoParrent notifies you:
        </p>
        <ul>
          <li>Email notifications for messages and requests</li>
          <li>Push notifications (if the app is installed)</li>
          <li>Reminders for upcoming exchanges</li>
          <li>Daily or weekly schedule summaries</li>
        </ul>
      </section>

      <section>
        <h2>Data export</h2>
        <p>
          You can request a full export of your data at any time from Settings. 
          This includes your messages, documents, expenses, and all other records 
          stored in CoParrent.
        </p>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpAccount;
