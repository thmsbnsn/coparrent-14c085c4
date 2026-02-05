import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpStep,
  HelpCallout
} from "@/components/help/HelpCard";
import { 
  Download, 
  FileText,
  MessageSquare,
  DollarSign,
  Calendar,
  Scale,
  CheckCircle,
  FolderOpen,
  Clock,
  Printer
} from "lucide-react";

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
      headerIcon={<Download className="w-7 h-7 text-primary" />}
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
      {/* Why export your data */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Why export your data
        </h2>
        <p className="text-muted-foreground mb-4">
          CoParrent stores your communications and documents in a format that's 
          useful for legal proceedings. You may need to export data for:
        </p>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={Scale} title="Court filings" variant="default">
            Hearings, motions, and legal filings where communication records are needed
          </HelpCard>
          <HelpCard icon={FileText} title="Attorney review" variant="default">
            Sharing records with your legal counsel for case preparation
          </HelpCard>
          <HelpCard icon={MessageSquare} title="Mediation sessions" variant="default">
            Providing context and documentation for mediation proceedings
          </HelpCard>
          <HelpCard icon={FolderOpen} title="Personal backup" variant="default">
            Archiving your records for personal reference and safekeeping
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* Exporting messages */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Exporting messages
        </h2>
        <div className="space-y-4">
          <HelpStep number={1} title="Open the thread">
            Go to Messages and open the conversation you want to export.
          </HelpStep>
          <HelpStep number={2} title="Select export or Court View">
            Click the export option or switch to "Court View" mode.
          </HelpStep>
          <HelpStep number={3} title="Choose date range">
            Select the specific date range you want to include.
          </HelpStep>
          <HelpStep number={4} title="Download as PDF">
            Choose PDF format for a print-ready, court-suitable document.
          </HelpStep>
        </div>
        <HelpCallout variant="success" className="mt-4">
          Exported messages include full sender attribution, precise timestamps, 
          and are formatted for clarity in legal contexts.
        </HelpCallout>
      </section>

      {/* Exporting documents */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Exporting documents
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground mb-4">
            Individual documents can be downloaded directly from the Documents 
            section. For bulk exports:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <span className="text-sm">Go to the Documents section</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <span className="text-sm">Use the export option to select multiple documents</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <span className="text-sm">Download as a ZIP file containing all selected documents</span>
            </div>
          </div>
        </div>
      </section>

      {/* Exporting expense records */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Exporting expense records
        </h2>
        <HelpCard icon={DollarSign} title="Detailed expense reports" variant="default">
          <p className="mb-3">Expense history can be exported as a detailed report including:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>All logged expenses with dates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Category breakdowns</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Receipt images included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Running totals and balances</span>
            </div>
          </div>
        </HelpCard>
      </section>

      {/* Full data export */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Full data export
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Complete account export</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You can request a complete export of all your CoParrent data from Settings:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• All messages and conversations</li>
                <li>• All documents and attachments</li>
                <li>• Complete expense history</li>
                <li>• Calendar events and schedule changes</li>
                <li>• Audit logs of important actions</li>
              </ul>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Full exports may take time to generate. You'll receive a notification when ready.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Court-ready formatting */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Printer className="w-5 h-5 text-primary" />
          Court-ready formatting
        </h2>
        <p className="text-muted-foreground mb-4">
          Exported documents are formatted specifically for legal use:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Clear headers identifying the source</span>
          </div>
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Timestamps in standard format</span>
          </div>
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Full attribution on every entry</span>
          </div>
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Page numbers for multi-page documents</span>
          </div>
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg col-span-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">No decorative elements that could obscure content</span>
          </div>
        </div>
      </section>

      {/* Legal disclaimer */}
      <HelpDisclaimer type="legal">
        Exported documents are for informational purposes. Consult with your attorney 
        about proper formatting and authentication requirements for your jurisdiction. 
        Courts may have specific rules about electronic evidence.
      </HelpDisclaimer>

      {/* Data retention notice */}
      <HelpDisclaimer type="info">
        CoParrent retains your data according to our data retention policy. We recommend 
        exporting important records periodically for your own archives.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpDocumentExports;
