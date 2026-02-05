/**
 * Help Contact Page - Enhanced Visual Design
 * 
 * DESIGN MANDATE: No "coming soon" language.
 * This page provides immediate, actionable guidance for contacting support.
 */

import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpStep
} from "@/components/help/HelpCard";
import { Mail, MessageSquare, Clock, FileText, Shield, AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HelpContact = () => {
  return (
    <HelpArticleLayout
      category="Support"
      title="Contact Us"
      description="Get help from our team when you need it most."
      headerIcon={<MessageSquare className="w-7 h-7 text-primary" />}
      relatedLinks={[
        { title: "Help Center Home", href: "/help" },
        { title: "Account & Billing", href: "/help/account" },
        { title: "Privacy & Security", href: "/help/privacy" },
      ]}
    >
      {/* Email Support */}
      <section>
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-semibold mb-2">Email Support</h2>
              <p className="text-muted-foreground mb-4">
                For questions, feedback, or issues, email our support team directly. 
                We typically respond within one business day.
              </p>
              <Button asChild size="lg">
                <a href="mailto:support@coparrent.com">
                  support@coparrent.com
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Response Times */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Response Times
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <span className="font-medium">General inquiries</span>
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">1 business day</span>
          </div>
          <div className="p-4 border-b border-border flex justify-between items-center">
            <span className="font-medium">Billing questions</span>
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">1 business day</span>
          </div>
          <div className="p-4 border-b border-border flex justify-between items-center">
            <span className="font-medium">Account access issues</span>
            <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">Same day priority</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="font-medium">Security concerns</span>
            <span className="text-sm bg-destructive/10 text-destructive px-3 py-1 rounded-full font-medium">Immediate priority</span>
          </div>
        </div>
      </section>

      {/* What to Include */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          What to Include in Your Message
        </h2>
        <p className="text-muted-foreground mb-4">
          To help us assist you faster, please include:
        </p>
        <div className="space-y-4">
          <HelpStep number={1} title="Your account email">
            The email address you use to sign in to CoParrent.
          </HelpStep>
          <HelpStep number={2} title="Description of the issue">
            What you were trying to do and what happened instead.
          </HelpStep>
          <HelpStep number={3} title="Screenshots (if applicable)">
            Visual context helps us understand and resolve the problem faster.
          </HelpStep>
        </div>
      </section>

      {/* Self-Service Options */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Self-Service Options
        </h2>
        <p className="text-muted-foreground mb-4">
          Many common questions can be resolved through our Help Center:
        </p>
        <HelpFeatureGrid columns={1}>
          <Link 
            to="/help/getting-started" 
            className="block p-5 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <span className="font-semibold group-hover:text-primary transition-colors">Getting Started Guide</span>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your account, invite your co-parent, add children
            </p>
          </Link>
          <Link 
            to="/help/account" 
            className="block p-5 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <span className="font-semibold group-hover:text-primary transition-colors">Account & Billing</span>
            <p className="text-sm text-muted-foreground mt-1">
              Subscription management, payment issues, plan upgrades
            </p>
          </Link>
          <Link 
            to="/help/privacy" 
            className="block p-5 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <span className="font-semibold group-hover:text-primary transition-colors">Privacy & Security</span>
            <p className="text-sm text-muted-foreground mt-1">
              Data protection, account security, export your data
            </p>
          </Link>
        </HelpFeatureGrid>
      </section>

      {/* Privacy Note */}
      <HelpDisclaimer type="info">
        When you contact support, our team may access your account information 
        to help resolve your issue. We follow strict privacy protocols and 
        never share your personal information. All support interactions are 
        confidential.
      </HelpDisclaimer>

      {/* Safety Notice */}
      <HelpDisclaimer type="safety">
        If you are in immediate danger, please contact emergency services (911) first. 
        For domestic violence support, contact the National Domestic Violence Hotline 
        at 1-800-799-7233.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpContact;
