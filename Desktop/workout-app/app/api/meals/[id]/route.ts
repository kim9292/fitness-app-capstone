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

const mealPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  plan: { type: String, required: true },
  calories: { type: Number },
  mealsPerDay: { type: Number },
});

const MealPlan = mongoose.models.MealPlan || mongoose.model("MealPlan", mealPlanSchema);

// DELETE /api/meals/[id] - delete a meal plan
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    
    await connectDB();
    const mealPlan = await MealPlan.findOne({ _id: id, userId });
    
    if (!mealPlan) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }

    await MealPlan.deleteOne({ _id: id });
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/meals/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
