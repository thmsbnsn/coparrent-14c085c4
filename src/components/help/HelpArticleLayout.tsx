import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

/**
 * HelpArticleLayout - Enhanced Visual Design
 * 
 * DESIGN DECISION (Truthful Scaffolding Mandate):
 * - Placeholder language ("coming soon", "under construction") is prohibited
 * - Every help page must provide real, actionable guidance
 * - If content is minimal, the page must still help the user understand
 *   what this feature is for and where to go next
 * - Sparse is acceptable; empty-feeling is not
 * 
 * VISUAL ENHANCEMENTS:
 * - Gradient header backgrounds
 * - Better typography hierarchy
 * - Card-based content sections
 * - Animated transitions
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
  /** Icon to display in the header */
  headerIcon?: ReactNode;
}

export const HelpArticleLayout = ({
  category,
  title,
  description,
  children,
  relatedLinks,
  primaryAction,
  backHref = "/help",
  headerIcon,
}: HelpArticleLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 lg:pt-24 pb-20">
        {/* Hero Header Section with Gradient */}
        <div className="bg-gradient-to-b from-muted/50 to-background border-b border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto py-8 lg:py-12">
              {/* Back navigation */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Link 
                  to={backHref}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Help Center
                </Link>
              </motion.div>

              {/* Header */}
              <motion.header
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <div className="flex items-start gap-4">
                  {headerIcon && (
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {headerIcon}
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                      {category}
                    </span>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold mb-3 text-foreground">
                      {title}
                    </h1>
                    <p className="text-base lg:text-lg text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              </motion.header>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Main content */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="py-8 lg:py-10"
            >
              <div className="help-content space-y-8">
                {children}
              </div>
            </motion.article>

            {/* Primary action */}
            {primaryAction && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-10"
              >
                <Link to={primaryAction.href}>
                  <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
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
                className="border-t border-border pt-8 mb-10"
              >
                <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Related articles
                </h2>
                <div className="grid gap-3">
                  {relatedLinks.map((link) => (
                    <div key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all group"
                        >
                          <span className="font-medium text-sm group-hover:text-primary transition-colors">
                            {link.title}
                          </span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all group"
                        >
                          <span className="font-medium text-sm group-hover:text-primary transition-colors">
                            {link.title}
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Contact support footer */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-6 lg:p-8 bg-gradient-to-br from-muted/50 to-muted/30 border border-border rounded-2xl text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-2">Need more help?</h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
                Our support team typically responds within one business day.
              </p>
              <Link to="/help/contact">
                <Button variant="outline" size="sm" className="gap-2">
                  Contact Support
                  <ArrowRight className="w-4 h-4" />
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
