import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuggestionRequest {
  childrenInfo: { count: number; ages: number[] };
  isHighConflict: boolean;
  preferences: string;
  state: string;
}

interface PatternSuggestion {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  visual: string[];
  holidayTips: string;
  exchangeTips: string;
  startingParent: "A" | "B";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childrenInfo, isHighConflict, preferences, state }: SuggestionRequest = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    console.log('AI Schedule Suggest called with:', { childrenInfo, isHighConflict, preferences, state });

    const systemPrompt = `You are an expert family law consultant and child psychologist specializing in custody arrangements. 
You help co-parents find the best custody schedule for their specific situation.
You MUST respond with valid JSON only - no markdown, no explanation text outside the JSON.
Your suggestions should be practical, child-focused, and consider developmental needs based on children's ages.`;

    const userPrompt = `Based on the following information, suggest 2-3 custody schedule patterns:

**Children:** ${childrenInfo.count} child(ren), ages: ${childrenInfo.ages.length > 0 ? childrenInfo.ages.join(', ') : 'not specified'}
**Conflict Level:** ${isHighConflict ? 'High-conflict situation - minimize direct exchanges and communication friction' : 'Standard co-parenting relationship'}
**State:** ${state || 'Not specified'}
**Parent Preferences:** ${preferences || 'No specific preferences mentioned'}

Respond with a JSON object containing a "suggestions" array with 2-3 pattern objects. Each pattern must have:
- "id": a unique kebab-case identifier (e.g., "alternating-weeks", "2-2-3", "5-2-2-5")
- "name": human-readable name
- "description": 1-2 sentence explanation of how it works
- "pros": array of 2-3 benefits for this specific situation
- "cons": array of 1-2 potential drawbacks to consider
- "visual": array of exactly 14 characters, each being "A" or "B" representing a 2-week pattern
- "holidayTips": specific advice for handling holidays with this pattern
- "exchangeTips": recommendation for exchange timing and location
- "startingParent": "A" or "B" - which parent should start

Consider the children's ages when making recommendations:
- Infants/toddlers (0-3): shorter periods away from primary caregiver
- Preschool (3-5): can handle longer periods but need consistency
- School-age (6-12): can adapt to various patterns, school schedule matters
- Teenagers (13+): more flexible, may want input on schedule

For high-conflict situations, prefer patterns that:
- Minimize exchanges
- Use neutral exchange locations (school, etc.)
- Reduce direct parent-to-parent contact

Respond ONLY with the JSON object, no other text.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://coparrent.app',
        'X-Title': 'CoParrent Schedule Wizard',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let suggestions: PatternSuggestion[];
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();
      
      const parsed = JSON.parse(jsonStr);
      suggestions = parsed.suggestions || parsed;
      
      // Validate the structure
      if (!Array.isArray(suggestions)) {
        throw new Error('Suggestions is not an array');
      }
      
      // Ensure each suggestion has required fields
      suggestions = suggestions.map((s: any) => ({
        id: s.id || 'custom-' + Math.random().toString(36).substr(2, 9),
        name: s.name || 'Custom Pattern',
        description: s.description || '',
        pros: Array.isArray(s.pros) ? s.pros : [],
        cons: Array.isArray(s.cons) ? s.cons : [],
        visual: Array.isArray(s.visual) && s.visual.length === 14 ? s.visual : 
          ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
        holidayTips: s.holidayTips || '',
        exchangeTips: s.exchangeTips || '',
        startingParent: s.startingParent === 'B' ? 'B' : 'A',
      }));
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Content:', content);
      throw new Error('Failed to parse AI suggestions');
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in ai-schedule-suggest function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
