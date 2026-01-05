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

// GET /api/user/chat-history - Get user's chat history
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(userId).select("chatHistory").lean();
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    console.log("GET /api/user/chat-history - found messages:", user.chatHistory?.length || 0);

    return NextResponse.json({ chatHistory: user.chatHistory || [] }, { status: 200 });
  } catch (err) {
    console.error("GET /api/user/chat-history error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/user/chat-history - Save chat message
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "messages must be an array" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Save chat history (keep last 100 messages)
    user.chatHistory = messages.slice(-100);

    await user.save();
    
    console.log("POST /api/user/chat-history - saved", messages.length, "messages");

    return NextResponse.json({ 
      message: "Chat history saved successfully",
      chatHistory: user.chatHistory
    }, { status: 200 });
  } catch (err) {
    console.error("POST /api/user/chat-history error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/user/chat-history - Clear chat history
export async function DELETE(req: Request) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(userId);
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.chatHistory = [];
    await user.save();

    console.log("DELETE /api/user/chat-history - cleared");

    return NextResponse.json({ message: "Chat history cleared" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/user/chat-history error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
