import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MessageSquare, Users, FileText, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Features Section - System Overview
 * 
 * Design Intent:
 * - Group by user intent, not engineering category
 * - Make it obvious this is a cohesive system
 * - Clear visual rhythm and intentional spacing
 * - Purpose-built feel, not borrowed components
 */

const coreCapabilities = [
  {
    icon: Calendar,
    title: "Scheduling",
    description: "Visual custody calendars with pattern-based scheduling, exchange tracking, and change request workflows.",
    color: "hsl(222 60% 50%)",
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description: "Timestamped messaging with read receipts, tone assistance, and complete conversation history for records.",
    color: "hsl(199 89% 48%)",
  },
  {
    icon: Users,
    title: "Child Records",
    description: "Centralized medical info, school details, and emergency contacts—shared and always up to date.",
    color: "hsl(152 60% 38%)",
  },
  {
    icon: FileText,
    title: "Documentation",
    description: "Secure document storage with audit trails and court-ready PDF exports of all records.",
    color: "hsl(174 50% 42%)",
  },
  {
    icon: DollarSign,
    title: "Expenses",
    description: "Shared expense tracking with reimbursement workflows, receipt uploads, and exportable reports.",
    color: "hsl(38 92% 50%)",
  },
];

export const Features = () => {
  return (
    <section className="py-20 lg:py-28 bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Direct, Authoritative */}
        <div className="max-w-2xl mx-auto text-center mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary uppercase tracking-widest mb-4"
          >
            The Platform
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-5"
          >
            Everything in one place
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            A complete system for coordinating custody—schedules, messages, 
            expenses, and records—designed to reduce conflict and create clarity.
          </motion.p>
        </div>

        {/* Capabilities Grid - Structured, Cohesive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-12">
          {coreCapabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group relative p-6 lg:p-7 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon with color accent */}
              <div 
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg mb-5"
                style={{ backgroundColor: `${capability.color}15` }}
              >
                <capability.icon 
                  className="w-5 h-5" 
                  style={{ color: capability.color }}
                />
              </div>

              {/* Content */}
              <h3 className="text-lg font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                {capability.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {capability.description}
              </p>

              {/* Subtle hover indicator */}
              <div 
                className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: capability.color }}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA - Clear Next Step */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild variant="outline" size="lg" className="group">
            <Link to="/features" className="flex items-center gap-2">
              Explore All Features
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
