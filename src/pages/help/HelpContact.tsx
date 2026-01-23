/**
 * Help Contact Page - Truthful Scaffold
 * 
 * DESIGN MANDATE: No "coming soon" language.
 * This page provides immediate, actionable guidance for contacting support.
 * 
 * @see docs/HELP_CENTER_MANDATE.md for scaffolding requirements
 */

import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { Mail, MessageSquare, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const HelpContact = () => {
  return (
    <HelpArticleLayout
      category="Support"
      title="Contact Us"
      description="Get help from our team when you need it most."
      relatedLinks={[
        { title: "Help Center Home", href: "/help" },
        { title: "Account & Billing", href: "/help/account" },
        { title: "Privacy & Security", href: "/help/privacy" },
      ]}
    >
      <div className="space-y-8">
        {/* Email Support */}
        <section>
          <div className="flex items-start gap-4 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Email Support</h2>
              <p className="text-muted-foreground mb-4">
                For questions, feedback, or issues, email our support team directly. 
                We typically respond within one business day.
              </p>
              <Button asChild>
                <a href="mailto:support@coparrent.com">
                  support@coparrent.com
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Response Times */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Response Times
          </h2>
          <div className="bg-muted/30 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="font-medium">General inquiries</span>
              <span className="text-muted-foreground">1 business day</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="font-medium">Billing questions</span>
              <span className="text-muted-foreground">1 business day</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="font-medium">Account access issues</span>
              <span className="text-muted-foreground">Same day priority</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Security concerns</span>
              <span className="text-muted-foreground">Immediate priority</span>
            </div>
          </div>
        </section>

        {/* What to Include */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            What to Include in Your Message
          </h2>
          <p className="text-muted-foreground mb-4">
            To help us assist you faster, please include:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <div>
                <span className="font-medium">Your account email</span>
                <p className="text-sm text-muted-foreground">
                  The email address you use to sign in
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <div>
                <span className="font-medium">Description of the issue</span>
                <p className="text-sm text-muted-foreground">
                  What you were trying to do and what happened
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <div>
                <span className="font-medium">Screenshots (if applicable)</span>
                <p className="text-sm text-muted-foreground">
                  Visual context helps us understand the problem
                </p>
              </div>
            </li>
          </ul>
        </section>

        {/* Self-Service Options */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Self-Service Options
          </h2>
          <p className="text-muted-foreground mb-4">
            Many common questions can be resolved through our Help Center:
          </p>
          <div className="grid gap-3">
            <a 
              href="/help/getting-started" 
              className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
              <span className="font-medium">Getting Started Guide</span>
              <p className="text-sm text-muted-foreground">
                Set up your account, invite your co-parent, add children
              </p>
            </a>
            <a 
              href="/help/account" 
              className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
              <span className="font-medium">Account & Billing</span>
              <p className="text-sm text-muted-foreground">
                Subscription management, payment issues, plan upgrades
              </p>
            </a>
            <a 
              href="/help/privacy" 
              className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
              <span className="font-medium">Privacy & Security</span>
              <p className="text-sm text-muted-foreground">
                Data protection, account security, export your data
              </p>
            </a>
          </div>
        </section>

        {/* Privacy Note */}
        <section className="bg-muted/50 border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Privacy Note</h3>
          <p className="text-sm text-muted-foreground">
            When you contact support, our team may access your account information 
            to help resolve your issue. We follow strict privacy protocols and 
            never share your personal information. All support interactions are 
            confidential.
          </p>
        </section>
      </div>
    </HelpArticleLayout>
  );
};

export default HelpContact;
