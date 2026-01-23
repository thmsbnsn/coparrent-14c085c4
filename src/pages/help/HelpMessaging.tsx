import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

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
      <section>
        <h2>Why documented messaging matters</h2>
        <p>
          Every message in CoParrent is timestamped and stored as a permanent record. 
          Unlike text messages or emails, this creates a clear, organized communication 
          history that can be exported for legal purposes if needed.
        </p>
      </section>

      <section>
        <h2>Message types</h2>
        <ul>
          <li>
            <strong>Co-parent threads</strong> — Direct communication with your co-parent 
            about scheduling, expenses, and child-related matters.
          </li>
          <li>
            <strong>Family threads</strong> — Group conversations that may include 
            step-parents or other approved family members.
          </li>
          <li>
            <strong>Child messages</strong> — If enabled, children with accounts can 
            send notes to parents within the platform.
          </li>
        </ul>
      </section>

      <section>
        <h2>Court View</h2>
        <p>
          Messages can be viewed in "Court View" mode, which displays the conversation 
          in a format suitable for legal proceedings. This view:
        </p>
        <ul>
          <li>Shows full sender attribution on every message</li>
          <li>Displays precise timestamps</li>
          <li>Removes decorative elements for clarity</li>
          <li>Can be printed or exported as PDF</li>
        </ul>
      </section>

      <section>
        <h2>Best practices</h2>
        <ul>
          <li>
            <strong>Be factual and brief</strong> — Stick to the topic at hand. 
            Avoid emotional language or rehashing past conflicts.
          </li>
          <li>
            <strong>Document decisions</strong> — When you agree on something, 
            state it clearly so there's a record.
          </li>
          <li>
            <strong>Respond thoughtfully</strong> — Take time before replying. 
            The compose area includes reminders about maintaining a constructive tone.
          </li>
          <li>
            <strong>Keep children's interests central</strong> — Frame discussions 
            around what's best for your children.
          </li>
        </ul>
      </section>

      <section>
        <h2>Message search</h2>
        <p>
          Use the search feature to find specific messages by keyword, date range, 
          or sender. This helps you quickly locate important agreements or discussions.
        </p>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpMessaging;
