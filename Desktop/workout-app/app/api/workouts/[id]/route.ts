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

// GET /api/workouts/:id - fetch one workout (must belong to user)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { id } = params;
    const workout = await Workout.findById(id).lean();
    if (!workout) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // ownership check - workout.userId may be ObjectId
    if (workout.userId?.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ workout }, { status: 200 });
  } catch (err) {
    console.error("GET /api/workouts/:id error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/workouts/:id - update allowed fields
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();

    // only allow these fields to be updated
    const updates: any = {};
    if (typeof body.title === "string") updates.title = body.title.trim();
    if (body.date !== undefined) {
      const d = new Date(body.date);
      if (Number.isNaN(d.getTime())) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      updates.date = d;
    }
    if (body.notes !== undefined) updates.notes = body.notes;
    // accept either `exercise` or `exercises`
    const exercises = body.exercise ?? body.exercises;
    if (exercises !== undefined) {
      if (!Array.isArray(exercises)) return NextResponse.json({ error: "exercise must be an array" }, { status: 400 });
      // basic validation
      for (const ex of exercises) {
        if (!ex || typeof ex.name !== "string" || typeof ex.sets !== "number" || typeof ex.reps !== "number") {
          return NextResponse.json({ error: "each exercise must include name (string), sets (number), reps (number)" }, { status: 400 });
        }
      }
      updates.exercise = exercises;
    }

    await connectDB();

    const existing = await Workout.findById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.userId?.toString() !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    Object.assign(existing, updates);
    const saved = await existing.save();

    return NextResponse.json({ workout: saved }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/workouts/:id error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/workouts/:id - delete a workout (owner only)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) {
      console.log('DELETE: No userId - Unauthorized');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await connectDB();

    console.log(`DELETE request for workout ID: ${id} by user: ${userId}`);
    
    const existing = await Workout.findById(id);
    console.log(`Workout found:`, existing ? `Yes (owner: ${existing.userId})` : 'No');
    
    if (!existing) {
      console.log(`DELETE: Workout ${id} not found in database`);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.userId?.toString() !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await existing.deleteOne();
    console.log(`Workout ${id} deleted successfully`);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/workouts/:id error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
