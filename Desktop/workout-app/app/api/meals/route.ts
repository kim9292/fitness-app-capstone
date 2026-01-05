import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/utils/auth";
import mongoose from "mongoose";

function getUserIdFromHeader(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.trim().split(/\s+/);
  if (!token || type.toLowerCase() !== "bearer") return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

// Define MealPlan schema inline
const mealPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  plan: { type: String, required: true },
  calories: { type: Number },
  mealsPerDay: { type: Number },
});

const MealPlan = mongoose.models.MealPlan || mongoose.model("MealPlan", mealPlanSchema);

// GET /api/meals - list meal plans for authenticated user
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const mealPlans = await MealPlan.find({ userId }).sort({ date: -1 }).lean();
    
    const mealPlansWithId = mealPlans.map((m: any) => ({
      ...m,
      id: m._id.toString(),
    }));
    
    return NextResponse.json({ mealPlans: mealPlansWithId }, { status: 200 });
  } catch (err) {
    console.error("GET /api/meals error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/meals - create a new meal plan for authenticated user
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const title = body.title?.trim();
    const plan = body.plan?.trim();

    if (!title || !plan) {
      return NextResponse.json({ error: "title and plan required" }, { status: 400 });
    }

    await connectDB();
    const savedDate = body.date ? new Date(body.date) : new Date();
    if (body.date && Number.isNaN(savedDate.getTime())) {
      return NextResponse.json({ error: "invalid date" }, { status: 400 });
    }

    const mealPlan = await MealPlan.create({
      userId,
      title,
      date: savedDate,
      plan,
      calories: body.calories,
      mealsPerDay: body.mealsPerDay,
    });

    const out = {
      id: mealPlan._id.toString(),
      title: mealPlan.title,
      date: mealPlan.date,
      plan: mealPlan.plan,
      calories: mealPlan.calories,
      mealsPerDay: mealPlan.mealsPerDay,
    };

    return NextResponse.json({ mealPlan: out }, { status: 201 });
  } catch (err) {
    console.error("POST /api/meals error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
