import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

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
      <section>
        <h2>Why use schedule change requests</h2>
        <p>
          Rather than informal texts or calls, schedule change requests create a 
          documented record of proposed changes, responses, and final agreements. 
          This clarity helps prevent misunderstandings and provides evidence if 
          disputes arise later.
        </p>
      </section>

      <section>
        <h2>How to request a change</h2>
        <ol>
          <li>Open the Calendar and find the day you want to change.</li>
          <li>Click "Request Change" or tap the schedule change option.</li>
          <li>Specify what you're proposing (swap days, different pickup time, etc.).</li>
          <li>Add any explanation or context.</li>
          <li>Submit the request.</li>
        </ol>
        <p>
          Your co-parent receives a notification and can review the request in 
          their own calendar.
        </p>
      </section>

      <section>
        <h2>Responding to a request</h2>
        <p>
          When you receive a schedule change request, you have three options:
        </p>
        <ul>
          <li>
            <strong>Approve</strong> — The change is applied to the calendar and 
            both parties are notified.
          </li>
          <li>
            <strong>Decline</strong> — The original schedule remains unchanged. 
            You can add a note explaining your decision.
          </li>
          <li>
            <strong>Counter-propose</strong> — Suggest a different modification 
            as an alternative.
          </li>
        </ul>
      </section>

      <section>
        <h2>What gets recorded</h2>
        <p>
          All schedule change requests create an audit trail that includes:
        </p>
        <ul>
          <li>The original request with timestamp</li>
          <li>Any notes or context provided</li>
          <li>The response (approved, declined, or counter-proposal)</li>
          <li>The date and time of the response</li>
        </ul>
        <p>
          This record can be exported for legal proceedings if needed.
        </p>
      </section>

      <section>
        <h2>Best practices</h2>
        <ul>
          <li>Request changes as far in advance as possible.</li>
          <li>Provide clear reasoning for the request.</li>
          <li>Respond promptly to incoming requests.</li>
          <li>Keep communications factual and focused on the children's needs.</li>
        </ul>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpScheduleChangeRequests;
