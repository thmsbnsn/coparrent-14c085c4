import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, MessageSquare, Users, Shield, LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import heroIllustration from "@/assets/hero-illustration.png";

const features = [
  { icon: Calendar, label: "Smart Scheduling" },
  { icon: MessageSquare, label: "Court-Ready Messaging" },
  { icon: Users, label: "Child Info Hub" },
  { icon: Shield, label: "Secure & Private" },
];

export const Hero = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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
        {/* Subtle animated radial glow */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse 80% 60% at 50% 40%, hsla(200, 80%, 50%, 0.08) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 55% 45%, hsla(200, 80%, 50%, 0.12) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 50% 40%, hsla(200, 80%, 50%, 0.08) 0%, transparent 70%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 lg:mb-8"
            >
              <Badge 
                variant="secondary" 
                className="px-4 py-2 bg-[#21B0FE]/80 backdrop-blur-sm text-white border border-white/20 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-[#21B0FE] animate-pulse mr-2" />
                Join families finding clearer co-parenting
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight mb-4 lg:mb-6 text-foreground drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]"
            >
              Co-parenting made{" "}
              <span className="text-[#21B0FE]">clear & simple</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-foreground/80 max-w-xl mx-auto lg:mx-0 mb-6 lg:mb-10"
            >
              The modern custody toolkit that helps parents stay organized, communicate clearly, 
              and keep their children's well-being at the center of every decision.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6 lg:mb-10"
            >
              {!loading && user ? (
                // User is logged in - show dashboard button prominently
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/dashboard")} 
                    className="w-full sm:w-auto text-base px-8 h-12 bg-white text-primary hover:bg-white/90 shadow-lg"
                  >
                    <LayoutDashboard className="mr-2 w-4 h-4" />
                    Go to Dashboard
                  </Button>
                  <p className="text-sm text-white/80">
                    You're signed in — pick up where you left off
                  </p>
                </>
              ) : (
                // User is not logged in - show signup and signin
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/signup")} 
                    className="w-full sm:w-auto text-base px-8 h-12 bg-white text-primary hover:bg-white/90 shadow-lg"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="w-full sm:w-auto text-base px-8 h-12 border-white/60 text-white hover:bg-white/10 backdrop-blur-sm"
                  >
                    <LogIn className="mr-2 w-4 h-4" />
                    Sign In
                  </Button>
                </>
              )}
            </motion.div>


            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm shadow-md"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-primary">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Side - Floating Illustration Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative flex justify-center lg:justify-end mt-4 lg:mt-0"
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
              <Card className="relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl p-3 max-w-sm sm:max-w-md lg:max-w-lg">
                <img
                  src={heroIllustration}
                  alt="CoParrent calendar dashboard with scheduling, notifications, and family coordination features"
                  className="w-full h-auto rounded-2xl"
                />
                {/* Glassmorphism shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-3xl" />
              </Card>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};
