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

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const templateId = params.id;

    await connectDB();
    const user = await User.findById(userId);
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.workoutTemplates) {
      return NextResponse.json({ error: "No templates found" }, { status: 404 });
    }

    // Filter out the template
    user.workoutTemplates = user.workoutTemplates.filter(
      (t: any) => t._id.toString() !== templateId
    );

    await user.save();

    return NextResponse.json({ message: "Template deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/templates/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
