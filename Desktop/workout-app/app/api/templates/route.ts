import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";

function getUserIdFromHeader(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.trim().split(/\s+/);
  if (!token || type.toLowerCase() !== "bearer") return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

// GET /api/templates - Get user's workout templates
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(userId).select("workoutTemplates").lean();
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ templates: user.workoutTemplates || [] }, { status: 200 });
  } catch (err) {
    console.error("GET /api/templates error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/templates - Save a new template
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, exercises } = body;

    if (!name || !exercises) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.workoutTemplates) {
      user.workoutTemplates = [];
    }

    user.workoutTemplates.push({
      name,
      exercises,
      createdAt: new Date()
    });

    await user.save();

    return NextResponse.json({ 
      message: "Template saved successfully",
      templates: user.workoutTemplates
    }, { status: 200 });
  } catch (err) {
    console.error("POST /api/templates error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
