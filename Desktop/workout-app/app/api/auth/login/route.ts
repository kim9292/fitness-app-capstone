import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/utils/auth";

export async function POST (req: Request) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "email and password are required" },{ status:400 });
        }
        const user  = await User.findOne({ email});
        if(!user || !(await user.validatePassword(password))) {
            return NextResponse.json({ error: "Invalid credentials"}, { status: 401});
        }
        const token = signToken(user._id.toString());

        return NextResponse.json({
            token,
            user: { 
                id: user._id.toString(), 
                email: user.email,
                createdAt: user.createdAt 
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({error: "server error"}, { status: 500});
    }
}