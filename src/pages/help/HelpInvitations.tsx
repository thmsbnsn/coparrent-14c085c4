import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpStep,
  HelpCallout
} from "@/components/help/HelpCard";
import { 
  UserPlus, 
  Users,
  User,
  Shield,
  Scale,
  Settings,
  XCircle,
  Mail,
  CheckCircle
} from "lucide-react";

/**
 * Invitations Help - Specific Article
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Explains how to invite co-parents and step-parents
 * - Provides clear step-by-step guidance
 */

const HelpInvitations = () => {
  return (
    <HelpArticleLayout
      category="Getting Started"
      title="Inviting a co-parent or step-parent"
      description="How to add family members to your CoParrent account."
      headerIcon={<UserPlus className="w-7 h-7 text-primary" />}
      primaryAction={{
        label: "Open Settings",
        href: "/dashboard/settings",
      }}
      relatedLinks={[
        { title: "Account setup and basics", href: "/help/getting-started" },
        { title: "Roles and permissions", href: "/help/privacy" },
        { title: "Your account settings", href: "/help/account" },
      ]}
    >
      {/* Inviting your co-parent */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Inviting your co-parent
        </h2>
        <HelpCallout variant="primary">
          Your co-parent is the other parent of your child(ren). They have full 
          access to shared calendars, messages, documents, and expenses—equal 
          partners in coordination.
        </HelpCallout>
        <div className="space-y-4 mt-6">
          <HelpStep number={1} title="Go to Settings">
            Navigate to Settings and find the "Co-Parent" section.
          </HelpStep>
          <HelpStep number={2} title="Enter their email">
            Enter your co-parent's email address in the invitation field.
          </HelpStep>
          <HelpStep number={3} title="Send the invitation">
            Click "Send Invitation" to dispatch the email.
          </HelpStep>
          <HelpStep number={4} title="They create their account">
            Your co-parent receives an email with a link to create their account.
          </HelpStep>
          <HelpStep number={5} title="Start coordinating">
            Once they accept, you're connected and can start using all features together.
          </HelpStep>
        </div>
      </section>

      {/* Inviting a step-parent */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Inviting a step-parent
        </h2>
        <p className="text-muted-foreground mb-4">
          Step-parents can be added with limited access to help with day-to-day 
          coordination. Their permissions are controlled by the primary parent 
          who invited them.
        </p>
        <div className="space-y-4">
          <HelpStep number={1} title="Go to Settings">
            Navigate to Settings and find the "Step-Parent" section.
          </HelpStep>
          <HelpStep number={2} title="Enter their email">
            Enter the step-parent's email address.
          </HelpStep>
          <HelpStep number={3} title="Configure access">
            Set their access level—what they can see and do.
          </HelpStep>
          <HelpStep number={4} title="Send the invitation">
            Dispatch the invitation email.
          </HelpStep>
        </div>
      </section>

      {/* Step-parent permissions */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Step-parent permissions
        </h2>
        <p className="text-muted-foreground mb-4">
          When adding a step-parent, you can control their access to:
        </p>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={CheckCircle} title="Calendar access" variant="default">
            View the schedule and optionally create events
          </HelpCard>
          <HelpCard icon={CheckCircle} title="Message threads" variant="default">
            View-only access or full participation
          </HelpCard>
          <HelpCard icon={CheckCircle} title="Document access" variant="default">
            View shared family documents
          </HelpCard>
          <HelpCard icon={CheckCircle} title="Expense viewing" variant="default">
            See expense history and summaries
          </HelpCard>
        </HelpFeatureGrid>
        <p className="text-sm text-muted-foreground mt-4">
          You can adjust these permissions at any time from Settings.
        </p>
      </section>

      {/* Adding third-party access */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Adding third-party access
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground mb-4">
            In some cases, you may need to grant access to professionals like 
            attorneys, mediators, or therapists. Third-party users have view-only 
            access to specific records you choose to share.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <span className="text-sm">Go to Settings → Third-Party Access</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <span className="text-sm">Enter the professional's email and their role</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <span className="text-sm">Specify which records they can access</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">4</span>
              </div>
              <span className="text-sm">They receive an invitation to view the shared information</span>
            </div>
          </div>
        </div>
      </section>

      {/* Revoking access */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-primary" />
          Revoking access
        </h2>
        <HelpCard icon={XCircle} title="Remove access instantly" variant="warning">
          You can remove a step-parent or third-party user at any time. Go to 
          Settings, find their entry, and click "Remove Access." Their access 
          ends immediately—they can no longer view any shared information.
        </HelpCard>
        <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> You cannot remove your 
            co-parent's access—they are a permanent part of the shared account as the 
            other parent of your children.
          </p>
        </div>
      </section>

      {/* Safety disclaimer */}
      <HelpDisclaimer type="safety">
        If you need to restrict access due to a safety concern, please contact 
        support immediately. In emergency situations, contact local authorities first.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpInvitations;
