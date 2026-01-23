import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { APP_VERSION, getEnvironment } from "@/lib/version";

/**
 * Footer - Professional, Structured
 * 
 * Design Intent:
 * - Clean, organized link structure
 * - Trustworthy, not cluttered
 * - Consistent with authority-driven brand
 */

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "For Attorneys", href: "/signup?type=lawoffice" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact", href: "/contact" },
    { label: "About", href: "/about" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
  ],
};

export const Footer = () => {
  const env = getEnvironment();
  const showVersion = env !== "production";

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo size="lg" className="mb-5 text-white" />
            <p className="text-white/60 max-w-sm text-sm leading-relaxed">
              The co-parenting platform built for clarity, documentation, 
              and peace of mind. Trusted by families and legal professionals.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-xs uppercase tracking-widest mb-4 text-white/80">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-white/50 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} CoParrent. All rights reserved.
            </p>
            {showVersion && (
              <span className="text-xs text-white/25 font-mono">
                v{APP_VERSION}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
