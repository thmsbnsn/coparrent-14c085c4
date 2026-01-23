import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

/**
 * Document Exports Help - Specific Article
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Explains export capabilities for messages and documents
 * - Provides guidance on court-ready exports
 */

const HelpDocumentExports = () => {
  return (
    <HelpArticleLayout
      category="Documents"
      title="Exporting messages and documents"
      description="How to export your CoParrent data for legal proceedings or personal records."
      primaryAction={{
        label: "Open Documents",
        href: "/dashboard/documents",
      }}
      relatedLinks={[
        { title: "Court records and legal use", href: "/court-records" },
        { title: "Document storage", href: "/help/documents" },
        { title: "Messaging and communication", href: "/help/messaging" },
      ]}
    >
      <section>
        <h2>Why export your data</h2>
        <p>
          CoParrent stores your communications and documents in a format that's 
          useful for legal proceedings. You may need to export data for:
        </p>
        <ul>
          <li>Court filings and hearings</li>
          <li>Attorney review</li>
          <li>Mediation sessions</li>
          <li>Personal backup and archiving</li>
        </ul>
      </section>

      <section>
        <h2>Exporting messages</h2>
        <ol>
          <li>Go to Messages and open the thread you want to export.</li>
          <li>Click the export or "Court View" option.</li>
          <li>Select the date range you want to include.</li>
          <li>Choose PDF format for a print-ready document.</li>
          <li>Download the file.</li>
        </ol>
        <p>
          Exported messages include full sender attribution, timestamps, and 
          are formatted for clarity in legal contexts.
        </p>
      </section>

      <section>
        <h2>Exporting documents</h2>
        <p>
          Individual documents can be downloaded directly from the Documents 
          section. For bulk exports:
        </p>
        <ol>
          <li>Go to Documents.</li>
          <li>Use the export option to select multiple documents.</li>
          <li>Download as a ZIP file containing all selected documents.</li>
        </ol>
      </section>

      <section>
        <h2>Exporting expense records</h2>
        <p>
          Expense history can be exported as a detailed report including:
        </p>
        <ul>
          <li>All logged expenses with dates and amounts</li>
          <li>Category breakdowns</li>
          <li>Receipt images</li>
          <li>Running totals and balances</li>
        </ul>
      </section>

      <section>
        <h2>Full data export</h2>
        <p>
          You can request a complete export of all your CoParrent data from 
          Settings. This includes:
        </p>
        <ul>
          <li>All messages</li>
          <li>All documents</li>
          <li>Expense history</li>
          <li>Calendar events and schedule changes</li>
          <li>Audit logs of important actions</li>
        </ul>
        <p>
          Full exports may take some time to generate. You'll receive a 
          notification when your export is ready.
        </p>
      </section>

      <section>
        <h2>Court-ready formatting</h2>
        <p>
          Exported documents are formatted for legal use:
        </p>
        <ul>
          <li>Clear headers identifying the source</li>
          <li>Timestamps in a standard format</li>
          <li>Full attribution on every entry</li>
          <li>Page numbers for multi-page documents</li>
          <li>No decorative elements that could obscure content</li>
        </ul>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpDocumentExports;
