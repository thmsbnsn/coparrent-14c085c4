import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Patterns that might indicate hostile or inflammatory language
const hostilePatterns = [
  { pattern: /\b(you always|you never)\b/gi, suggestion: "Consider rephrasing to focus on specific situations rather than generalizations" },
  { pattern: /\b(your fault|blame you)\b/gi, suggestion: "Try using 'I feel' statements instead of assigning blame" },
  { pattern: /\b(stupid|idiot|incompetent|terrible)\b/gi, suggestion: "Remove personal attacks and focus on the issue at hand" },
  { pattern: /\b(demand|insist|must|have to)\b/gi, suggestion: "Consider using 'request' or 'would appreciate' for a more collaborative tone" },
  { pattern: /!{2,}/g, suggestion: "Multiple exclamation marks can seem aggressive - one is sufficient" },
  { pattern: /\b(can't believe|ridiculous|unacceptable)\b/gi, suggestion: "Express concerns calmly without inflammatory language" },
  { pattern: /\b(never see|take away|my lawyer)\b/gi, suggestion: "Avoid threatening language - focus on finding solutions" },
];

// Check for tone issues using regex patterns
function analyzeTone(message: string): { hasIssues: boolean; flags: string[] } {
  const flags: string[] = [];
  
  for (const { pattern, suggestion } of hostilePatterns) {
    if (pattern.test(message)) {
      flags.push(suggestion);
    }
  }
  
  // Check for ALL CAPS (more than 3 consecutive words)
  if (/\b[A-Z]{3,}\s+[A-Z]{3,}\s+[A-Z]{3,}\b/.test(message)) {
    flags.push("Avoid using all capital letters - it can be perceived as shouting");
  }
  
  return { hasIssues: flags.length > 0, flags: [...new Set(flags)] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[AI-MESSAGE-ASSIST] No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[AI-MESSAGE-ASSIST] Invalid authentication:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[AI-MESSAGE-ASSIST] Authenticated user: ${user.id}`);

    const { message, action } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    // Quick tone check without AI
    if (action === "quick-check") {
      const analysis = analyzeTone(message);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AI-powered rephrase or draft assistance
    let systemPrompt = "";
    let userPrompt = "";

    if (action === "rephrase") {
      systemPrompt = `You are a co-parenting communication expert. Your role is to help parents communicate in a calm, professional, and child-focused manner suitable for court documentation.

Guidelines:
- Remove emotional language and personal attacks
- Focus on facts and the children's wellbeing
- Use respectful, business-like tone
- Keep requests clear and actionable
- Maintain the original intent while improving delivery
- Be concise but thorough

Respond with ONLY the rephrased message, no explanations.`;
      userPrompt = `Rephrase this message to be more professional and court-appropriate:\n\n"${message}"`;
    } else if (action === "draft") {
      systemPrompt = `You are a co-parenting communication expert. Help parents draft professional, child-focused messages. Your suggestions should:
- Be calm and respectful
- Focus on the children's needs
- Be clear and specific about requests or information
- Avoid blame or emotional language
- Be suitable for court documentation

Provide 2-3 alternative message drafts based on the user's intent.`;
      userPrompt = `Help me draft a message about: ${message}`;
    } else if (action === "analyze") {
      systemPrompt = `You are a co-parenting communication expert. Analyze the message for tone and provide specific, actionable feedback.

Provide your response as JSON with this structure:
{
  "overallTone": "positive" | "neutral" | "concerning",
  "toneScore": 1-10 (10 being most professional),
  "suggestions": ["specific suggestion 1", "specific suggestion 2"],
  "positiveAspects": ["what the message does well"],
  "childFocused": true | false,
  "courtAppropriate": true | false
}`;
      userPrompt = `Analyze this co-parenting message:\n\n"${message}"`;
    }

    console.log(`[AI-MESSAGE-ASSIST] Action: ${action}, User: ${user.id}`);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://coparrent.app",
        "X-Title": "CoParrent Message Assistant",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI-MESSAGE-ASSIST] OpenRouter error:", errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse JSON response for analyze action
    let result;
    if (action === "analyze") {
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: aiResponse };
      } catch {
        result = { raw: aiResponse };
      }
    } else {
      result = { content: aiResponse };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[AI-MESSAGE-ASSIST] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process request";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
