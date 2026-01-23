import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

/**
 * HelpArticleLayout - Truthful Scaffold Pattern
 * 
 * DESIGN DECISION (Truthful Scaffolding Mandate):
 * - Placeholder language ("coming soon", "under construction") is prohibited
 * - Every help page must provide real, actionable guidance
 * - If content is minimal, the page must still help the user understand
 *   what this feature is for and where to go next
 * - Sparse is acceptable; empty-feeling is not
 * 
 * This layout enforces consistent structure across all help articles
 * and ensures no help route resolves to a dead end.
 */

interface RelatedLink {
  title: string;
  href: string;
  external?: boolean;
}

interface HelpArticleLayoutProps {
  /** Category tag displayed above the title */
  category: string;
  /** Main article title */
  title: string;
  /** Brief description of what this article covers */
  description: string;
  /** Main content of the help article */
  children: ReactNode;
  /** Related articles or features to link to */
  relatedLinks?: RelatedLink[];
  /** Primary action button - links to the relevant feature in the app */
  primaryAction?: {
    label: string;
    href: string;
  };
  /** Back link - defaults to /help */
  backHref?: string;
}

export const HelpArticleLayout = ({
  category,
  title,
  description,
  children,
  relatedLinks,
  primaryAction,
  backHref = "/help",
}: HelpArticleLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 lg:pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Back navigation */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Link 
                to={backHref}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Help Center
              </Link>
            </motion.div>

            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-10"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                {category}
              </span>
              <h1 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                {title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {description}
              </p>
            </motion.header>

            {/* Main content */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prose prose-neutral dark:prose-invert max-w-none mb-12"
            >
              {children}
            </motion.article>

            {/* Primary action */}
            {primaryAction && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-12"
              >
                <Link to={primaryAction.href}>
                  <Button size="lg" className="gap-2">
                    {primaryAction.label}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Related links */}
            {relatedLinks && relatedLinks.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border-t border-border pt-8"
              >
                <h2 className="text-lg font-display font-semibold mb-4">
                  Related articles
                </h2>
                <ul className="space-y-3">
                  {relatedLinks.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          {link.title}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          {link.title}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Contact support footer */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-12 p-6 bg-muted/30 border border-border rounded-xl text-center"
            >
              <p className="text-muted-foreground text-sm mb-3">
                Need more help with this topic?
              </p>
              <Link to="/help">
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
