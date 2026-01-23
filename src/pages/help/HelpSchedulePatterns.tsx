import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

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
      <section>
        <h2>Common custody patterns</h2>
        <p>
          CoParrent supports a variety of custody schedules. Here are the most 
          common patterns and how they work:
        </p>
      </section>

      <section>
        <h3>Week-on, Week-off (7-7)</h3>
        <p>
          Each parent has the children for one full week at a time. Exchanges 
          typically happen on the same day each week (e.g., every Friday).
        </p>
        <ul>
          <li><strong>Pros:</strong> Simple, fewer exchanges, longer stretches with each parent.</li>
          <li><strong>Cons:</strong> A full week without seeing the other parent.</li>
          <li><strong>Best for:</strong> Older children, parents who live far apart.</li>
        </ul>
      </section>

      <section>
        <h3>2-2-3 Pattern</h3>
        <p>
          A two-week rotating schedule: Parent A has Monday-Tuesday, Parent B has 
          Wednesday-Thursday, and weekends alternate.
        </p>
        <ul>
          <li><strong>Pros:</strong> Children never go more than 2-3 days without seeing either parent.</li>
          <li><strong>Cons:</strong> More transitions, requires more coordination.</li>
          <li><strong>Best for:</strong> Younger children, parents who live close together.</li>
        </ul>
      </section>

      <section>
        <h3>3-4-4-3 Pattern</h3>
        <p>
          Parent A has 3 days, Parent B has 4 days, then they swap the following 
          week (Parent A has 4, Parent B has 3).
        </p>
        <ul>
          <li><strong>Pros:</strong> Equal time over a two-week period, balanced schedule.</li>
          <li><strong>Cons:</strong> Can be confusing to track without a calendar.</li>
          <li><strong>Best for:</strong> Parents wanting equal time with manageable transitions.</li>
        </ul>
      </section>

      <section>
        <h3>Every Other Weekend</h3>
        <p>
          One parent has primary custody during the week; the other has the 
          children every other weekend.
        </p>
        <ul>
          <li><strong>Pros:</strong> Stable school routine, clear structure.</li>
          <li><strong>Cons:</strong> Unequal time distribution.</li>
          <li><strong>Best for:</strong> Situations where one parent is the primary caregiver.</li>
        </ul>
      </section>

      <section>
        <h3>Custom patterns</h3>
        <p>
          CoParrent allows you to create custom schedules that don't follow 
          standard patterns. You can set specific days for each parent and 
          override the pattern for holidays and special occasions.
        </p>
      </section>

      <section>
        <h2>Setting up your pattern</h2>
        <ol>
          <li>Go to the Calendar and access schedule settings.</li>
          <li>Select your pattern or choose "Custom."</li>
          <li>Set the start date (who has the children first).</li>
          <li>Configure exchange times and locations.</li>
          <li>Add holiday exceptions if needed.</li>
        </ol>
      </section>

      <section>
        <h2>Changing patterns</h2>
        <p>
          If you need to change your custody pattern, both parents must agree. 
          Use the schedule change request feature to propose and document any 
          pattern changes.
        </p>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpSchedulePatterns;
