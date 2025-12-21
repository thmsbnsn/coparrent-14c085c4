import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, MessageSquare, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroIllustration from "@/assets/hero-illustration.png";

const features = [
  { icon: Calendar, label: "Smart Scheduling" },
  { icon: MessageSquare, label: "Court-Ready Messaging" },
  { icon: Users, label: "Child Info Hub" },
  { icon: Shield, label: "Secure & Private" },
];

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Full-width Background Image with Gradient Overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroIllustration}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Navy-to-Sage Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsla(222, 47%, 20%, 0.55) 0%, hsla(200, 60%, 30%, 0.45) 50%, hsla(150, 45%, 45%, 0.4) 100%)'
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-foreground text-sm font-medium mb-8 shadow-md"
            >
              <span className="w-2 h-2 rounded-full bg-gradient-accent animate-pulse" />
              Trusted by 10,000+ co-parents
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight mb-6 text-white drop-shadow-lg"
            >
              Co-parenting made{" "}
              <span className="text-[hsl(174,60%,70%)]">clear & simple</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 mb-10 drop-shadow-sm"
            >
              The modern custody toolkit that helps parents stay organized, communicate clearly, 
              and keep their children's well-being at the center of every decision.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10"
            >
              <Button 
                size="lg" 
                onClick={() => navigate("/signup")} 
                className="text-base px-8 h-12 bg-white text-primary hover:bg-white/90 shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/signup?type=lawoffice")}
                className="text-base px-8 h-12 border-white/60 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                For Law Offices
              </Button>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Side - Floating Illustration Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ 
                y: [0, -12, 0],
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Card className="relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl p-3 max-w-md lg:max-w-lg">
                <img
                  src={heroIllustration}
                  alt="CoParrent calendar dashboard with scheduling, notifications, and family coordination features"
                  className="w-full h-auto rounded-2xl"
                />
                {/* Glassmorphism shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-3xl" />
              </Card>
            </motion.div>

            {/* Floating decorative elements */}
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute -top-4 -left-4 lg:left-0 p-3 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg"
            >
              <Calendar className="w-6 h-6 text-primary" />
            </motion.div>

            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 4.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-2 -right-2 lg:right-4 p-3 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg"
            >
              <MessageSquare className="w-6 h-6 text-[hsl(150,45%,45%)]" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
