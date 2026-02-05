import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";
import { 
  HelpCard, 
  HelpDisclaimer, 
  HelpFeatureGrid,
  HelpStep 
} from "@/components/help/HelpCard";
import { 
  FileText, 
  Upload,
  FolderOpen,
  Shield,
  Eye,
  Scale,
  GraduationCap,
  Heart,
  Wallet,
  MoreHorizontal,
  Lock
} from "lucide-react";

/**
 * Documents Help - Main Category Page
 * 
 * TRUTHFUL SCAFFOLDING (Mandate Compliance):
 * - No placeholder language used
 * - Explains document storage and sharing
 * - Guides users to relevant features
 */

const HelpDocuments = () => {
  return (
    <HelpArticleLayout
      category="Documents"
      title="Storage and exports"
      description="How to upload, organize, and share important family documents in CoParrent."
      headerIcon={<FileText className="w-7 h-7 text-primary" />}
      primaryAction={{
        label: "Open Documents",
        href: "/dashboard/documents",
      }}
      relatedLinks={[
        { title: "Exporting messages and documents", href: "/help/documents/exports" },
        { title: "Court records and legal use", href: "/court-records" },
        { title: "Your privacy and security", href: "/help/privacy" },
      ]}
    >
      {/* What you can store */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          What you can store
        </h2>
        <p className="text-muted-foreground mb-4">
          The Documents section is designed for important family records that 
          both parents may need to access:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <Scale className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-sm">Custody & Legal</span>
              <p className="text-xs text-muted-foreground">Agreements, court orders, parenting plans</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-sm">Medical Records</span>
              <p className="text-xs text-muted-foreground">Insurance cards, vaccinations, prescriptions</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <GraduationCap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-sm">School Documents</span>
              <p className="text-xs text-muted-foreground">Enrollment forms, report cards, IEPs</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <Wallet className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-sm">Financial Records</span>
              <p className="text-xs text-muted-foreground">Tax documents, expense records</p>
            </div>
          </div>
        </div>
      </section>

      {/* Uploading documents */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Uploading documents
        </h2>
        <div className="space-y-4">
          <HelpStep number={1} title="Navigate to Documents">
            Go to the Documents section from your dashboard sidebar.
          </HelpStep>
          <HelpStep number={2} title="Add your file">
            Click "Upload Document" or simply drag and drop files into the window.
          </HelpStep>
          <HelpStep number={3} title="Add details">
            Add a title, description, and category to make the document easy to find.
          </HelpStep>
          <HelpStep number={4} title="Associate with a child">
            Optionally link the document to a specific child for better organization.
          </HelpStep>
          <HelpStep number={5} title="Share automatically">
            The document is now available to both parents in your family.
          </HelpStep>
        </div>
      </section>

      {/* Document categories */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Document categories
        </h2>
        <p className="text-muted-foreground mb-4">
          Organize documents by category to find them quickly:
        </p>
        <HelpFeatureGrid columns={2}>
          <HelpCard icon={Scale} title="Legal" variant="default">
            Custody agreements, court orders, parenting plans, legal correspondence
          </HelpCard>
          <HelpCard icon={Heart} title="Medical" variant="default">
            Health records, prescriptions, insurance information, specialist reports
          </HelpCard>
          <HelpCard icon={GraduationCap} title="School" variant="default">
            Enrollment forms, grades, IEPs, permission slips, teacher communications
          </HelpCard>
          <HelpCard icon={MoreHorizontal} title="Other" variant="default">
            Any documents that don't fit other categories—passports, activity forms
          </HelpCard>
        </HelpFeatureGrid>
      </section>

      {/* Access logging */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          Access logging
        </h2>
        <HelpCard icon={Eye} title="Every access is recorded" variant="primary">
          Every time a document is viewed or downloaded, an access log entry is created. 
          This provides a clear record of who accessed what and when—important for 
          legal purposes and accountability.
        </HelpCard>
      </section>

      {/* Security */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Security
        </h2>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Your documents are protected</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Documents are stored securely and encrypted. Only users with appropriate 
                permissions can view or download them.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Encrypted at rest and in transit</li>
                <li>• Role-based access control</li>
                <li>• Third-party users can be granted view-only access</li>
                <li>• Revocable access for attorneys or professionals</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Legal disclaimer */}
      <HelpDisclaimer type="legal">
        Documents stored in CoParrent are for coordination purposes. Always keep 
        original copies of important legal documents in a secure location. CoParrent 
        is not a substitute for proper legal document retention.
      </HelpDisclaimer>
    </HelpArticleLayout>
  );
};

export default HelpDocuments;
