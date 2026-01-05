import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorkout extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    date: Date;
    notes?: string;
    exercise: {
        name: string;
        sets: number;
        reps: number;
        weight?: number;
    }[];
    id?: string; // Virtual field
}
const WorkoutSchema = new Schema<IWorkout>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title : { type: String, required: true },
        date: { type: Date, default: Date.now},
        notes: String,
        exercise: [
            {
                name: { type: String, required: true},
                sets: { type: Number, required: true },
                reps: { type: Number, required: true },
                weight: Number,
            },
        ],
    },
    { timestamps: true }
);

// Add virtual 'id' field that maps to '_id'
WorkoutSchema.set("toJSON", {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
    },
});
let Workout: Model<IWorkout>;

try {
    Workout =
    (mongoose.models.Workout as Model<IWorkout>) ||
    mongoose.model<IWorkout>("Workout", WorkoutSchema);
    console.log("Workout model loaded successfully");
} catch (err) {
    console.error("Error loading workout model:", err);
    throw err;
}

export default Workout;