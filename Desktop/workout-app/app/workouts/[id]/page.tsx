"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/app/components/Header";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  _id?: string;
}

interface Workout {
  id: string;
  title: string;
  date: string;
  exercise: Exercise[];
  notes?: string;
  _id?: string;
}

export default function EditWorkoutPage() {
  const params = useParams();
  const workoutId = params.id as string;
  const router = useRouter();
  const { isAuthenticated, apiCall, isLoading: authLoading } = useAuth();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState("");

  // No redirect - allow public viewing with limited features

  // Fetch workout details
  useEffect(() => {
    if (!isAuthenticated || !workoutId) return;

    const fetchWorkout = async () => {
      try {
        setIsLoading(true);
        const data = await apiCall(`/api/workouts/${workoutId}`);
        setWorkout(data.workout);
        setTitle(data.workout.title);
        setExercises(data.workout.exercise || []);
        setNotes(data.workout.notes || "");
      } catch (err: any) {
        setError(err.message || "Failed to load workout");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [isAuthenticated, workoutId, apiCall]);

  const handleUpdateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || exercises.length === 0) {
      setError("Title and at least one exercise are required");
      return;
    }

    try {
      await apiCall(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          exercise: exercises,
          notes,
        }),
      });

      router.push("/workouts");
    } catch (err: any) {
      setError(err.message || "Failed to update workout");
    }
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: "", sets: 3, reps: 10, weight: undefined },
    ]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="text-center text-white p-6">
            <h2 className="text-3xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-300 mb-6">Please log in to view and edit your workouts</p>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && !workout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Link
            href="/workouts"
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Workouts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdateWorkout} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workout Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chest Day"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Exercises */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Exercises
                </label>
                <button
                  type="button"
                  onClick={addExercise}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  + Add Exercise
                </button>
              </div>

              <div className="space-y-3">
                {exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) =>
                          updateExercise(index, "name", e.target.value)
                        }
                        placeholder="Exercise name"
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExercise(index, "sets", parseInt(e.target.value))
                          }
                          placeholder="Sets"
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) =>
                            updateExercise(index, "reps", parseInt(e.target.value))
                          }
                          placeholder="Reps"
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <input
                          type="number"
                          value={exercise.weight || ""}
                          onChange={(e) =>
                            updateExercise(
                              index,
                              "weight",
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )
                          }
                          placeholder="Weight"
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove Exercise
                    </button>
                  </div>
                ))}

                {exercises.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No exercises added yet. Click "Add Exercise" to get started.
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Save Changes
              </button>
              <Link
                href="/workouts"
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Workout Info */}
        {workout && (
          <div className="mt-4 text-gray-400 text-sm text-center">
            Created on {new Date(workout.date).toLocaleDateString()} at{" "}
            {new Date(workout.date).toLocaleTimeString()}
          </div>
        )}
      </main>
    </div>
  );
}
