"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Header from "@/app/components/Header";

export default function MealsAIPage() {
  const { token } = useAuth();

  // Form fields
  const [goal, setGoal] = useState("muscle_gain");
  const [dietType, setDietType] = useState("balanced");
  const [mealsPerDay, setMealsPerDay] = useState("3");
  const [calories, setCalories] = useState("2000");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState("");
  const [cookingTime, setCookingTime] = useState("30-45");

  const [generatedPlan, setGeneratedPlan] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState("");

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGeneratedPlan("");
    setGeneratingPlan(true);

    const prompt = `Create a detailed meal plan for ${goal} with ${mealsPerDay} meals per day, targeting approximately ${calories} calories daily.

Diet Type: ${dietType}
${restrictions.length ? `Dietary Restrictions: ${restrictions.join(", ")}\n` : ""}${dislikes ? `Foods to Avoid: ${dislikes}\n` : ""}Preferred Cooking Time: ${cookingTime} minutes per meal

IMPORTANT: Provide a complete ${mealsPerDay}-meal daily plan with:
- Meal name and timing
- Complete ingredient list with quantities
- Macros (protein/carbs/fat) per meal
- Simple preparation instructions
- Total daily calories and macros

Format it clearly so the user can follow the plan easily.`;

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
        setError(data.error || "Failed to generate meal plan");
      } else {
        setGeneratedPlan(data.reply);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const toggleRestriction = (item: string) => {
    setRestrictions((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const savePlan = async () => {
    if (!generatedPlan.trim()) {
      setError("No plan to save.");
      return;
    }
    setGeneratingPlan(true);
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `AI Meal Plan - ${goal} (${calories} cal)`,
          date: new Date().toISOString().split("T")[0],
          plan: generatedPlan,
          calories: parseInt(calories),
          mealsPerDay: parseInt(mealsPerDay),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save plan");
      } else {
        setGeneratedPlan("");
        setError("");
        alert("Meal plan saved successfully! Redirecting...");
        window.location.href = "/meals/my-meals";
      }
    } catch (err: any) {
      setError(err.message || "Network error while saving");
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Generate Your Custom Meal Plan
            </h2>
            <p className="text-gray-600">
              Tell us about your goals and preferences, and we'll create a personalized meal plan.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleGeneratePlan} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Goal */}
              <div>
                <label className="block text-sm font-medium mb-1">Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="fat_loss">Fat Loss</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="performance">Athletic Performance</option>
                </select>
              </div>

              {/* Diet Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Diet Type</label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="balanced">Balanced</option>
                  <option value="high_protein">High Protein</option>
                  <option value="low_carb">Low Carb</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                </select>
              </div>

              {/* Meals Per Day */}
              <div>
                <label className="block text-sm font-medium mb-1">Meals per Day</label>
                <select
                  value={mealsPerDay}
                  onChange={(e) => setMealsPerDay(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="2">2 (IF)</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>

              {/* Target Calories */}
              <div>
                <label className="block text-sm font-medium mb-1">Target Calories</label>
                <select
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="1500">1500</option>
                  <option value="1800">1800</option>
                  <option value="2000">2000</option>
                  <option value="2200">2200</option>
                  <option value="2500">2500</option>
                  <option value="3000">3000</option>
                  <option value="3500">3500</option>
                </select>
              </div>

              {/* Cooking Time */}
              <div>
                <label className="block text-sm font-medium mb-1">Cooking Time per Meal</label>
                <select
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="<15">&lt;15 min (Quick)</option>
                  <option value="15-30">15-30 min</option>
                  <option value="30-45">30-45 min</option>
                  <option value="45-60">45-60 min</option>
                  <option value=">60">&gt;60 min (Meal Prep)</option>
                </select>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium mb-2">Dietary Restrictions</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  "Gluten-Free",
                  "Dairy-Free",
                  "Nut-Free",
                  "Soy-Free",
                  "Shellfish-Free",
                  "Halal",
                  "Kosher",
                  "Low FODMAP",
                ].map((item) => (
                  <label key={item} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictions.includes(item)}
                      onChange={() => toggleRestriction(item)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Foods to Avoid */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Foods to Avoid (comma separated)
              </label>
              <input
                type="text"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                placeholder="e.g., broccoli, mushrooms, fish"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={generatingPlan}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generatingPlan ? "Generating Your Meal Plan..." : "🚀 Generate My Meal Plan"}
            </button>
          </form>

          {/* Generated Plan */}
          {generatedPlan && (
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ✅ Your Custom Meal Plan
              </h3>
              <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed bg-white p-4 rounded">
                {generatedPlan}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={savePlan}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  💾 Save Meal Plan
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedPlan)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  📋 Copy to Clipboard
                </button>
                <Link
                  href="/meals/my-meals"
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
