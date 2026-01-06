import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/utils/auth";

export async function POST (req: Request) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            console.error("Missing email or password", { email, password });
            return NextResponse.json({ error: "email and password are required" },{ status:400 });
        }
        const user  = await User.findOne({ email });
        if (!user) {
            console.error("User not found for email:", email);
            return NextResponse.json({ error: "Invalid credentials"}, { status: 401});
        }
        let passwordValid = false;
        try {
            passwordValid = await user.validatePassword(password);
        } catch (err) {
            console.error("Error validating password for user:", email, err);
            return NextResponse.json({ error: "server error: password validation failed" }, { status: 500 });
        }
        if (!passwordValid) {
            console.error("Invalid password for user:", email);
            return NextResponse.json({ error: "Invalid credentials"}, { status: 401});
        }
        let token;
        try {
            token = signToken(user._id.toString());
        } catch (err) {
            console.error("Error signing JWT for user:", email, err);
            return NextResponse.json({ error: "server error: token signing failed" }, { status: 500 });
        }

        return NextResponse.json({
            token,
            user: { 
                id: user._id.toString(), 
                email: user.email,
                createdAt: user.createdAt 
            },
        });
    } catch (err) {
        console.error("General server error in login route:", err);
        return NextResponse.json({error: "server error"}, { status: 500});
    }
}