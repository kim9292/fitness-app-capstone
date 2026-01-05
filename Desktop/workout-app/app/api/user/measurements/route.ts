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

// GET /api/user/measurements - Get user measurements
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("GET /api/user/measurements - userId:", userId);

    await connectDB();
    const user = await User.findById(userId).select("measurements").lean();
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    console.log("GET /api/user/measurements - found measurements:", user.measurements);

    return NextResponse.json({ measurements: user.measurements || {} }, { status: 200 });
  } catch (err) {
    console.error("GET /api/user/measurements error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/user/measurements - Update user measurements
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { weight, bodyFat, measurements } = body;
    
    console.log("POST /api/user/measurements - userId:", userId);
    console.log("POST /api/user/measurements - body:", { weight, bodyFat, measurements });

    await connectDB();
    const user = await User.findById(userId);
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update measurements field
    user.measurements = {
      weight: weight || "",
      bodyFat: bodyFat || "",
      other: measurements || "",
      updatedAt: new Date(),
    };

    await user.save();
    
    console.log("POST /api/user/measurements - saved:", user.measurements);

    // Return the saved measurements so frontend can immediately update
    return NextResponse.json({ 
      message: "Measurements saved successfully",
      measurements: user.measurements
    }, { status: 200 });
  } catch (err) {
    console.error("POST /api/user/measurements error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
