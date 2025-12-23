import { motion } from "framer-motion";
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  FileText, 
  DollarSign, 
  BookOpen, 
  Scale, 
  Briefcase,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

const featureSections = [
  {
    id: "calendar",
    icon: Calendar,
    title: "Smart Parenting Calendar",
    description: "Build and manage custody schedules that work for your family. Our intelligent calendar system adapts to your needs.",
    features: [
      "Visual custody schedules with color-coded parent assignments",
      "Pattern-based scheduling (2-2-3, week-on/week-off, custom)",
      "Schedule change requests with approval workflows",
      "Exchange check-ins and confirmations",
      "Holiday schedule overrides and rotating arrangements"
    ],
    gradient: "from-primary to-info",
    link: "/calendar"
  },
  {
    id: "messaging",
    icon: MessageSquare,
    title: "Secure Communication",
    description: "Keep all co-parenting conversations in one documented, professional space. Every message is preserved for your records.",
    features: [
      "Timestamped messaging with delivery confirmation",
      "Read receipts for accountability",
      "Complete communication history",
      "AI tone assistance to maintain constructive dialogue",
      "Court-ready message exports"
    ],
    gradient: "from-warning to-destructive",
    link: "/messages"
  },
  {
    id: "children",
    icon: Users,
    title: "Children Information Hub",
    description: "Centralize all important details about your children. Both parents stay informed with shared, up-to-date information.",
    features: [
      "Medical information and medication tracking",
      "School schedules and contact details",
      "Emergency contacts and procedures",
      "Clothing sizes and recent purchases",
      "Shared access with permission controls"
    ],
    gradient: "from-accent-foreground to-success",
    link: "/children"
  },
  {
    id: "documents",
    icon: FileText,
    title: "Documents & Records",
    description: "Store and organize important documents securely. Track who accessed what and when for complete transparency.",
    features: [
      "Secure document storage with encryption",
      "Access logging and audit trails",
      "Category organization by type",
      "Court-ready PDF exports",
      "Shared access between co-parents"
    ],
    gradient: "from-success to-info",
    link: "/documents"
  },
  {
    id: "expenses",
    icon: DollarSign,
    title: "Expenses & Reimbursements",
    description: "Track shared expenses and manage reimbursements fairly. Keep financial records organized and exportable.",
    features: [
      "Shared expense tracking by category",
      "Reimbursement request workflows",
      "Split percentage calculations",
      "Receipt uploads and attachments",
      "Exportable expense reports"
    ],
    gradient: "from-primary to-accent-foreground",
    link: "/expenses"
  },
  {
    id: "journal",
    icon: BookOpen,
    title: "Journal & Notes",
    description: "Maintain private records of important moments and observations. Link notes to exchanges for context.",
    features: [
      "Private journal entries for personal records",
      "Mood tracking for children",
      "Exchange-linked notes and observations",
      "Tag-based organization",
      "Searchable history"
    ],
    gradient: "from-info to-primary",
    link: "/journal"
  },
  {
    id: "law-library",
    icon: Scale,
    title: "Law Library",
    description: "Access state-specific family law resources. Educational reference materials to help you understand your rights.",
    features: [
      "State-specific legal resources",
      "Custody and visitation guidelines",
      "Educational reference documents",
      "Regularly updated content",
      "Disclaimer: For reference only, not legal advice"
    ],
    gradient: "from-muted-foreground to-primary",
    link: "/law-library"
  },
  {
    id: "professional",
    icon: Briefcase,
    title: "Professional Tools",
    description: "For family law professionals managing multiple cases. Streamlined access to client information and documentation.",
    features: [
      "Multi-family case management",
      "Centralized case dashboards",
      "Bulk document exports",
      "Client communication oversight",
      "Professional reporting tools"
    ],
    gradient: "from-primary to-warning",
    link: "/pricing"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6"
            >
              Everything you need for clear, organized co-parenting
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              From scheduling to communication to court-ready records, CoParrent keeps everything in one calm, secure place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="text-base">
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-24 lg:space-y-32"
          >
            {featureSections.map((section, index) => (
              <motion.div
                key={section.id}
                variants={itemVariants}
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-16 items-center`}
              >
                {/* Content */}
                <div className="flex-1 max-w-xl">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient} mb-6`}
                  >
                    <section.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                    {section.title}
                  </h2>
                  
                  <p className="text-lg text-muted-foreground mb-6">
                    {section.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {section.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button asChild variant="ghost" className="group p-0 h-auto font-medium">
                    <Link to={section.link} className="flex items-center gap-2">
                      Learn more
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                {/* Visual Card */}
                <div className="flex-1 w-full max-w-lg">
                  <div className={`relative rounded-3xl bg-gradient-to-br ${section.gradient} p-[1px]`}>
                    <div className="rounded-3xl bg-card p-8 lg:p-10">
                      <div className="aspect-[4/3] rounded-2xl bg-muted/50 flex items-center justify-center">
                        <section.icon className="w-24 h-24 text-muted-foreground/30" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">
              Ready to simplify your co-parenting?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of families using CoParrent to communicate better, stay organized, and focus on what matters most—their children.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link to="/signup">Start Your Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/about">About CoParrent</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
