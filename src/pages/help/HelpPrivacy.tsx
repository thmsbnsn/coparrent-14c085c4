import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

/**
 * Privacy & Security Help - Main Category Page
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Explains privacy and security measures
 * - Provides clear guidance on data protection
 */

const HelpPrivacy = () => {
  return (
    <HelpArticleLayout
      category="Security"
      title="Privacy and protection"
      description="How CoParrent protects your data and what controls you have over your privacy."
      primaryAction={{
        label: "Open Settings",
        href: "/dashboard/settings",
      }}
      relatedLinks={[
        { title: "Privacy Policy", href: "/privacy" },
        { title: "Terms of Service", href: "/terms" },
        { title: "Your account settings", href: "/help/account" },
      ]}
    >
      <section>
        <h2>How we protect your data</h2>
        <p>
          CoParrent is designed for sensitive family information. We implement 
          multiple layers of protection:
        </p>
        <ul>
          <li>
            <strong>Encryption</strong> — All data is encrypted in transit and at rest.
          </li>
          <li>
            <strong>Access controls</strong> — Only users with appropriate permissions 
            can access shared information.
          </li>
          <li>
            <strong>Audit logging</strong> — Sensitive actions are logged for accountability.
          </li>
          <li>
            <strong>Secure authentication</strong> — Strong password requirements and 
            optional two-factor authentication.
          </li>
        </ul>
      </section>

      <section>
        <h2>Who can see your data</h2>
        <ul>
          <li>
            <strong>You</strong> — Full access to all your own data and shared resources.
          </li>
          <li>
            <strong>Your co-parent</strong> — Access to shared calendars, messages, 
            documents, and expenses.
          </li>
          <li>
            <strong>Step-parents</strong> — Limited access as configured by primary parents.
          </li>
          <li>
            <strong>Third parties</strong> — View-only access to specific records 
            if explicitly granted (e.g., for attorneys).
          </li>
          <li>
            <strong>CoParrent staff</strong> — Access only for technical support with 
            your explicit permission, and never to message content.
          </li>
        </ul>
      </section>

      <section>
        <h2>Your privacy controls</h2>
        <p>
          In Settings, you can manage:
        </p>
        <ul>
          <li>Two-factor authentication</li>
          <li>Trusted devices</li>
          <li>Active sessions (sign out from other devices)</li>
          <li>Third-party access grants</li>
          <li>Data export requests</li>
          <li>Account deletion</li>
        </ul>
      </section>

      <section>
        <h2>For legal proceedings</h2>
        <p>
          CoParrent data may be used in legal proceedings. If you receive a 
          subpoena or court order requesting your data, contact legal counsel. 
          You can export your own data at any time using the export feature.
        </p>
      </section>

      <section>
        <h2>Reporting concerns</h2>
        <p>
          If you believe there has been unauthorized access to your account or 
          data, contact support immediately. We will investigate and help you 
          secure your account.
        </p>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpPrivacy;
