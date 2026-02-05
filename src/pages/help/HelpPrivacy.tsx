import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpCallout
} from "@/components/help/HelpCard";
import { 
  Shield, 
  Lock,
  Eye,
  Users,
  UserCheck,
  Settings,
  Download,
  Key,
  AlertTriangle,
  Scale
} from "lucide-react";

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
      headerIcon={<Shield className="w-7 h-7 text-primary" />}
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
      {/* How we protect your data */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          How we protect your data
        </h2>
        <p className="text-muted-foreground mb-4">
          CoParrent is designed for sensitive family information. We implement 
          multiple layers of protection:
        </p>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={Lock} title="Encryption" variant="primary">
            All data is encrypted in transit (TLS 1.3) and at rest (AES-256) 
            using industry-standard protocols.
          </HelpCard>
          <HelpCard icon={Key} title="Access controls" variant="default">
            Only users with appropriate permissions can access shared information. 
            Server-side enforcement ensures security.
          </HelpCard>
          <HelpCard icon={Eye} title="Audit logging" variant="default">
            Sensitive actions are logged for accountability. You can review 
            who accessed what and when.
          </HelpCard>
          <HelpCard icon={Shield} title="Secure authentication" variant="default">
            Strong password requirements and optional two-factor authentication 
            protect your account.
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* Who can see your data */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Who can see your data
        </h2>
        <div className="space-y-3">
          <HelpCard icon={UserCheck} title="You" variant="primary">
            Full access to all your own data and shared resources. You control 
            what you share and with whom.
          </HelpCard>
          <HelpCard icon={Users} title="Your co-parent" variant="default">
            Access to shared calendars, messages, documents, and expenses. 
            This is the core of the coordination platform.
          </HelpCard>
          <HelpCard icon={UserCheck} title="Step-parents" variant="default">
            Limited access as configured by primary parents. You control 
            exactly what they can see and do.
          </HelpCard>
          <HelpCard icon={Scale} title="Third parties" variant="default">
            View-only access to specific records if explicitly granted 
            (e.g., for attorneys or mediators). Revocable at any time.
          </HelpCard>
        </div>
        
        <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">CoParrent staff</strong> — Access only for 
            technical support with your explicit permission, and never to message content.
          </p>
        </div>
      </section>

      {/* Your privacy controls */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Your privacy controls
        </h2>
        <p className="text-muted-foreground mb-4">
          In Settings, you can manage:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Key className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Two-factor authentication</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Shield className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Trusted devices</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Eye className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Active sessions</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Users className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Third-party access grants</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Download className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Data export requests</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Account deletion</span>
          </div>
        </div>
      </section>

      {/* For legal proceedings */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          For legal proceedings
        </h2>
        <HelpCard icon={Scale} title="Your data may be used in court" variant="warning">
          CoParrent data may be used in legal proceedings. If you receive a 
          subpoena or court order requesting your data, contact legal counsel. 
          You can export your own data at any time using the export feature in Settings.
        </HelpCard>
      </section>

      {/* Reporting concerns */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Reporting concerns
        </h2>
        <HelpCallout variant="warning">
          If you believe there has been unauthorized access to your account or 
          data, contact support immediately at <strong>security@coparrent.com</strong>. 
          We will investigate and help you secure your account.
        </HelpCallout>
      </section>

      {/* Privacy disclaimer */}
      <HelpDisclaimer type="info">
        For complete details on how we collect, use, and protect your data, 
        please review our full Privacy Policy accessible from the link above.
      </HelpDisclaimer>

      {/* Safety disclaimer */}
      <HelpDisclaimer type="safety">
        If you are in a domestic violence situation and concerned about your 
        safety, please contact the National Domestic Violence Hotline at 
        1-800-799-7233 or use a private/incognito browser session.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpPrivacy;
