import { HelpArticleLayout } from "@/components/help/HelpArticleLayout";

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
      <section>
        <h2>What you can store</h2>
        <p>
          The Documents section is designed for important family records that 
          both parents may need to access:
        </p>
        <ul>
          <li>Custody agreements and court orders</li>
          <li>Medical records and insurance cards</li>
          <li>School enrollment forms and report cards</li>
          <li>Vaccination records</li>
          <li>Passports and identification documents</li>
          <li>Activity registration forms</li>
        </ul>
      </section>

      <section>
        <h2>Uploading documents</h2>
        <ol>
          <li>Go to the Documents section from your dashboard.</li>
          <li>Click "Upload Document" or drag and drop files.</li>
          <li>Add a title, description, and category.</li>
          <li>Optionally associate the document with a specific child.</li>
          <li>The document is now available to both parents.</li>
        </ol>
      </section>

      <section>
        <h2>Document categories</h2>
        <p>
          Organize documents by category to find them quickly:
        </p>
        <ul>
          <li><strong>Legal</strong> — Custody agreements, court orders, parenting plans</li>
          <li><strong>Medical</strong> — Health records, prescriptions, insurance</li>
          <li><strong>School</strong> — Enrollment, grades, IEPs, permission slips</li>
          <li><strong>Financial</strong> — Tax documents, expense records</li>
          <li><strong>Other</strong> — Any documents that don't fit other categories</li>
        </ul>
      </section>

      <section>
        <h2>Access logging</h2>
        <p>
          Every time a document is viewed or downloaded, an access log entry is created. 
          This provides a record of who accessed what and when, which can be important 
          for legal purposes.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          Documents are stored securely and encrypted. Only users with appropriate 
          permissions can view or download them. Third-party users (like attorneys) 
          can be granted view-only access if needed.
        </p>
      </section>
    </HelpArticleLayout>
  );
};

export default HelpDocuments;
