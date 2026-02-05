import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpCallout
} from "@/components/help/HelpCard";
import { 
  User, 
  CreditCard,
  Bell,
  Download,
  Settings,
  Crown,
  Zap,
  CheckCircle
} from "lucide-react";

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
      headerIcon={<Settings className="w-7 h-7 text-primary" />}
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
      {/* Your account settings */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Your account settings
        </h2>
        <p className="text-muted-foreground mb-4">
          Access your account settings from the dashboard to manage:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <User className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-sm">Profile information</span>
              <p className="text-xs text-muted-foreground">Name, email, timezone</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <Bell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-sm">Notification preferences</span>
              <p className="text-xs text-muted-foreground">Email, push, reminders</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <Settings className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-sm">Privacy settings</span>
              <p className="text-xs text-muted-foreground">Access control, security</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <CreditCard className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-sm">Subscription & billing</span>
              <p className="text-xs text-muted-foreground">Plan, payments, invoices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription plans */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          Subscription plans
        </h2>
        <p className="text-muted-foreground mb-4">
          CoParrent offers different subscription tiers to match your needs:
        </p>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={Zap} title="Free Plan" variant="default">
            <p className="mb-2">Basic calendar and messaging with limited history.</p>
            <ul className="space-y-1 text-xs">
              <li>• Limited message history</li>
              <li>• Basic calendar access</li>
              <li>• Core features</li>
            </ul>
          </HelpCard>
          <HelpCard icon={Crown} title="Power Plan" variant="primary">
            <p className="mb-2">Full access to all features including:</p>
            <ul className="space-y-1 text-xs">
              <li>• Unlimited message history</li>
              <li>• Document storage</li>
              <li>• Court exports</li>
              <li>• AI-powered tools</li>
            </ul>
          </HelpCard>
        </HelpFeatureGrid>
        <p className="text-sm text-muted-foreground mt-4">
          View current pricing and upgrade options on the{" "}
          <a href="/pricing" className="text-primary hover:underline">Pricing page</a>.
        </p>
      </section>

      {/* Managing your subscription */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Managing your subscription
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground mb-4">
            From Settings, you can:
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm">View your current plan and usage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm">Upgrade or change your subscription</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm">Update payment methods</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm">View billing history and invoices</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm">Cancel your subscription</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notification settings */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notification settings
        </h2>
        <p className="text-muted-foreground mb-4">
          Control how and when CoParrent notifies you:
        </p>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={Bell} title="Email notifications" variant="default">
            Get notified about new messages, schedule change requests, and important updates via email.
          </HelpCard>
          <HelpCard icon={Bell} title="Push notifications" variant="default">
            If the app is installed, receive instant alerts for time-sensitive items.
          </HelpCard>
          <HelpCard icon={Bell} title="Exchange reminders" variant="default">
            Get reminded about upcoming custody exchanges so you're always prepared.
          </HelpCard>
          <HelpCard icon={Bell} title="Schedule summaries" variant="default">
            Receive daily or weekly summaries of your upcoming schedule and events.
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* Data export */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Data export
        </h2>
        <HelpCard icon={Download} title="Export your data anytime" variant="tip">
          You can request a full export of all your CoParrent data at any time from Settings. 
          This includes your messages, documents, expenses, and all other records 
          stored in CoParrent. Exports are provided in standard formats for portability.
        </HelpCard>
      </section>

      {/* Billing disclaimer */}
      <HelpDisclaimer type="info">
        Subscription charges are processed through Stripe, our payment processor. 
        For billing questions or disputes, contact support or manage your subscription 
        directly from your account settings.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpAccount;
