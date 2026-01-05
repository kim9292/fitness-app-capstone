import jwt from "jsonwebtoken";

console.log("loading jwt auth utils..");

const  JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing from .env.local!");
    throw new Error("please define JWT_SECRET in .env.loacal");
}
export function signToken(userId: string) {
    console.log(`Signing JWT for userId: ${userId}`);

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    console.log("JWT created successfully:", token.substring(0, 20) + "...");
    return token;
}
export function verifyToken(token: string): { userId: string } | null {
    console.log("verifying JWT...");

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        console.log("JWT verified. userId:", decoded.userId);
        return decoded;
    } catch (err) {
        console.error("JWT verification failed:", err);
        return null;
    }
}