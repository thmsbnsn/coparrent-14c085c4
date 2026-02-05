/**
 * Help Security Page - Enhanced Visual Design
 * 
 * DESIGN MANDATE: No "coming soon" language.
 * This page explains CoParrent's security measures clearly.
 */

import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpStep,
  HelpCallout
} from "@/components/help/HelpCard";
import { Shield, Lock, Key, Eye, Server, UserCheck, Smartphone, Clock, AlertTriangle } from "lucide-react";

const HelpSecurity = () => {
  return (
    <HelpArticleLayout
      category="Security"
      title="Security & Data Protection"
      description="How CoParrent protects your family's sensitive information."
      headerIcon={<Shield className="w-7 h-7 text-primary" />}
      primaryAction={{
        label: "Go to Settings",
        href: "/dashboard/settings",
      }}
      relatedLinks={[
        { title: "Privacy Overview", href: "/help/privacy" },
        { title: "Account Settings", href: "/help/account" },
        { title: "Contact Support", href: "/help/contact" },
      ]}
    >
      {/* Security Philosophy */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Our Security Philosophy
        </h2>
        <HelpCallout variant="primary">
          CoParrent handles sensitive family data that may be used in legal proceedings. 
          We take this responsibility seriously with a defense-in-depth approach that 
          protects your information at every level. Your data is private by default.
        </HelpCallout>
      </section>

      {/* Encryption */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Encryption
        </h2>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={Lock} title="In Transit (TLS 1.3)" variant="primary">
            All data transmitted between your device and our servers is encrypted 
            using TLS 1.3, the latest industry standard for secure communications.
          </HelpCard>
          <HelpCard icon={Shield} title="At Rest (AES-256)" variant="default">
            Your data is encrypted at rest using AES-256 encryption on 
            our database infrastructure—the same standard used by banks.
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* Access Control */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Access Control
        </h2>
        <p className="text-muted-foreground mb-4">
          We enforce strict access controls to ensure only authorized users can 
          view or modify your data:
        </p>
        <div className="space-y-3">
          <HelpCard icon={UserCheck} title="Role-based permissions" variant="default">
            Parents, co-parents, step-parents, and third-party users have different 
            access levels based on their role in your family.
          </HelpCard>
          <HelpCard icon={Server} title="Server-side enforcement" variant="default">
            Access rules are enforced at the database level, not just the interface. 
            This prevents bypassing security through technical means.
          </HelpCard>
          <HelpCard icon={Eye} title="Audit logging" variant="default">
            All data access is logged and available for your review. You can see 
            who accessed what and when.
          </HelpCard>
        </div>
      </section>

      {/* Authentication */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Authentication Security
        </h2>
        <HelpFeatureGrid columns={1}>
          <HelpCard icon={Key} title="Password Requirements" variant="default">
            We require strong passwords with minimum length and complexity requirements. 
            Passwords are never stored in plain text—only secure hashes.
          </HelpCard>
          <HelpCard icon={Clock} title="Session Management" variant="default">
            Sessions expire after periods of inactivity. You can view and revoke 
            active sessions from your account settings at any time.
          </HelpCard>
          <HelpCard icon={Smartphone} title="Two-Factor Authentication" variant="tip">
            Add an extra layer of security by enabling two-factor authentication 
            in your account settings. Highly recommended for all users.
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* What You Can Do */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Protect Your Account
        </h2>
        <p className="text-muted-foreground mb-4">
          Steps you can take to enhance your account security:
        </p>
        <div className="space-y-4">
          <HelpStep number={1} title="Use a unique password">
            Don't reuse passwords from other sites or services. Consider using 
            a password manager.
          </HelpStep>
          <HelpStep number={2} title="Enable two-factor authentication">
            Available in Settings → Security. This is the single most effective 
            way to protect your account.
          </HelpStep>
          <HelpStep number={3} title="Review your audit log">
            Periodically check for unexpected activity. If something looks wrong, 
            contact support immediately.
          </HelpStep>
          <HelpStep number={4} title="Keep your email secure">
            Your email is used for password recovery. Make sure your email account 
            is also well-protected.
          </HelpStep>
        </div>
      </section>

      {/* Report Security Issues */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Report Security Issues
        </h2>
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
          <p className="text-muted-foreground mb-4">
            If you discover a security vulnerability or suspect unauthorized access 
            to your account, please contact us immediately:
          </p>
          <a 
            href="mailto:security@coparrent.com" 
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            security@coparrent.com
          </a>
        </div>
      </section>

      {/* Safety disclaimer */}
      <HelpDisclaimer type="safety">
        If you are in an unsafe situation and concerned about someone accessing 
        your account, contact support for assistance with securing your account 
        or removing unauthorized access.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpSecurity;
