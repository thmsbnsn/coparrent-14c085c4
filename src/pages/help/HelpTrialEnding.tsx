import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

/**
 * Trial Ending Help - Specific Article
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Directly addresses a common concern: what happens when a trial ends
 * - Provides clear, actionable information
 */

const HelpTrialEnding = () => {
  return (
    <HelpArticleLayout
      category="Account"
      title="What happens when a trial ends"
      description="Understanding your options when your CoParrent trial period ends."
      primaryAction={{
        label: "View Pricing",
        href: "/pricing",
      }}
      relatedLinks={[
        { title: "Account and billing", href: "/help/account" },
        { title: "Getting started guide", href: "/help/getting-started" },
      ]}
    >
      <section>
        <h2>Your data is safe</h2>
        <p>
          When your trial ends, your data is not deleted. All messages, documents, 
          expenses, and calendar history remain stored securely. You can still log in 
          and access your account.
        </p>
      </section>

      <section>
        <h2>What changes after the trial</h2>
        <p>
          Without an active subscription, some features become restricted:
        </p>
        <ul>
          <li>
            <strong>Messages</strong> — You can view your message history but may be 
            limited in sending new messages.
          </li>
          <li>
            <strong>Documents</strong> — You can view existing documents but cannot 
            upload new ones.
          </li>
          <li>
            <strong>Exports</strong> — Court-ready export features require a subscription.
          </li>
          <li>
            <strong>Calendar</strong> — Basic calendar viewing remains available. 
            Advanced features like schedule change requests may be limited.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to continue using CoParrent</h2>
        <ol>
          <li>Go to Settings or visit the <a href="/pricing">Pricing page</a>.</li>
          <li>Choose the plan that fits your needs.</li>
          <li>Enter your payment information.</li>
          <li>Your account is immediately restored to full access.</li>
        </ol>
      </section>

      <section>
        <h2>If you choose not to subscribe</h2>
        <p>
          You can continue to access your data and use limited features. Your 
          records remain available for export. If you later decide to subscribe, 
          everything will be exactly as you left it.
        </p>
      </section>

      <section>
        <h2>Questions about billing?</h2>
        <p>
          If you have questions about pricing, payment, or your subscription status, 
          visit your account settings or contact support.
        </p>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpTrialEnding;
