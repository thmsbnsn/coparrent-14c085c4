import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpStep,
  HelpCallout
} from "@/components/help/HelpCard";
import { 
  CreditCard, 
  CheckCircle,
  Clock,
  Shield,
  Eye,
  MessageSquare,
  Calendar,
  FileText,
  Download
} from "lucide-react";

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
      headerIcon={<Clock className="w-7 h-7 text-primary" />}
      primaryAction={{
        label: "View Pricing",
        href: "/pricing",
      }}
      relatedLinks={[
        { title: "Account and billing", href: "/help/account" },
        { title: "Getting started guide", href: "/help/getting-started" },
      ]}
    >
      {/* Your data is safe */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Your data is safe
        </h2>
        <HelpCallout variant="success">
          When your trial ends, your data is <strong>not deleted</strong>. All messages, 
          documents, expenses, and calendar history remain stored securely. You can 
          still log in and access your account.
        </HelpCallout>
      </section>

      {/* What changes after the trial */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          What changes after the trial
        </h2>
        <p className="text-muted-foreground mb-4">
          Without an active subscription, some features become restricted:
        </p>
        <div className="space-y-3">
          <HelpCard icon={MessageSquare} title="Messages" variant="warning">
            You can view your message history but may be limited in sending new messages. 
            Your communication record remains intact.
          </HelpCard>
          <HelpCard icon={FileText} title="Documents" variant="warning">
            You can view existing documents but cannot upload new ones. 
            Downloads remain available.
          </HelpCard>
          <HelpCard icon={Download} title="Exports" variant="warning">
            Court-ready export features require a subscription. Basic viewing 
            is still available.
          </HelpCard>
          <HelpCard icon={Calendar} title="Calendar" variant="default">
            Basic calendar viewing remains available. Advanced features like 
            schedule change requests may be limited.
          </HelpCard>
        </div>
      </section>

      {/* How to continue */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          How to continue using CoParrent
        </h2>
        <div className="space-y-4">
          <HelpStep number={1} title="Go to Settings or Pricing">
            Navigate to Settings → Subscription or visit the Pricing page.
          </HelpStep>
          <HelpStep number={2} title="Choose your plan">
            Select the plan that fits your needs and budget.
          </HelpStep>
          <HelpStep number={3} title="Enter payment information">
            Complete the secure checkout process.
          </HelpStep>
          <HelpStep number={4} title="Instant access">
            Your account is immediately restored to full access—no waiting.
          </HelpStep>
        </div>
      </section>

      {/* If you choose not to subscribe */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          If you choose not to subscribe
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground mb-4">
            You can continue to access your data and use limited features. Your 
            records remain available for export. If you later decide to subscribe, 
            everything will be exactly as you left it.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Data remains stored securely</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Basic access continues</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">No data loss or deletion</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Resubscribe anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Questions about billing */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-4">
          Questions about billing?
        </h2>
        <HelpCard icon={CreditCard} title="We're here to help" variant="tip">
          If you have questions about pricing, payment options, or your subscription 
          status, visit your account settings or contact our support team. We're 
          happy to help you find the right plan.
        </HelpCard>
      </section>

      {/* Billing disclaimer */}
      <HelpDisclaimer type="info">
        CoParrent uses Stripe for secure payment processing. Your payment information 
        is never stored on our servers. You can manage your subscription and payment 
        methods at any time from your account settings.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpTrialEnding;
