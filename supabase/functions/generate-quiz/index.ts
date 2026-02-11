import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company, topics, questionCount, difficulty } = await req.json();

    const topicList = topics.join(', ');
    const prompt = `You are an expert placement exam question designer. Generate exactly ${questionCount} multiple-choice questions for a placement test.

Company: ${company}
Topics: ${topicList}
Difficulty: ${difficulty}
Question Count: ${questionCount}

IMPORTANT INSTRUCTIONS:
- Generate questions that match the exam pattern of ${company}
- Each question must have exactly 4 options (A, B, C, D)
- Distribute questions evenly across the selected topics: ${topicList}
- Difficulty level: ${difficulty} (easy = basic concepts, medium = application-based, hard = advanced problem-solving)
- For Quantitative Aptitude: number series, percentages, profit/loss, time & work, probability, permutations
- For Verbal Ability: grammar, reading comprehension, synonyms/antonyms, sentence correction, para jumbles
- For Logical Reasoning: puzzles, coding-decoding, blood relations, syllogisms, seating arrangement, data interpretation
- For Soft Skills: workplace scenarios, communication, teamwork, leadership, conflict resolution

Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):
[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "topic": "Quantitative Aptitude",
    "explanation": "Brief explanation of the correct answer"
  }
]

The correctAnswer is the 0-based index of the correct option. Generate exactly ${questionCount} questions.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a placement exam question generator. Always return valid JSON arrays only, no markdown formatting." },
          { role: "user", content: prompt }
        ],
        model: "google/gemini-3-flash-preview",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response, handling potential markdown wrapping
    let questions;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse generated questions");
    }

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format");
    }

    // Ensure each question has required fields
    const validated = questions.map((q: any, i: number) => ({
      id: `q${i + 1}`,
      text: q.text || `Question ${i + 1}`,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["A", "B", "C", "D"],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      topic: q.topic || topics[0] || "General",
      explanation: q.explanation || "",
    }));

    return new Response(JSON.stringify({ questions: validated }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
