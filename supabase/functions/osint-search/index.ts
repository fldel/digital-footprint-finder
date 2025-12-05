import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, searchId, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Starting OSINT search for query: ${query}`);

    // Use AI to generate realistic mock OSINT data based on the query
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an OSINT (Open Source Intelligence) analysis engine. Given a name or username, generate realistic but FICTIONAL public profile data that might be found through legitimate open-source intelligence gathering. 

Generate 4-8 fictional profile results with varied platforms. Include:
- Social media profiles (Twitter/X, LinkedIn, Instagram, GitHub, etc.)
- Professional information
- Public mentions
- Username variations

IMPORTANT: All data must be FICTIONAL and for demonstration purposes only. Never return real people's data.

Return a JSON array of objects with this structure:
{
  "results": [
    {
      "result_type": "social_media" | "professional" | "mention" | "username_match",
      "platform": "platform name",
      "profile_url": "fictional url",
      "username": "fictional username",
      "display_name": "fictional display name",
      "bio": "fictional bio text",
      "location": "fictional location",
      "followers_count": number,
      "posts_count": number,
      "confidence_score": 0.0-1.0,
      "metadata": { any additional relevant info }
    }
  ],
  "summary": {
    "total_found": number,
    "exposure_level": "low" | "medium" | "high",
    "platforms_found": ["list of platforms"],
    "key_insights": ["list of 3-5 insights about digital footprint"]
  }
}`,
          },
          {
            role: "user",
            content: `Perform OSINT analysis for: "${query}"
            
Generate realistic fictional results for this search query. Consider:
1. Common username patterns based on the name
2. Likely platform presence
3. Professional vs personal profiles
4. Digital footprint exposure level`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    let parsedResults;
    try {
      parsedResults = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse search results");
    }

    console.log(`Search completed. Found ${parsedResults.results?.length || 0} results`);

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedResults,
        searchId,
        query,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OSINT search error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Search failed",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
