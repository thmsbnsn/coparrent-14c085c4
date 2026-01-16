import { motion } from "framer-motion";
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  FileText, 
  DollarSign, 
  BookOpen, 
  Scale, 
  Trophy,
  CheckCircle,
  ArrowRight,
  FlaskConical,
  Sparkles,
  Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Feature screenshots
import calendarFeature from "@/assets/features/calendar-feature.png";
import messagingFeature from "@/assets/features/messaging-feature.png";
import childrenFeature from "@/assets/features/children-feature.png";
import documentsFeature from "@/assets/features/documents-feature.png";
import expensesFeature from "@/assets/features/expenses-feature.png";
import journalFeature from "@/assets/features/journal-feature.png";
import lawLibraryFeature from "@/assets/features/law-library-feature.png";
import professionalFeature from "@/assets/features/professional-feature.png";

type FeatureTier = "free" | "premium" | "beta";

interface FeatureSection {
  id: string;
  icon: typeof Calendar;
  title: string;
  description: string;
  features: Array<{
    text: string;
    tier?: FeatureTier;
    beta?: boolean;
  }>;
  gradient: string;
  link: string;
  image: string;
  tier: FeatureTier;
  status?: "stable" | "beta" | "new";
}

const featureSections: FeatureSection[] = [
  {
    id: "calendar",
    icon: Calendar,
    title: "Smart Parenting Calendar",
    description: "Build and manage custody schedules that work for your family. Our intelligent calendar system adapts to your needs.",
    features: [
      { text: "Visual custody schedules with color-coded parent assignments" },
      { text: "Pattern-based scheduling (2-2-3, week-on/week-off, custom)" },
      { text: "Schedule change requests with approval workflows" },
      { text: "Exchange check-ins and confirmations" },
      { text: "Holiday schedule overrides", tier: "premium" },
      { text: "AI schedule suggestions", tier: "premium", beta: true },
    ],
    gradient: "from-primary to-info",
    link: "/calendar",
    image: calendarFeature,
    tier: "free",
    status: "stable"
  },
  {
    id: "messaging",
    icon: MessageSquare,
    title: "Secure Communication",
    description: "Keep all co-parenting conversations in one documented, professional space. Every message is preserved for your records.",
    features: [
      { text: "Timestamped messaging with delivery confirmation" },
      { text: "Read receipts for accountability" },
      { text: "Complete communication history" },
      { text: "AI tone assistance for constructive dialogue", tier: "premium", beta: true },
      { text: "Court-ready message exports", tier: "premium" },
    ],
    gradient: "from-warning to-destructive",
    link: "/messages",
    image: messagingFeature,
    tier: "free",
    status: "stable"
  },
  {
    id: "children",
    icon: Users,
    title: "Children Information Hub",
    description: "Centralize all important details about your children. Both parents stay informed with shared, up-to-date information.",
    features: [
      { text: "Medical information and medication tracking" },
      { text: "School schedules and contact details" },
      { text: "Emergency contacts and procedures" },
      { text: "Shared access with permission controls" },
      { text: "Unlimited child profiles", tier: "premium" },
    ],
    gradient: "from-accent-foreground to-success",
    link: "/children",
    image: childrenFeature,
    tier: "free",
    status: "stable"
  },
  {
    id: "documents",
    icon: FileText,
    title: "Documents & Court-Ready Exports",
    description: "Store and organize important documents securely. Generate comprehensive exports for legal proceedings.",
    features: [
      { text: "Secure document storage with encryption" },
      { text: "Access logging and audit trails", tier: "premium" },
      { text: "Category organization by type" },
      { text: "Court-ready PDF exports with all records", tier: "premium" },
      { text: "Shared access between co-parents" },
    ],
    gradient: "from-success to-info",
    link: "/documents",
    image: documentsFeature,
    tier: "free",
    status: "stable"
  },
  {
    id: "expenses",
    icon: DollarSign,
    title: "Expenses & Reimbursements",
    description: "Track shared expenses and manage reimbursements fairly. Keep financial records organized and exportable.",
    features: [
      { text: "Shared expense tracking by category" },
      { text: "Reimbursement request workflows" },
      { text: "Split percentage calculations" },
      { text: "Receipt uploads and attachments" },
      { text: "Exportable expense reports", tier: "premium" },
    ],
    gradient: "from-primary to-accent-foreground",
    link: "/expenses",
    image: expensesFeature,
    tier: "free",
    status: "stable"
  },
  {
    id: "sports",
    icon: Trophy,
    title: "Sports & Activities Hub",
    description: "Coordinate your children's activities and events. Keep both parents informed about practices, games, and equipment.",
    features: [
      { text: "Activity and event management" },
      { text: "Coach contact information" },
      { text: "Equipment checklists" },
      { text: "Event reminders", beta: true },
      { text: "Pickup/dropoff coordination" },
    ],
    gradient: "from-info to-primary",
    link: "/sports",
    image: professionalFeature,
    tier: "premium",
    status: "beta"
  },
  {
    id: "journal",
    icon: BookOpen,
    title: "Journal & Notes",
    description: "Maintain private records of important moments and observations. Link notes to exchanges for context.",
    features: [
      { text: "Private journal entries for personal records" },
      { text: "Mood tracking for children" },
      { text: "Exchange-linked notes and observations" },
      { text: "Tag-based organization" },
      { text: "Searchable history" },
    ],
    gradient: "from-info to-primary",
    link: "/journal",
    image: journalFeature,
    tier: "free",
    status: "stable"
  },
  {
    id: "law-library",
    icon: Scale,
    title: "Law Library",
    description: "Access state-specific family law resources. Educational reference materials to help you understand your rights.",
    features: [
      { text: "State-specific legal resources" },
      { text: "Custody and visitation guidelines" },
      { text: "Educational reference documents" },
      { text: "Regularly updated content" },
      { text: "Disclaimer: For reference only, not legal advice" },
    ],
    gradient: "from-muted-foreground to-primary",
    link: "/law-library",
    image: lawLibraryFeature,
    tier: "free",
    status: "stable"
  },
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

const TierBadge = ({ tier, status }: { tier: FeatureTier; status?: string }) => {
  if (status === "beta") {
    return (
      <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
        <FlaskConical className="w-3 h-3 mr-1" />
        Beta
      </Badge>
    );
  }
  
  if (tier === "premium") {
    return (
      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
        <Crown className="w-3 h-3 mr-1" />
        Premium
      </Badge>
    );
  }
  
  if (status === "new") {
    return (
      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
        <Sparkles className="w-3 h-3 mr-1" />
        New
      </Badge>
    );
  }
  
  return null;
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
            
            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
                Paid feature
              </span>
              <span className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                  <FlaskConical className="w-3 h-3 mr-1" />
                  Beta
                </Badge>
                Under development
              </span>
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
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient}`}
                    >
                      <section.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <TierBadge tier={section.tier} status={section.status} />
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
                        <span className="text-foreground/80 flex items-center gap-2 flex-wrap">
                          {feature.text}
                          {feature.tier === "premium" && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                              Premium
                            </Badge>
                          )}
                          {feature.beta && (
                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                              Beta
                            </Badge>
                          )}
                        </span>
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

                {/* Visual Card with Screenshot */}
                <div className="flex-1 w-full max-w-lg">
                  <div className={`relative rounded-3xl bg-gradient-to-br ${section.gradient} p-[1px]`}>
                    <div className="rounded-3xl bg-card p-4 lg:p-6">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted/50">
                        <img 
                          src={section.image} 
                          alt={`${section.title} screenshot`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
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
              Start free and upgrade when you're ready. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
