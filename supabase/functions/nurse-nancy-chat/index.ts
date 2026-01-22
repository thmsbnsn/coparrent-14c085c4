import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Emergency keywords that require immediate escalation
const EMERGENCY_KEYWORDS = [
  "not breathing", "can't breathe", "difficulty breathing", "blue lips", "blue face",
  "unconscious", "unresponsive", "won't wake", "seizure", "convulsion",
  "severe bleeding", "bleeding heavily", "choking",
  "suicidal", "suicide", "self-harm", "hurt myself", "kill myself",
  "overdose", "poisoning", "swallowed", "drank bleach", "drank cleaning",
  "broken bone", "bone sticking out", "head injury", "fell from height",
  "severe burn", "electric shock", "drowning", "near drowning",
  "allergic reaction", "anaphylaxis", "swelling throat", "can't swallow",
  "chest pain", "heart attack", "stroke"
];

const EMERGENCY_RESPONSE = `🚨 **This sounds like a medical emergency.**

**Please call emergency services immediately:**
- **US/Canada:** 911
- **UK:** 999
- **EU:** 112
- **Australia:** 000

Do not wait. Get professional medical help right now.

I'm here to provide general information, but this situation requires immediate professional attention. While you wait for help:
- Stay calm and stay with the person
- Follow any instructions from the emergency dispatcher
- Do not move the person unless they are in immediate danger

Please seek emergency care now.`;

const NURSE_NANCY_SYSTEM_PROMPT = `You are Nurse Nancy, a sweet, caring, and empathetic AI health assistant for parents in the CoParrent app. Your role is to provide general, educational health information to help parents think through concerns about their children's health.

## Your Personality
- Sweet, warm, and caring like a trusted friend who happens to know a lot about child health
- Calm and reassuring, never alarming unless truly necessary
- Non-judgmental and supportive
- Uses gentle, accessible language

## Important Guidelines

### What You CAN Do:
- Provide general educational health information
- Ask 1-3 brief clarifying questions when helpful (age, duration, severity, other symptoms, hydration, fever, etc.)
- Offer safe, general home-care comfort tips (rest, fluids, cool compresses, etc.)
- Help parents think through when to contact a healthcare provider
- Encourage parents to trust their instincts
- Suggest questions parents might want to ask their doctor

### What You CANNOT Do:
- Provide medical diagnoses ("This sounds like strep throat")
- Prescribe medications or dosages ("Give them 5ml of ibuprofen")
- Provide specific treatment plans
- Replace professional medical advice
- Provide legal advice

### Response Format:
- Keep responses concise (2-4 short paragraphs)
- Use bullet points for lists when helpful
- Be direct but warm
- Always remind parents to consult a healthcare provider for specific medical advice when appropriate

### When to Recommend Seeing a Doctor:
Encourage contacting a healthcare provider when:
- Symptoms persist beyond a few days
- The parent seems uncertain or worried
- Symptoms are severe or worsening
- The child is very young (under 6 months especially)
- There are concerning symptoms (high fever, rash, difficulty breathing, etc.)

### Key Phrases to Use:
- "Every child is different, so it's always okay to check with your pediatrician."
- "Trust your instincts - you know your child best."
- "While I can share general information, your doctor can give you personalized advice."
- "This is general guidance - always consult a healthcare provider for your specific situation."

Remember: You are providing educational support, not medical care. When in doubt, always encourage parents to seek professional medical advice.`;

interface ChatRequest {
  threadId: string;
  message: string;
  messageHistory?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription status (premium feature - Kids Hub requires Power plan)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, subscription_status, subscription_tier, free_premium_access, trial_ends_at")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hasAccess = 
      profile.subscription_status === "active" ||
      profile.free_premium_access === true ||
      (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Power plan required", code: "PREMIUM_REQUIRED" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const body: ChatRequest = await req.json();
    const { threadId, message, messageHistory = [] } = body;

    if (!threadId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing threadId or message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify thread ownership
    const { data: thread, error: threadError } = await supabase
      .from("nurse_nancy_threads")
      .select("id")
      .eq("id", threadId)
      .eq("user_id", user.id)
      .single();

    if (threadError || !thread) {
      return new Response(
        JSON.stringify({ error: "Thread not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for emergency keywords
    const lowerMessage = message.toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some(keyword => lowerMessage.includes(keyword));

    if (isEmergency) {
      console.log(`[NURSE-NANCY] Emergency detected for user=${user.id}`);
      
      // Store user message
      await supabase.from("nurse_nancy_messages").insert({
        thread_id: threadId,
        role: "user",
        content: message
      });

      // Store emergency response
      await supabase.from("nurse_nancy_messages").insert({
        thread_id: threadId,
        role: "assistant",
        content: EMERGENCY_RESPONSE
      });

      return new Response(
        JSON.stringify({ 
          response: EMERGENCY_RESPONSE,
          isEmergency: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build conversation for AI
    const conversationMessages = [
      { role: "system", content: NURSE_NANCY_SYSTEM_PROMPT },
      ...messageHistory.slice(-10).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      })),
      { role: "user", content: message }
    ];

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("AI service is not configured");
    }

    console.log(`[NURSE-NANCY] Chat request for user=${user.id}, thread=${threadId}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Please wait a moment before sending another message.", code: "RATE_LIMIT" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error(`[NURSE-NANCY] AI error: ${response.status} - ${errorText}`);
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Store user message and AI response
    await supabase.from("nurse_nancy_messages").insert({
      thread_id: threadId,
      role: "user",
      content: message
    });

    await supabase.from("nurse_nancy_messages").insert({
      thread_id: threadId,
      role: "assistant",
      content: aiResponse
    });

    // Update thread timestamp
    await supabase
      .from("nurse_nancy_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", threadId);

    console.log(`[NURSE-NANCY] Response sent for user=${user.id}, thread=${threadId}`);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[NURSE-NANCY] Error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
