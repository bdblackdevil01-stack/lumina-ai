import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS: Record<string, string> = {
  summary: `You are a study assistant. Summarize the following notes into clear, concise key points. Return ONLY the summary text, no JSON wrapping.`,
  quiz: `You are a study assistant. Create 5 multiple-choice quiz questions from the following notes. Return a JSON array where each element has: "question" (string), "options" (array of 4 strings), "answer" (number 0-3 indicating correct option index), "explanation" (string). Return ONLY the JSON array, no markdown or wrapping.`,
  flashcards: `You are a study assistant. Create 8 flashcards from the following notes. Return a JSON array where each element has: "question" (string) and "answer" (string). Return ONLY the JSON array, no markdown or wrapping.`,
  mindmap: `You are a study assistant. Create a mind map structure from the following notes. Return a JSON object with: "id" (string), "label" (string for the main topic), "children" (array of objects, each with "id", "label", and optionally "children"). Keep it 2-3 levels deep with 3-5 branches. Return ONLY the JSON object, no markdown or wrapping.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notes, type, userId } = await req.json();

    if (!notes || !notes.trim()) {
      return new Response(
        JSON.stringify({ error: "Please provide some notes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!type || !PROMPTS[type]) {
      return new Response(
        JSON.stringify({ error: "Invalid output type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's OpenAI key from database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: keyData, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("openai_key")
      .eq("user_id", userId)
      .maybeSingle();

    if (keyError || !keyData?.openai_key) {
      return new Response(
        JSON.stringify({ error: "Please add your OpenAI API key in Settings" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = PROMPTS[type];

    const openaiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keyData.openai_key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": Deno.env.get("SUPABASE_URL") ?? "http://localhost:3000",
        "X-Title": "Lumina AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: notes },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openaiResponse.ok) {
      const errBody = await openaiResponse.text();
      console.error("OpenAI error:", openaiResponse.status, errBody);

      if (openaiResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid API key. Please check your OpenRouter key in Settings." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (openaiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "OpenAI rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate content. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await openaiResponse.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: any;
    if (type === "summary") {
      result = content;
    } else {
      // Parse JSON output, handling possible markdown code blocks
      let jsonStr = content;
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      try {
        result = JSON.parse(jsonStr);
      } catch (e) {
        console.error("JSON parse error:", e, "Content:", content);
        return new Response(
          JSON.stringify({ error: "Failed to parse AI response. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Edge function error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
