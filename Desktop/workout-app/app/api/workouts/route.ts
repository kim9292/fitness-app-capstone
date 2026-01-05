import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Workout from "@/models/Workout";
import { verifyToken } from "@/utils/auth";

function getUserIdFromHeader(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.trim().split(/\s+/);
  if (!token || type.toLowerCase() !== "bearer") return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

// GET /api/workouts - list workouts for authenticated user
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const workouts = await Workout.find({ userId }).sort({ date: -1 }).lean();
    // Add id field from _id for frontend compatibility
    const workoutsWithId = workouts.map((w: any) => ({
      ...w,
      id: w._id.toString(),
    }));
    return NextResponse.json({ workouts: workoutsWithId }, { status: 200 });
  } catch (err) {
    console.error("GET /api/workouts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/workouts - create a new workout for authenticated user
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const title = body.title?.trim();
    const exercises = body.exercise ?? body.exercises ?? [];

    if (!title) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json({ error: "exercise array required" }, { status: 400 });
    }
    for (const ex of exercises) {
      if (!ex || typeof ex.name !== "string" || typeof ex.sets !== "number" || typeof ex.reps !== "number") {
        return NextResponse.json({ error: "each exercise must include name (string), sets (number), reps (number)" }, { status: 400 });
      }
    }

    await connectDB();
    const savedDate = body.date ? new Date(body.date) : new Date();
    if (body.date && Number.isNaN(savedDate.getTime())) {
      return NextResponse.json({ error: "invalid date" }, { status: 400 });
    }

    const workout = await Workout.create({
      userId,
      title,
      date: savedDate,
      notes: body.notes,
      exercise: exercises,
    });

    const out = {
      id: workout._id.toString(),
      title: workout.title,
      date: workout.date,
      notes: workout.notes,
      exercise: workout.exercise,
    };

    return NextResponse.json({ workout: out }, { status: 201 });
  } catch (err) {
    console.error("POST /api/workouts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
