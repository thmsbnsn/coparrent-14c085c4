import { motion } from "framer-motion";
import { Palette, Scissors, Gamepad2, ChefHat, Sparkles, Lock } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  comingSoon?: boolean;
  premiumRequired?: boolean;
  onClick?: () => void;
}

const ToolCard = ({ title, description, icon: Icon, comingSoon, premiumRequired, onClick }: ToolCardProps) => (
  <motion.div
    whileHover={{ scale: comingSoon ? 1 : 1.02 }}
    whileTap={{ scale: comingSoon ? 1 : 0.98 }}
  >
    <Card className={`h-full transition-all ${comingSoon ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex gap-1.5">
            {comingSoon && (
              <Badge variant="secondary" className="text-xs">
                Coming Soon
              </Badge>
            )}
            {premiumRequired && (
              <Badge variant="outline" className="text-xs gap-1">
                <Sparkles className="w-3 h-3" />
                Premium
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg mt-3">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant={comingSoon ? "outline" : "default"}
          className="w-full"
          disabled={comingSoon}
          onClick={onClick}
        >
          {comingSoon ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Coming Soon
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Launch Tool
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const KidCenterPage = () => {
  const { hasAccess } = usePremiumAccess();

  const tools = [
    {
      title: "AI Coloring Pages",
      description: "Generate custom coloring pages featuring your child's favorite characters, animals, or themes. Perfect for quiet time activities.",
      icon: Palette,
      comingSoon: true,
      premiumRequired: true,
    },
    {
      title: "Arts & Crafts Generator",
      description: "Get creative project ideas with step-by-step instructions and supply lists based on materials you have at home.",
      icon: Scissors,
      comingSoon: true,
      premiumRequired: true,
    },
    {
      title: "Activity Generator",
      description: "AI-powered suggestions for indoor and outdoor activities based on your child's age, interests, and available time.",
      icon: Gamepad2,
      comingSoon: true,
      premiumRequired: true,
    },
    {
      title: "Kitchen Assistant",
      description: "Kid-friendly recipes with ingredient lists, step-by-step instructions, and age-appropriate cooking tasks.",
      icon: ChefHat,
      comingSoon: true,
      premiumRequired: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold">Kid Center</h1>
              <p className="text-muted-foreground mt-1">
                AI-powered tools to keep your kids entertained and learning
              </p>
            </div>
          </div>
        </motion.div>

        {/* Premium notice */}
        {!hasAccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Premium Features Coming Soon
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Kid Center tools will be available to premium subscribers. Stay tuned!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tool Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <ToolCard {...tool} />
            </motion.div>
          ))}
        </motion.div>

        {/* Info section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 rounded-xl bg-muted/50 border"
        >
          <h3 className="font-semibold mb-2">About Kid Center</h3>
          <p className="text-sm text-muted-foreground">
            Kid Center is designed to provide parents with AI-powered tools to create engaging activities 
            for their children. From coloring pages to recipes, these tools help you spend quality time 
            with your kids while fostering creativity and learning. All content is generated with 
            age-appropriate considerations in mind.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default KidCenterPage;
