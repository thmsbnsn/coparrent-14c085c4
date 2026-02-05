import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpStep,
  HelpCallout
} from "@/components/help/HelpCard";
import { 
  RefreshCw, 
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Scale,
  Lightbulb,
  ArrowRightLeft
} from "lucide-react";

/**
 * Schedule Change Requests Help - Specific Article
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Explains a specific feature in detail
 * - Provides operational guidance
 */

const HelpScheduleChangeRequests = () => {
  return (
    <HelpArticleLayout
      category="Scheduling"
      title="How schedule change requests work"
      description="Requesting and responding to custody schedule changes in CoParrent."
      headerIcon={<RefreshCw className="w-7 h-7 text-primary" />}
      primaryAction={{
        label: "Open Calendar",
        href: "/dashboard/calendar",
      }}
      relatedLinks={[
        { title: "Custody calendars and exchanges", href: "/help/scheduling" },
        { title: "Understanding schedule patterns", href: "/help/scheduling/patterns" },
        { title: "Court records", href: "/court-records" },
      ]}
    >
      {/* Why use schedule change requests */}
      <HelpCallout variant="primary">
        Rather than informal texts or calls, schedule change requests create a 
        documented record of proposed changes, responses, and final agreements. 
        This clarity helps prevent misunderstandings and provides evidence if 
        disputes arise later.
      </HelpCallout>

      {/* How to request a change */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          How to request a change
        </h2>
        <div className="space-y-4">
          <HelpStep number={1} title="Open the Calendar">
            Navigate to the Calendar and find the day you want to change.
          </HelpStep>
          <HelpStep number={2} title="Select Request Change">
            Click "Request Change" or tap the schedule change option.
          </HelpStep>
          <HelpStep number={3} title="Specify your proposal">
            Describe what you're proposing (swap days, different pickup time, etc.).
          </HelpStep>
          <HelpStep number={4} title="Add context">
            Include any explanation or reason for the request.
          </HelpStep>
          <HelpStep number={5} title="Submit the request">
            Your co-parent receives a notification and can review in their calendar.
          </HelpStep>
        </div>
      </section>

      {/* Responding to a request */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Responding to a request
        </h2>
        <p className="text-muted-foreground mb-4">
          When you receive a schedule change request, you have three options:
        </p>
        <div className="space-y-3">
          <HelpCard icon={CheckCircle} title="Approve" variant="tip">
            The change is applied to the calendar and both parties are notified. 
            The approval is documented with a timestamp.
          </HelpCard>
          <HelpCard icon={XCircle} title="Decline" variant="warning">
            The original schedule remains unchanged. You can add a note explaining 
            your decision for the record.
          </HelpCard>
          <HelpCard icon={RefreshCw} title="Counter-propose" variant="default">
            Suggest a different modification as an alternative. This keeps the 
            conversation going while documenting the negotiation.
          </HelpCard>
        </div>
      </section>

      {/* What gets recorded */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          What gets recorded
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground mb-4">
            All schedule change requests create an audit trail that includes:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">The original request with timestamp</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Any notes or context provided</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">The response (approved, declined, counter)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">The date and time of the response</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">This record can be exported for legal proceedings if needed.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Best practices */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Best practices
        </h2>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={Clock} title="Request in advance" variant="tip">
            Request changes as far in advance as possible. Last-minute requests 
            are harder to accommodate.
          </HelpCard>
          <HelpCard icon={MessageSquare} title="Provide clear reasoning" variant="tip">
            Explain why you're requesting the change. Context helps your 
            co-parent make informed decisions.
          </HelpCard>
          <HelpCard icon={CheckCircle} title="Respond promptly" variant="tip">
            Don't leave requests pending. Respond in a timely manner to 
            maintain good communication.
          </HelpCard>
          <HelpCard icon={FileText} title="Stay factual" variant="tip">
            Keep communications focused on the children's needs. Avoid 
            emotional language or blame.
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* Legal disclaimer */}
      <HelpDisclaimer type="legal">
        Schedule change requests in CoParrent are for coordination purposes and 
        do not modify your legal custody agreement. Consult with your attorney 
        for guidance on permanent schedule changes.
      </HelpDisclaimer>

      {/* Important notice */}
      <HelpDisclaimer type="important">
        Both parents can see all schedule change requests and responses. Keep 
        your communications professional—they may be reviewed by attorneys, 
        mediators, or judges.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpScheduleChangeRequests;
