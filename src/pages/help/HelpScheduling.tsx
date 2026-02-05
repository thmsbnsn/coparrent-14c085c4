import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid, 
  HelpStep,
  HelpCallout 
} from "@/components/help/HelpCard";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowRightLeft,
  Palette,
  CalendarCheck
} from "lucide-react";

/**
 * Scheduling Help - Main Category Page
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Provides real guidance on calendar and scheduling features
 * - Links to specific sub-topics and related features
 */

const HelpScheduling = () => {
  return (
    <HelpArticleLayout
      category="Scheduling"
      title="Custody calendars and exchanges"
      description="How to set up, view, and manage your custody schedule in CoParrent."
      headerIcon={<Calendar className="w-7 h-7 text-primary" />}
      primaryAction={{
        label: "Open Calendar",
        href: "/dashboard/calendar",
      }}
      relatedLinks={[
        { title: "How schedule change requests work", href: "/help/scheduling/change-requests" },
        { title: "Understanding custody schedule patterns", href: "/help/scheduling/patterns" },
        { title: "Court records and exports", href: "/court-records" },
      ]}
    >
      {/* What the calendar does */}
      <HelpCallout variant="primary">
        The Calendar is the central hub for tracking custody arrangements. 
        It shows which parent has the children on any given day, upcoming 
        exchanges, and any scheduled activities or events.
      </HelpCallout>

      {/* Setting up your schedule */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-primary" />
          Setting up your custody schedule
        </h2>
        <div className="space-y-4">
          <HelpStep number={1} title="Choose a pattern">
            Common patterns include week-on/week-off, 2-2-3, 3-4-4-3, or every other weekend. 
            You can select from preset options or create a custom arrangement.
          </HelpStep>
          <HelpStep number={2} title="Set the start date">
            Choose when the pattern begins. This determines which parent 
            has custody on which days going forward.
          </HelpStep>
          <HelpStep number={3} title="Configure exchanges">
            Set default exchange times and locations (e.g., "Friday at 6pm at school"). 
            These can be adjusted for individual days.
          </HelpStep>
          <HelpStep number={4} title="Add holidays">
            Override the regular pattern for holidays and special occasions. 
            These take precedence over the standard schedule.
          </HelpStep>
        </div>
      </section>

      {/* Viewing the calendar */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Understanding the calendar view
        </h2>
        <p className="text-muted-foreground mb-4">
          The calendar uses color coding to make custody assignments instantly clear:
        </p>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={CheckCircle} title="Your Custody Days" variant="primary">
            Days with your custody are highlighted in your assigned color, 
            making it easy to see at a glance.
          </HelpCard>
          <HelpCard icon={CheckCircle} title="Co-Parent's Days" variant="default">
            Days with your co-parent's custody appear in their designated color 
            for quick identification.
          </HelpCard>
          <HelpCard icon={ArrowRightLeft} title="Exchange Days" variant="default">
            Exchange days show transition indicators, including time and 
            location when configured.
          </HelpCard>
          <HelpCard icon={Calendar} title="Events & Activities" variant="default">
            Sports, appointments, and other activities appear as distinct 
            markers on their scheduled days.
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* Making changes */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          Making schedule changes
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground mb-4">
            To request a schedule change, use the Schedule Change Request feature. 
            This sends a formal request to your co-parent, who can approve or decline. 
            All requests and responses are documented for your records.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full">
              ✓ Documented
            </span>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
              ✓ Timestamped
            </span>
            <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
              ✓ Court-ready
            </span>
          </div>
        </div>
      </section>

      {/* Exchange check-ins */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Exchange check-ins
        </h2>
        <HelpCard icon={Clock} title="Document every exchange" variant="tip">
          During custody exchanges, you can record a check-in to document the time 
          and any notes about the exchange. This creates a timestamp record that 
          can be referenced later if needed—helpful for tracking patterns or 
          addressing disputes.
        </HelpCard>
      </section>

      {/* Important Notice */}
      <HelpDisclaimer type="legal">
        CoParrent helps you track and document your custody schedule, but it does 
        not create or modify legal custody agreements. Always consult with your 
        attorney for legal advice regarding custody arrangements.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpScheduling;
