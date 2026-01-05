import { NextResponse } from "next/server";
// Removed OpenAI import
import { connectDB } from "@/lib/mongodb";
import Workout from "@/models/Workout";
import { verifyToken } from "@/utils/auth";

// No OpenAI client needed

function getUserIdFromHeader(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.trim().split(/\s+/);
  if (!token || type.toLowerCase() !== "bearer") return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

export async function POST(req: Request) {
  try {
    // Try to authenticate user (optional for this endpoint)
    const userId = getUserIdFromHeader(req);

    if (!process.env.HF_API_KEY) {
      return NextResponse.json(
        { error: "Missing Hugging Face API key" },
        { status: 500 }
      );
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // Fetch user's recent workouts for context (only if authenticated)
    let workoutContext = "";
    if (userId) {
      await connectDB();
      const recentWorkouts = await Workout.find({ userId })
        .sort({ date: -1 })
        .limit(5)
        .lean();

      // Build workout context for AI
      if (recentWorkouts.length > 0) {
        workoutContext = `User's recent workouts:\n${recentWorkouts
          .map(
            (w: any) =>
            `- ${w.title} (${new Date(w.date).toLocaleDateString()}): ${w.exercise
              .map((e: any) => `${e.name} ${e.sets}x${e.reps}${e.weight ? ` @ ${e.weight}lbs` : ""}`)
              .join(", ")}`
        )
        .join("\n")}`;
      } else {
        workoutContext = "User has no workouts yet.";
      }
    } else {
      workoutContext = "New visitor - no workout history available.";
    }

    // Call Hugging Face Inference API with workout context
    const prompt = `You are a friendly workout app assistant. Answer questions about training, recovery, and how to use the app. Be clear, practical, and concise. If something is medical, tell the user to ask a doctor. Help users improve their workouts and fitness routine.\n\n${workoutContext}\n\nUser question: ${message}`;

    // Detect if user is asking for a detailed workout or meal plan generation
    const isDetailedPlanRequest = message.toLowerCase().includes('create') || 
                                  message.toLowerCase().includes('generate') || 
                                  message.toLowerCase().includes('program') ||
                                  (message.toLowerCase().includes('plan') && message.toLowerCase().includes('week')) ||
                                  message.toLowerCase().includes('days per week') ||
                                  (message.toLowerCase().includes('meal') && (message.toLowerCase().includes('plan') || message.toLowerCase().includes('day'))) ||
                                  message.toLowerCase().includes('calories') ||
                                  message.toLowerCase().includes('diet type');

    // Use Hugging Face Router (OpenAI-compatible API)
    // Using a larger, more capable model for better instruction following
    const model = "meta-llama/Llama-3.2-3B-Instruct";
    
        const systemPrompt = isDetailedPlanRequest 
      ? `You are a professional fitness coach creating workout programs.

    CRITICAL RULES YOU MUST FOLLOW:
    1. If user specifies target areas (e.g., "glutes and hamstrings"), include ONLY exercises for those areas
    2. DO NOT add exercises for unspecified body parts
    3. If user says "bodyweight only", use NO equipment at all
    4. Follow equipment restrictions exactly
    5. Provide complete workout days as requested

    Be precise and follow instructions exactly.`
      : `You are a friendly assistant for a fitness app. Guidelines:
    - Answer questions about the app (like how to sign up, reset password, navigate features) in a clear, concise, and friendly way.
    - If the question is about fitness, training, nutrition, or recovery, give actionable advice with specific exercises or techniques.
    - For medical concerns, recommend consulting a healthcare professional.
    - If you don't know something, say so briefly.
    - Keep responses under 4 sentences.
    - Be encouraging and supportive.
    - Never ask for personal information. If a user wants to create an account, tell them to use the app's sign up or register page.`;

    const hfResponse = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: workoutContext },
          { role: "user", content: message },
        ],
        temperature: 0.6,
        max_tokens: isDetailedPlanRequest ? 2000 : 300,
      }),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      return NextResponse.json({ error: `Hugging Face API error: ${errorText}` }, { status: hfResponse.status });
    }

  const hfData = await hfResponse.json();
  // Router returns OpenAI-compatible response shape
  const reply = hfData?.choices?.[0]?.message?.content ?? "No response from AI.";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err: any) {
    console.error("AI assistant error:", err.message || err);
    return NextResponse.json(
      { error: `Failed to get AI response: ${err.message}` },
      { status: 500 }
    );
  }
}
