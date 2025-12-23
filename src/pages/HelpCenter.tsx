import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Search, 
  Rocket, 
  Calendar, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  Scale, 
  User, 
  Shield,
  ChevronRight,
  Mail,
  HelpCircle
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const helpCategories = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Set up your account and learn the basics",
    href: "/help/getting-started",
  },
  {
    icon: Calendar,
    title: "Scheduling & Exchanges",
    description: "Manage custody schedules and check-ins",
    href: "/help/scheduling",
  },
  {
    icon: MessageSquare,
    title: "Communication & Messaging",
    description: "Send messages and maintain records",
    href: "/help/messaging",
  },
  {
    icon: FileText,
    title: "Documents & Records",
    description: "Upload, organize, and export documents",
    href: "/help/documents",
  },
  {
    icon: DollarSign,
    title: "Expenses & Reimbursements",
    description: "Track shared costs and request payments",
    href: "/help/expenses",
  },
  {
    icon: Scale,
    title: "Court & Legal Use",
    description: "Prepare records for legal proceedings",
    href: "/court-records",
  },
  {
    icon: User,
    title: "Account & Billing",
    description: "Manage your subscription and profile",
    href: "/help/account",
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Understand how your data is protected",
    href: "/help/privacy",
  },
];

const popularArticles = [
  {
    title: "How CoParrent records are used in court",
    href: "/court-records",
  },
  {
    title: "What happens when a trial ends",
    href: "/help/account/trial-ending",
  },
  {
    title: "How schedule changes work",
    href: "/help/scheduling/change-requests",
  },
  {
    title: "How to invite a co-parent or step-parent",
    href: "/help/getting-started/invitations",
  },
  {
    title: "Exporting messages and documents as PDFs",
    href: "/help/documents/exports",
  },
  {
    title: "Understanding custody schedule patterns",
    href: "/help/scheduling/patterns",
  },
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 lg:pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-display font-bold mb-6"
            >
              Help when you need it
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Find answers, guides, and support for every part of co-parenting with CoParrent.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-xl mx-auto"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-base rounded-xl border-border bg-card"
              />
            </motion.div>
          </div>

          {/* Help Categories */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-5xl mx-auto mb-20"
          >
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              Browse by topic
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {helpCategories.map((category, index) => (
                <Link key={category.title} to={category.href}>
                  <Card className="h-full border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <category.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Popular Articles */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              Popular articles
            </h2>
            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
              {popularArticles.map((article) => (
                <Link
                  key={article.title}
                  to={article.href}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl group"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {article.title}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Contact Support */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-muted/30 border border-border rounded-2xl p-8 lg:p-12">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-4">
                Still need help?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                If you can't find what you're looking for, our support team is here to help. 
                We typically respond within one business day.
              </p>
              <Button size="lg" className="rounded-full px-8">
                Contact Support
              </Button>
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
