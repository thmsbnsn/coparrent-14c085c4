import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ActivityType = "activity" | "recipe" | "craft";

interface ActivityResult {
  title: string;
  description?: string;
  ageRange?: string;
  duration?: string;
  materials?: string[] | Array<{ item: string; quantity?: string; substitute?: string }>;
  steps?: string[] | Array<{ step: number; instruction: string; tip?: string }>;
  learningAreas?: string[];
  safetyNotes?: string[];
  variations?: string[];
  // Recipe specific
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  ingredients?: Array<{ item: string; amount: string }>;
  instructions?: string[];
  kidTasks?: string[];
  adultTasks?: string[];
  nutritionNotes?: string;
  tips?: string[];
  // Craft specific
  skillsLearned?: string[];
  messLevel?: string;
  displayIdeas?: string[];
  // Fallback
  content?: string;
}

interface GenerateOptions {
  type: ActivityType;
  childAge?: number;
  childName?: string;
  duration?: string;
  location?: "indoor" | "outdoor" | "both";
  materials?: string[];
  dietary?: string[];
}

interface UseActivityGeneratorReturn {
  generate: (options: GenerateOptions) => Promise<ActivityResult | null>;
  loading: boolean;
  error: string | null;
  lastResult: ActivityResult | null;
}

/**
 * Hook to generate kid activities, recipes, and crafts using AI.
 */
export const useActivityGenerator = (): UseActivityGeneratorReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ActivityResult | null>(null);
  const { toast } = useToast();

  const generate = async (options: GenerateOptions): Promise<ActivityResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("kid-activity-generator", {
        body: options,
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        if (data.code === "PREMIUM_REQUIRED") {
          setError("Premium subscription required");
          toast({
            title: "Premium Feature",
            description: "Upgrade to premium to access AI-powered activities.",
            variant: "destructive",
          });
          return null;
        }
        if (data.code === "RATE_LIMIT") {
          setError("Rate limit exceeded. Please try again later.");
          toast({
            title: "Too Many Requests",
            description: "Please wait a moment before generating another activity.",
            variant: "destructive",
          });
          return null;
        }
        throw new Error(data.error);
      }

      const result = data.result as ActivityResult;
      setLastResult(result);
      return result;
    } catch (err) {
      const userMessage = "Unable to generate activity. Please try again.";
      setError(userMessage);
      toast({
        title: "Generation Failed",
        description: userMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generate,
    loading,
    error,
    lastResult,
  };
};