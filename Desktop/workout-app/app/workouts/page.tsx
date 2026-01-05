"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Header from "@/app/components/Header";


// Tooltip Component
function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="relative w-full"
    >
      {children}
      <div
        className="absolute left-0 mt-1 px-3 py-2 text-xs bg-gray-800 text-white rounded shadow-lg pointer-events-none transition-opacity duration-200 z-20 max-w-xs"
        style={{
          opacity: showTooltip ? 1 : 0,
          visibility: showTooltip ? "visible" : "hidden",
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default function WorkoutAIPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Essential fields
  const [goal, setGoal] = useState("hypertrophy");
  const [experience, setExperience] = useState("beginner");
  const [daysPerWeek, setDaysPerWeek] = useState("3");
  const [sessionLength, setSessionLength] = useState("45-60");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [limitations, setLimitations] = useState("");
  const [otherEquipment, setOtherEquipment] = useState("");

  // Advanced fields
  const [conditioning, setConditioning] = useState<string[]>([]);
  const [progression, setProgression] = useState("linear");
  const [intensity, setIntensity] = useState("moderate");

  const [generatedPlan, setGeneratedPlan] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState("");

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGeneratedPlan("");

    if (!token) {
      setError("Please login to generate a workout plan.");
      return;
    }

    setGeneratingPlan(true);

    let equipList = [...equipment];
    if (otherEquipment.trim()) equipList.push(otherEquipment.trim());
    
    // If "none (bodyweight only)" is selected, remove all other equipment
    if (equipList.includes("none (bodyweight only)")) {
      equipList = ["BODYWEIGHT ONLY"];
    }

    const isBodyweightOnly = equipList.includes("BODYWEIGHT ONLY") || equipList.length === 0;

    const prompt = `Create ${daysPerWeek} workout days. ${goal} training for ${experience} level. ${sessionLength} per session.

Equipment: ${equipList.join(", ") || "BODYWEIGHT ONLY"}
${focusAreas.length ? `TARGET MUSCLES (ONLY THESE): ${focusAreas.join(", ").toUpperCase()}` : ""}

${focusAreas.length ? `
CRITICAL: Include ONLY exercises for ${focusAreas.join(", ")}. 
DO NOT include chest, back, shoulders, or arms UNLESS specifically listed above.

Examples for glutes/hamstrings: hip thrusts, glute bridges, Romanian deadlifts, hamstring curls, good mornings, single-leg deadlifts.
DO NOT include: bench press, push-ups, rows, bicep curls, or any upper body.
` : ""}

${isBodyweightOnly ? "NO EQUIPMENT ALLOWED. Bodyweight exercises only (squats, lunges, glute bridges, push-ups, planks)." : ""}
${limitations ? `Avoid: ${limitations}` : ""}

Provide ${daysPerWeek} days with 4-8 exercises each, sets/reps, and rest periods.`;

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate plan");
      } else {
        setGeneratedPlan(data.reply);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const toggleConditioning = (c: string) => {
    setConditioning((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const savePlan = async () => {
    if (!generatedPlan.trim()) {
      setError("No plan to save.");
      return;
    }
    if (!token) {
      setError("Please login to save your plan.");
      return;
    }
    setGeneratingPlan(true);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `AI Plan - ${goal} (${experience})`,
          date: new Date().toISOString().split("T")[0],
          notes: generatedPlan,
          exercise: [
            {
              name: "AI Generated Plan",
              sets: 1,
              reps: 1,
            }
          ],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save plan");
      } else {
        setGeneratedPlan("");
        setError("");
        alert("Plan saved successfully! Redirecting to My Plans...");
        // Redirect to /me after saving
        window.location.href = "/me";
      }
    } catch (err: any) {
      setError(err.message || "Network error while saving");
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Generate Your Custom Workout Plan
            </h2>
            <p className="text-gray-600">
              Fill out the form below and our AI will create a personalized workout plan tailored to your goals and preferences.
            </p>
          </div>

          {/* Login banner removed for minimal UI */}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleGeneratePlan} className="space-y-6">
            {/* Essential Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Essential Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Goal Field with Tooltip */}
                <Tooltip text="Choose your primary training goal - this will determine the structure of your workout plan">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Goal <span className="text-purple-500 cursor-help">ℹ️</span>
                    </label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="strength">Strength</option>
                      <option value="hypertrophy">Hypertrophy (Muscle Growth)</option>
                      <option value="power_agility">Power/Agility</option>
                      <option value="conditioning">Conditioning/Endurance</option>
                    </select>
                  </div>
                </Tooltip>

                {/* Experience Field with Tooltip */}
                <Tooltip text="Select your training experience level to get workouts that match your abilities">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Training Experience <span className="text-purple-500 cursor-help">ℹ️</span>
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="beginner">Beginner (0–6 months)</option>
                      <option value="intermediate">Intermediate (6–24 months)</option>
                      <option value="advanced">Advanced (2+ years)</option>
                    </select>
                  </div>
                </Tooltip>

                {/* Days per Week with Tooltip */}
                <Tooltip text="How many days per week can you commit to training? More days allow for better recovery between muscle groups">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Days per Week <span className="text-purple-500 cursor-help">ℹ️</span>
                    </label>
                    <select
                      value={daysPerWeek}
                      onChange={(e) => setDaysPerWeek(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>
                </Tooltip>

                {/* Session Length with Tooltip */}
                <Tooltip text="Choose how much time you can dedicate to each workout session">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Session Length <span className="text-purple-500 cursor-help">ℹ️</span>
                    </label>
                    <select
                      value={sessionLength}
                      onChange={(e) => setSessionLength(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="15-30">15–30 min</option>
                      <option value="30-45">30–45 min</option>
                      <option value="45-60">45–60 min</option>
                      <option value="60-90">60–90 min</option>
                      <option value=">90">&gt;90 min</option>
                    </select>
                  </div>
                </Tooltip>
              </div>

              {/* Equipment with Tooltip */}
              <Tooltip text="Select all equipment you have access to - this helps us create workouts you can actually do">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Equipment Available <span className="text-purple-500 cursor-help">ℹ️</span>
                  </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    "none (bodyweight only)",
                    "dumbbells",
                    "barbell + plates",
                    "machines",
                    "kettlebells",
                    "resistance bands",
                    "pull-up bar",
                    "cable stack",
                  ].map((item) => (
                    <label key={item} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={equipment.includes(item)}
                        onChange={() => toggleEquipment(item)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  value={otherEquipment}
                  onChange={(e) => setOtherEquipment(e.target.value)}
                  className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                </div>
              </Tooltip>

              {/* Focus Areas with Tooltip */}
              <Tooltip text="Choose specific muscle groups or areas you want to prioritize in your training">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Areas / Focus <span className="text-purple-500 cursor-help">ℹ️</span>
                  </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    "full body",
                    "upper body",
                    "lower body",
                    "chest",
                    "back",
                    "shoulders",
                    "arms",
                    "core",
                    "glutes",
                    "quads",
                    "hamstrings",
                    "calves",
                  ].map((area) => (
                    <label key={area} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={focusAreas.includes(area)}
                        onChange={() => toggleFocusArea(area)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm capitalize">{area}</span>
                    </label>
                  ))}
                </div>
                </div>
              </Tooltip>

              {/* Limitations with Tooltip */}
              <Tooltip text="Let us know about any injuries or limitations so we can modify exercises accordingly">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Limitations or Injuries <span className="text-purple-500 cursor-help">ℹ️</span>
                  </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["None", "Back", "Shoulder", "Knee", "Wrist"].map((l) => (
                    <button
                      type="button"
                      key={l}
                      onClick={() => setLimitations(l === "None" ? "" : l)}
                      className={`px-3 py-1 border rounded text-sm ${
                        limitations === l || (l === "None" && !limitations)
                          ? "bg-purple-100 border-purple-500"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <textarea
                  value={limitations}
                  onChange={(e) => setLimitations(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
                </div>
              </Tooltip>
            </div>

            {/* Advanced Options Toggle */}
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg text-sm font-medium"
              >
                <span>Advanced Options (Optional)</span>
                <span>{showAdvanced ? "▼ Hide" : "▶ Show"}</span>
              </button>
            </div>

            {/* Advanced Fields */}
            {showAdvanced && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700">Advanced Settings</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">Conditioning Preference</label>
                  <div className="grid grid-cols-1 md-grid-cols-2 gap-2">
                    {[
                      "low-intensity steady state (LISS)",
                      "intervals/HIIT",
                      "sport-specific",
                      "conditioning circuits",
                    ].map((c) => (
                      <label key={c} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={conditioning.includes(c)}
                          onChange={() => toggleConditioning(c)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Progression Style</label>
                  <select
                    value={progression}
                    onChange={(e) => setProgression(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="linear">Linear (add weight/reps weekly)</option>
                    <option value="double">Double progression (reps first, then weight)</option>
                    <option value="rpe">RPE-based</option>
                    <option value="auto">Auto-regulation (feel-based)</option>
                    <option value="none">No preference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Intensity Guidance (RPE/RIR)</label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="light">Light (RPE 6–7 / 3–4 RIR)</option>
                    <option value="moderate">Moderate (RPE 7–8 / 2–3 RIR)</option>
                    <option value="hard">Hard (RPE 8–9 / 1–2 RIR)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button with auth-aware Tooltip */}
            <Tooltip
              text={
                isAuthenticated
                  ? "Click to generate your personalized AI workout plan"
                  : "Hint: Sign up or log in to generate a workout plan"
              }
            >
              <button
                type="submit"
                disabled={generatingPlan || !isAuthenticated}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generatingPlan ? "Generating Your Plan..." : "🚀 Generate My Workout Plan"}
              </button>
            </Tooltip>
          </form>

          {/* Generated Plan */}
          {generatedPlan && (
            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ✅ Your Custom Workout Plan
              </h3>
              <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed bg-white p-4 rounded">
                {generatedPlan}
              </div>
              <div className="mt-4 flex gap-3 flex-wrap">
                {isAuthenticated ? (
                  <button
                    onClick={() => savePlan()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    💾 Save to My Plans
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Login to Save
                  </Link>
                )}
                <button
                  onClick={() => navigator.clipboard.writeText(generatedPlan)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  📋 Copy to Clipboard
                </button>
                <Link
                  href="/me"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  📊 View My Plans
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
