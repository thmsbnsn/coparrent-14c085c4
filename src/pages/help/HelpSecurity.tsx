/**
 * Help Security Page - Truthful Scaffold
 * 
 * DESIGN MANDATE: No "coming soon" language.
 * This page explains CoParrent's security measures clearly.
 * 
 * @see docs/HELP_CENTER_MANDATE.md for scaffolding requirements
 */

import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { Shield, Lock, Key, Eye, Server, UserCheck } from "lucide-react";

const HelpSecurity = () => {
  return (
    <HelpArticleLayout
      category="Security"
      title="Security & Data Protection"
      description="How CoParrent protects your family's sensitive information."
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
      <div className="space-y-8">
        {/* Security Philosophy */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Our Security Philosophy
          </h2>
          <p className="text-muted-foreground mb-4">
            CoParrent handles sensitive family data that may be used in legal proceedings. 
            We take this responsibility seriously with a defense-in-depth approach that 
            protects your information at every level.
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <p className="text-sm font-medium">
              Your data is private by default. Sharing is always explicit, item-level, 
              and revocable. We never sell or share your data with third parties.
            </p>
          </div>
        </section>

        {/* Encryption */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Encryption
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">TLS</span>
              </div>
              <div>
                <h3 className="font-medium">In Transit</h3>
                <p className="text-sm text-muted-foreground">
                  All data transmitted between your device and our servers is encrypted 
                  using TLS 1.3, the latest industry standard.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">AES</span>
              </div>
              <div>
                <h3 className="font-medium">At Rest</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted at rest using AES-256 encryption on 
                  our database infrastructure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Access Control */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Access Control
          </h2>
          <p className="text-muted-foreground mb-4">
            We enforce strict access controls to ensure only authorized users can 
            view or modify your data:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Role-based permissions</span>
                <p className="text-sm text-muted-foreground">
                  Parents, co-parents, and third-party users have different access levels
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Server className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Server-side enforcement</span>
                <p className="text-sm text-muted-foreground">
                  Access rules are enforced at the database level, not just the interface
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Audit logging</span>
                <p className="text-sm text-muted-foreground">
                  All data access is logged and available for your review
                </p>
              </div>
            </li>
          </ul>
        </section>

        {/* Authentication */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Authentication Security</h2>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Password Requirements</h3>
              <p className="text-sm text-muted-foreground">
                We require strong passwords with minimum length and complexity requirements. 
                Passwords are never stored in plain text.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Session Management</h3>
              <p className="text-sm text-muted-foreground">
                Sessions expire after periods of inactivity. You can view and revoke 
                active sessions from your account settings.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security by enabling two-factor authentication 
                in your account settings.
              </p>
            </div>
          </div>
        </section>

        {/* What You Can Do */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Protect Your Account</h2>
          <p className="text-muted-foreground mb-4">
            Steps you can take to enhance your account security:
          </p>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <div>
                <span className="font-medium">Use a unique password</span>
                <p className="text-sm text-muted-foreground">
                  Don't reuse passwords from other sites or services
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <div>
                <span className="font-medium">Enable two-factor authentication</span>
                <p className="text-sm text-muted-foreground">
                  Available in Settings → Security
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <div>
                <span className="font-medium">Review your audit log</span>
                <p className="text-sm text-muted-foreground">
                  Periodically check for unexpected activity
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">4</span>
              </div>
              <div>
                <span className="font-medium">Keep your email secure</span>
                <p className="text-sm text-muted-foreground">
                  Your email is used for password recovery
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Report Security Issues */}
        <section className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            Report Security Issues
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you discover a security vulnerability or suspect unauthorized access 
            to your account, please contact us immediately:
          </p>
          <a 
            href="mailto:security@coparrent.com" 
            className="text-primary font-medium hover:underline"
          >
            security@coparrent.com
          </a>
        </section>
      </div>
    </HelpArticleLayout>
  );
};

export default HelpSecurity;
