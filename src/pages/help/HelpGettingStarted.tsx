import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid, 
  HelpStep,
  HelpCallout 
} from "@/components/help/HelpCard";
import { 
  Rocket, 
  User, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  DollarSign,
  Shield,
  UserPlus,
  Baby,
  Clock,
  CheckCircle2
} from "lucide-react";

/**
 * Getting Started - Help Article
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Provides real, actionable guidance
 * - Explains what this area is for and what problems it solves
 * - Directs users to relevant features in the app
 */

const HelpGettingStarted = () => {
  return (
    <HelpArticleLayout
      category="Getting Started"
      title="Account setup and basics"
      description="Everything you need to know to set up your CoParrent account and start coordinating with confidence."
      headerIcon={<Rocket className="w-7 h-7 text-primary" />}
      primaryAction={{
        label: "Go to Dashboard",
        href: "/dashboard",
      }}
      relatedLinks={[
        { title: "Inviting a co-parent or step-parent", href: "/help/getting-started/invitations" },
        { title: "Understanding custody schedule patterns", href: "/help/scheduling/patterns" },
        { title: "Your account and billing", href: "/help/account" },
      ]}
    >
      {/* Introduction Callout */}
      <HelpCallout variant="primary">
        CoParrent is a coordination platform for separated or divorced parents. 
        It provides shared calendars, documented messaging, expense tracking, 
        and document storage—all designed to reduce conflict and create clear records.
      </HelpCallout>

      {/* Your First Steps */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Your first steps
        </h2>
        <div className="space-y-4">
          <HelpStep number={1} title="Complete your profile">
            Add your name, contact preferences, and timezone in Settings. 
            This ensures notifications and calendar events display correctly.
          </HelpStep>
          <HelpStep number={2} title="Add your children">
            Go to the Children section to create profiles for each child, 
            including their school, medical information, and emergency contacts.
          </HelpStep>
          <HelpStep number={3} title="Set up your custody schedule">
            Use the Calendar to establish your custody pattern (e.g., week-on/week-off, 2-2-3). 
            This becomes the foundation for tracking who has the children.
          </HelpStep>
          <HelpStep number={4} title="Invite your co-parent">
            Send an invitation so they can access shared information and 
            communicate through the platform with full documentation.
          </HelpStep>
        </div>
      </section>

      {/* Key Features */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6">
          Key features to explore
        </h2>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={Calendar} title="Calendar" variant="default">
            View and manage custody schedules, request changes, 
            and track who has the children on any given day.
          </HelpCard>
          <HelpCard icon={MessageSquare} title="Messages" variant="default">
            Communicate with your co-parent in a documented, 
            timestamped format suitable for legal records.
          </HelpCard>
          <HelpCard icon={FileText} title="Documents" variant="default">
            Store and share important files like custody 
            agreements, medical records, and school forms.
          </HelpCard>
          <HelpCard icon={DollarSign} title="Expenses" variant="default">
            Track shared expenses, request reimbursements, 
            and maintain a clear financial record.
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* Roles and Permissions */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Roles and permissions
        </h2>
        <p className="text-muted-foreground mb-4">
          CoParrent supports different roles with appropriate access levels:
        </p>
        <div className="space-y-3">
          <HelpCard icon={User} title="Primary Parent" variant="primary">
            Full access to all features and settings. Can invite other users and manage permissions.
          </HelpCard>
          <HelpCard icon={Users} title="Co-Parent" variant="default">
            Access to shared calendars, messages, and documents. Equal partner in coordination.
          </HelpCard>
          <HelpCard icon={UserPlus} title="Step-Parent" variant="default">
            Limited access as configured by a primary parent. Can help with day-to-day coordination.
          </HelpCard>
          <HelpCard icon={Shield} title="Third Party" variant="default">
            View-only access for legal professionals, mediators, or therapists as needed.
          </HelpCard>
        </div>
      </section>

      {/* Time Estimate */}
      <section className="bg-muted/30 rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Setup time estimate</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Most families complete initial setup in <strong>10-15 minutes</strong>. 
          Adding detailed child information and configuring preferences may take 
          an additional 5-10 minutes per child.
        </p>
      </section>

      {/* Safety Disclaimer */}
      <HelpDisclaimer type="safety">
        If you are in an unsafe situation or concerned about domestic violence, 
        please contact the National Domestic Violence Hotline at 1-800-799-7233. 
        CoParrent is not a substitute for professional legal or safety advice.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpGettingStarted;
