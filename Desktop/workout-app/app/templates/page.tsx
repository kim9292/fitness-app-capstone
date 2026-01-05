"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

interface Template {
  _id?: string;
  name: string;
  exercises: Exercise[];
  createdAt?: Date;
}

export default function TemplatesPage() {
  const { isAuthenticated, apiCall, token } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      loadTemplates();
      loadRecentWorkouts();
    }
  }, [isAuthenticated]);

  const loadTemplates = async () => {
    try {
      const response = await apiCall("/api/templates", { method: "GET" });
      if (response?.templates) {
        setTemplates(response.templates);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentWorkouts = async () => {
    try {
      const res = await fetch("/api/workouts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const workouts = Array.isArray(data) ? data : data.workouts || [];
        setRecentWorkouts(workouts.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to load workouts:", err);
    }
  };

  const saveAsTemplate = async (workout: any, customName?: string) => {
    const templateName =
      customName ||
      prompt("Template name:", workout.title || "My Workout Template");
    if (!templateName) return;

    try {
      await apiCall("/api/templates", {
        method: "POST",
        body: JSON.stringify({
          name: templateName,
          exercises: workout.exercise || [],
        }),
      });
      alert("Template saved!");
      loadTemplates();
    } catch (err) {
      console.error("Failed to save template:", err);
      alert("Failed to save template");
    }
  };

  const startFromTemplate = async (template: Template) => {
    try {
      // Create a new workout from template
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: template.name,
          date: new Date().toISOString(),
          exercise: template.exercises,
          notes: `Started from template: ${template.name}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Workout created from template!");
        router.push("/workouts");
      }
    } catch (err) {
      console.error("Failed to start workout:", err);
      alert("Failed to create workout");
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;

    try {
      await apiCall(`/api/templates/${id}`, { method: "DELETE" });
      loadTemplates();
    } catch (err) {
      console.error("Failed to delete template:", err);
      alert("Failed to delete template");
    }
  };

  const repeatLastWorkout = async () => {
    if (recentWorkouts.length === 0) {
      alert("No recent workouts to repeat");
      return;
    }

    const lastWorkout = recentWorkouts[0];
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: lastWorkout.title + " (Repeat)",
          date: new Date().toISOString(),
          exercise: lastWorkout.exercise || [],
          notes: "Repeated workout",
        }),
      });

      if (res.ok) {
        alert("Last workout repeated!");
        router.push("/workouts");
      }
    } catch (err) {
      console.error("Failed to repeat workout:", err);
      alert("Failed to repeat workout");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <p className="text-white text-center">Loading templates...</p>
        ) : (
          <>
            {/* My Templates */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                My Templates
              </h2>

              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-600 mb-4">
                    No templates yet. Save a workout as a template to reuse it
                    later!
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-violet-500 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {template.name}
                        </h3>
                        <button
                          onClick={() => template._id && deleteTemplate(template._id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.exercises.length} exercises
                      </p>
                      <div className="space-y-1 mb-4">
                        {template.exercises.slice(0, 3).map((ex, idx) => (
                          <p key={idx} className="text-xs text-gray-500">
                            • {ex.name} - {ex.sets}x{ex.reps}
                            {ex.weight ? ` @ ${ex.weight}lbs` : ""}
                          </p>
                        ))}
                        {template.exercises.length > 3 && (
                          <p className="text-xs text-gray-400">
                            +{template.exercises.length - 3} more...
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => startFromTemplate(template)}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Start Workout
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Workouts - Save as Template */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Save Recent Workouts as Templates
              </h2>

              {recentWorkouts.length === 0 ? (
                <p className="text-gray-500">No recent workouts</p>
              ) : (
                <div className="space-y-3">
                  {recentWorkouts.map((workout) => (
                    <div
                      key={workout._id}
                      className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {workout.title || "Untitled Workout"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(workout.date).toLocaleDateString()} •{" "}
                          {workout.exercise?.length || 0} exercises
                        </p>
                      </div>
                      <button
                        onClick={() => saveAsTemplate(workout)}
                        className="bg-violet-100 hover:bg-violet-200 text-violet-700 px-4 py-2 rounded-lg font-medium text-sm"
                      >
                        Save as Template
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
