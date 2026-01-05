import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

console.log("Loading User model...");

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    measurements?: {
        weight?: string;
        bodyFat?: string;
        other?: string;
        updatedAt?: Date;
    };
    chatHistory?: Array<{
        id: string;
        role: "user" | "assistant";
        content: string;
        timestamp?: Date;
    }>;
    habitLogs?: Array<{
        habitId: string;
        date: string;
        completed: boolean;
        value?: number;
    }>;
    workoutTemplates?: Array<{
        name: string;
        exercises: Array<{
            name: string;
            sets: number;
            reps: number;
            weight?: number;
        }>;
        createdAt: Date;
    }>;
    setPassword(password: string): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, trim: true },
        passwordHash: { type: String, required: true },
        measurements: {
            type: {
                weight: { type: String },
                bodyFat: { type: String },
                other: { type: String },
                updatedAt: { type: Date }
            },
            required: false
        },
        chatHistory: {
            type: [{
                id: { type: String },
                role: { type: String, enum: ["user", "assistant"] },
                content: { type: String },
                timestamp: { type: Date, default: Date.now }
            }],
            required: false,
            default: []
        },
        habitLogs: {
            type: [{
                habitId: { type: String },
                date: { type: String },
                completed: { type: Boolean },
                value: { type: Number }
            }],
            required: false,
            default: []
        },
        workoutTemplates: {
            type: [{
                name: { type: String },
                exercises: [{
                    name: { type: String },
                    sets: { type: Number },
                    reps: { type: Number },
                    weight: { type: Number }
                }],
                createdAt: { type: Date, default: Date.now }
            }],
            required: false,
            default: []
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

UserSchema.virtual("id").get(function () {
    return this._id.toString();
});
UserSchema.methods.setPassword = async function (plain: string) {
    try {
        console.log("Hashing password for user:", this.email);
        this.passwordHash = await bcrypt.hash(plain, 12);
    } catch (err) {
        console.log("Error hasing password:", err);
        throw err;
    }
};
UserSchema.methods.validatePassword = async function (plain: string) {
    try {
        console.log("Validating password for user:", this.email);
        return bcrypt.compare(plain, this.passwordHash);
   } catch (err) {
        console.log("Error validating password:", err);
        throw err;
   }
};
let User: Model<IUser>;
try {
    User =
    (mongoose.models.User as Model<IUser>) ||
    mongoose.model<IUser>("User", UserSchema);
    console.log("User model loaded successfully");
} catch (err) {
    console.error("Error loading User model:", err);
    throw err;
}
export default User;


