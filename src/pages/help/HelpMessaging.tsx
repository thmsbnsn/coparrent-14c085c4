import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpCallout 
} from "@/components/help/HelpCard";
import { 
  MessageSquare, 
  FileText, 
  Users,
  Baby,
  Scale,
  Search,
  Clock,
  CheckCircle,
  Heart,
  AlertTriangle,
  Lightbulb
} from "lucide-react";

/**
 * Messaging Help - Main Category Page
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Explains the purpose of documented messaging
 * - Provides guidance on court-ready communication
 */

const HelpMessaging = () => {
  return (
    <HelpArticleLayout
      category="Messaging"
      title="Communication and records"
      description="How to use CoParrent's messaging system for documented, respectful co-parenting communication."
      headerIcon={<MessageSquare className="w-7 h-7 text-primary" />}
      primaryAction={{
        label: "Open Messages",
        href: "/dashboard/messages",
      }}
      relatedLinks={[
        { title: "Exporting messages and documents", href: "/help/documents/exports" },
        { title: "Court records and legal use", href: "/court-records" },
        { title: "Your privacy and security", href: "/help/privacy" },
      ]}
    >
      {/* Why documented messaging matters */}
      <HelpCallout variant="primary">
        Every message in CoParrent is timestamped and stored as a permanent record. 
        Unlike text messages or emails, this creates a clear, organized communication 
        history that can be exported for legal purposes if needed.
      </HelpCallout>

      {/* Message types */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Types of conversations
        </h2>
        <div className="space-y-3">
          <HelpCard icon={MessageSquare} title="Co-parent threads" variant="primary">
            Direct communication with your co-parent about scheduling, expenses, 
            and child-related matters. These are the most common conversations.
          </HelpCard>
          <HelpCard icon={Users} title="Family threads" variant="default">
            Group conversations that may include step-parents or other approved 
            family members for coordinated communication.
          </HelpCard>
          <HelpCard icon={Baby} title="Child messages" variant="default">
            If enabled, children with accounts can send notes to parents within 
            the platform. Parents control this feature in settings.
          </HelpCard>
        </div>
      </section>

      {/* Court View */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Court View mode
        </h2>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-4">
            Messages can be viewed in "Court View" mode, which displays the conversation 
            in a format suitable for legal proceedings:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Full sender attribution on every message</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Precise timestamps in standard format</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Removes decorative elements for clarity</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Export as PDF for printing or filing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Best practices */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Best practices for communication
        </h2>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={FileText} title="Be factual and brief" variant="tip">
            Stick to the topic at hand. Avoid emotional language or 
            rehashing past conflicts. Facts over feelings.
          </HelpCard>
          <HelpCard icon={CheckCircle} title="Document decisions" variant="tip">
            When you agree on something, state it clearly so there's 
            a record. "We agree to swap weekends on the 15th."
          </HelpCard>
          <HelpCard icon={Clock} title="Respond thoughtfully" variant="tip">
            Take time before replying. The compose area includes 
            reminders about maintaining a constructive tone.
          </HelpCard>
          <HelpCard icon={Heart} title="Keep children central" variant="tip">
            Frame discussions around what's best for your children. 
            This keeps conversations focused and productive.
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* Message search */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Finding past messages
        </h2>
        <HelpCard icon={Search} title="Message search" variant="default">
          Use the search feature to find specific messages by keyword, date range, 
          or sender. This helps you quickly locate important agreements or discussions 
          when you need them—whether for a court date or just to recall a decision.
        </HelpCard>
      </section>

      {/* Tone reminder */}
      <HelpDisclaimer type="important">
        Messages in CoParrent may be reviewed by attorneys, judges, or mediators. 
        Always communicate as if your messages will be read aloud in court. 
        Keep your children's wellbeing at the center of every conversation.
      </HelpDisclaimer>

      {/* Safety disclaimer */}
      <HelpDisclaimer type="safety">
        If you are experiencing harassment or threats through any communication channel, 
        document everything and contact local authorities. CoParrent records can serve 
        as evidence, but your safety comes first.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpMessaging;
