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

// GET /api/user/habits - Get habit logs
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(userId).select("habitLogs").lean();
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ logs: user.habitLogs || [] }, { status: 200 });
  } catch (err) {
    console.error("GET /api/user/habits error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/user/habits - Save habit log
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { habitId, date, completed, value } = body;

    await connectDB();
    const user = await User.findById(userId);
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Initialize habitLogs if not exists
    if (!user.habitLogs) {
      user.habitLogs = [];
    }

    // Find existing log for this habit on this date
    const existingIndex = user.habitLogs.findIndex(
      (log: any) => log.habitId === habitId && log.date === date
    );

    if (existingIndex >= 0) {
      // Update existing
      user.habitLogs[existingIndex] = { habitId, date, completed, value };
    } else {
      // Add new
      user.habitLogs.push({ habitId, date, completed, value });
    }

    await user.save();

    return NextResponse.json({ 
      message: "Habit saved successfully",
      logs: user.habitLogs
    }, { status: 200 });
  } catch (err) {
    console.error("POST /api/user/habits error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
