import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { APP_VERSION, getEnvironment } from "@/lib/version";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "For Law Offices", href: "/signup?type=lawoffice" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact", href: "/contact" },
    { label: "About", href: "/about" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security", href: "/security" },
  ],
};

export const Footer = () => {
  const env = getEnvironment();
  const showVersion = env !== "production"; // Only show in non-prod

  return (
    <footer className="bg-[hsl(222,47%,11%)] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo size="lg" className="mb-6" />
            <p className="text-white/70 max-w-sm mb-6">
              Helping co-parents communicate clearly, stay organized, and put their children first. 
              Built with families and family law professionals in mind.
            </p>
          </div>

        {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-white/80">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-white/60 hover:text-white transition-colors text-sm"
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
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} CoParrent. All rights reserved.
            </p>
            {showVersion && (
              <span className="text-xs text-white/30 font-mono">
                v{APP_VERSION}
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <Link to="/help" className="text-white/50 hover:text-white transition-colors text-sm">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
