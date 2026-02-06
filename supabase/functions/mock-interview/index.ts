import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, domain, conversation } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "generate_questions") {
      systemPrompt = `You are a senior technical interviewer. Generate exactly 5 professional interview questions for the domain: "${domain}". 
Return ONLY a JSON array of objects with "id" (number 1-5), "question" (string), and "category" (string - e.g. "Technical", "Behavioral", "Situational", "Problem Solving"). 
Questions should range from introductory to advanced. No markdown, no explanation, just the JSON array.`;
      userPrompt = `Generate 5 interview questions for: ${domain}`;
    } else if (action === "evaluate_answer") {
      const { questionIndex, question, answer, allQA } = conversation;
      systemPrompt = `You are a professional interview evaluator. Assess the candidate's answer to an interview question.

Evaluate based on:
1. **Content Quality** (0-10): Accuracy, depth, relevance
2. **Communication** (0-10): Clarity, structure, confidence conveyed through writing
3. **Professionalism** (0-10): Appropriate tone, vocabulary, demeanor

Return ONLY a JSON object with:
{
  "contentScore": number,
  "communicationScore": number,  
  "professionalismScore": number,
  "overallScore": number (average of above),
  "feedback": "brief 2-3 sentence feedback",
  "improvement": "one specific actionable tip"
}
No markdown, no explanation.`;
      userPrompt = `Question: "${question}"\n\nCandidate's Answer: "${answer}"`;
    } else if (action === "final_review") {
      const { domain: interviewDomain, questionsAndAnswers } = conversation;
      const qaText = questionsAndAnswers
        .map(
          (qa: any, i: number) =>
            `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}\nScore: ${qa.score}/10`
        )
        .join("\n\n");

      systemPrompt = `You are a senior career advisor reviewing a complete mock interview for the "${interviewDomain}" domain.

Provide a comprehensive final review. Return ONLY a JSON object:
{
  "overallScore": number (0-100),
  "grade": "A+/A/B+/B/C+/C/D/F",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "detailedFeedback": "3-4 paragraph comprehensive review covering attitude, knowledge depth, communication style, and readiness",
  "actionPlan": ["specific action 1", "specific action 2", "specific action 3", "specific action 4"],
  "readinessLevel": "Not Ready / Needs Improvement / Almost Ready / Interview Ready / Excellent"
}
No markdown wrapping.`;
      userPrompt = `Interview domain: ${interviewDomain}\n\nFull interview:\n${qaText}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse the JSON from the AI response
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mock-interview error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
