import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpStep,
  HelpCallout
} from "@/components/help/HelpCard";
import { 
  Calendar, 
  Clock,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowRightLeft
} from "lucide-react";

/**
 * Schedule Patterns Help - Specific Article
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Explains common custody schedule patterns
 * - Provides educational, actionable content
 */

const HelpSchedulePatterns = () => {
  return (
    <HelpArticleLayout
      category="Scheduling"
      title="Understanding custody schedule patterns"
      description="Common custody arrangements and how to set them up in CoParrent."
      headerIcon={<Calendar className="w-7 h-7 text-primary" />}
      primaryAction={{
        label: "Open Calendar",
        href: "/dashboard/calendar",
      }}
      relatedLinks={[
        { title: "Custody calendars and exchanges", href: "/help/scheduling" },
        { title: "Schedule change requests", href: "/help/scheduling/change-requests" },
        { title: "Getting started guide", href: "/help/getting-started" },
      ]}
    >
      {/* Common custody patterns intro */}
      <HelpCallout variant="primary">
        CoParrent supports a variety of custody schedules. Here are the most 
        common patterns and how they work. Your schedule should match your 
        custody agreement.
      </HelpCallout>

      {/* Week-on, Week-off */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Week-on, Week-off (7-7)
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground mb-4">
            Each parent has the children for one full week at a time. Exchanges 
            typically happen on the same day each week (e.g., every Friday).
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Pros</span>
                <p className="text-xs text-muted-foreground">Simple, fewer exchanges, longer quality time</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Cons</span>
                <p className="text-xs text-muted-foreground">Full week without other parent</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Best for</span>
                <p className="text-xs text-muted-foreground">Older children, distant parents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2-2-3 Pattern */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          2-2-3 Pattern
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground mb-4">
            A two-week rotating schedule: Parent A has Monday-Tuesday, Parent B has 
            Wednesday-Thursday, and weekends alternate.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Pros</span>
                <p className="text-xs text-muted-foreground">Never more than 2-3 days apart</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Cons</span>
                <p className="text-xs text-muted-foreground">More transitions, more coordination</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Best for</span>
                <p className="text-xs text-muted-foreground">Younger children, nearby parents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-4-4-3 Pattern */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          3-4-4-3 Pattern
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground mb-4">
            Parent A has 3 days, Parent B has 4 days, then they swap the following 
            week (Parent A has 4, Parent B has 3).
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Pros</span>
                <p className="text-xs text-muted-foreground">Equal time over two weeks</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Cons</span>
                <p className="text-xs text-muted-foreground">Confusing without a calendar</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Best for</span>
                <p className="text-xs text-muted-foreground">Equal time with balance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Every Other Weekend */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Every Other Weekend
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground mb-4">
            One parent has primary custody during the week; the other has the 
            children every other weekend.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Pros</span>
                <p className="text-xs text-muted-foreground">Stable school routine</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Cons</span>
                <p className="text-xs text-muted-foreground">Unequal time distribution</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Best for</span>
                <p className="text-xs text-muted-foreground">Primary caregiver situations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom patterns */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Custom patterns
        </h2>
        <HelpCard icon={Settings} title="Create your own schedule" variant="tip">
          CoParrent allows you to create custom schedules that don't follow 
          standard patterns. You can set specific days for each parent and 
          override the pattern for holidays and special occasions.
        </HelpCard>
      </section>

      {/* Setting up your pattern */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Setting up your pattern
        </h2>
        <div className="space-y-4">
          <HelpStep number={1} title="Access schedule settings">
            Go to the Calendar and open schedule settings.
          </HelpStep>
          <HelpStep number={2} title="Select your pattern">
            Choose a preset pattern or select "Custom" for flexibility.
          </HelpStep>
          <HelpStep number={3} title="Set the start date">
            Define who has the children first and when the pattern begins.
          </HelpStep>
          <HelpStep number={4} title="Configure exchanges">
            Set default exchange times and locations for transitions.
          </HelpStep>
          <HelpStep number={5} title="Add holiday exceptions">
            Override the regular pattern for holidays and special days.
          </HelpStep>
        </div>
      </section>

      {/* Changing patterns */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Changing patterns
        </h2>
        <HelpCard icon={RefreshCw} title="Both parents must agree" variant="warning">
          If you need to change your custody pattern, both parents must agree. 
          Use the schedule change request feature to propose and document any 
          pattern changes. This creates a clear record of the agreement.
        </HelpCard>
      </section>

      {/* Legal disclaimer */}
      <HelpDisclaimer type="legal">
        Your custody schedule in CoParrent should reflect your legal custody agreement. 
        CoParrent does not create or modify legal custody arrangements. Always consult 
        with your attorney before making changes to your parenting plan.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpSchedulePatterns;
