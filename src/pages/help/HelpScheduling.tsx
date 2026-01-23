import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

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
      <section>
        <h2>What the calendar does</h2>
        <p>
          The Calendar is the central hub for tracking custody arrangements. 
          It shows which parent has the children on any given day, upcoming 
          exchanges, and any scheduled activities or events.
        </p>
      </section>

      <section>
        <h2>Setting up your custody schedule</h2>
        <ol>
          <li>
            <strong>Choose a pattern</strong> — Common patterns include week-on/week-off, 
            2-2-3, 3-4-4-3, or every other weekend. You can select from preset options 
            or create a custom arrangement.
          </li>
          <li>
            <strong>Set the start date</strong> — Choose when the pattern begins. 
            This determines which parent has custody on which days going forward.
          </li>
          <li>
            <strong>Configure exchanges</strong> — Set default exchange times and 
            locations (e.g., "Friday at 6pm at school").
          </li>
          <li>
            <strong>Add holidays</strong> — Override the regular pattern for holidays 
            and special occasions.
          </li>
        </ol>
      </section>

      <section>
        <h2>Viewing the calendar</h2>
        <p>
          The calendar displays custody assignments using color coding:
        </p>
        <ul>
          <li>Days with your custody are highlighted in your assigned color.</li>
          <li>Days with your co-parent's custody appear in their color.</li>
          <li>Exchange days show transition indicators.</li>
          <li>Activities and events appear as distinct markers.</li>
        </ul>
      </section>

      <section>
        <h2>Making changes</h2>
        <p>
          To request a schedule change, use the Schedule Change Request feature. 
          This sends a formal request to your co-parent, who can approve or decline. 
          All requests and responses are documented for your records.
        </p>
      </section>

      <section>
        <h2>Exchange check-ins</h2>
        <p>
          During custody exchanges, you can record a check-in to document the time 
          and any notes about the exchange. This creates a timestamp record that 
          can be referenced later if needed.
        </p>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpScheduling;
