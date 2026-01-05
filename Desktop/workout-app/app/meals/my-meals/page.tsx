"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Header from "@/app/components/Header";

interface MealPlan {
  id: string;
  title: string;
  date: string;
  plan: string;
  calories?: number;
  mealsPerDay?: number;
}

export default function MyMealsPage() {
  const { token } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    if (token) {
      fetchMealPlans();
    }
  }, [token]);

  const fetchMealPlans = async () => {
    try {
      const res = await fetch("/api/meals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load meal plans");
        return;
      }
      const data = await res.json();
      setMealPlans(data.mealPlans || []);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this meal plan?")) return;
    
    setError(""); // Clear any previous errors
    
    try {
      const res = await fetch(`/api/meals/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to delete");
        alert("Failed to delete: " + (data.error || "Unknown error"));
        return;
      }
      
      // Immediately update local state for instant UI feedback
      setMealPlans((currentPlans) => currentPlans.filter((p) => p.id !== id));
      
      // Clear selected plan if it was deleted
      if (selectedPlan?.id === id) {
        setSelectedPlan(null);
      }
      
      alert("Meal plan deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Network error");
      console.error("Delete error:", err);
      alert("Error deleting meal plan: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-white text-center py-12">Loading your meal plans...</div>
        ) : mealPlans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Meal Plans Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first AI-generated meal plan to get started!
            </p>
            <Link
              href="/meals/ai"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
            >
              Generate Meal Plan
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Meal Plans List */}
            <div className="md:col-span-1 space-y-3">
              <h2 className="text-white font-bold text-lg mb-3">Your Plans ({mealPlans.length})</h2>
              {mealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? "ring-2 ring-green-500 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <h3 className="font-semibold text-gray-800 mb-1">{plan.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(plan.date).toLocaleDateString()}
                  </p>
                  {plan.calories && (
                    <p className="text-xs text-green-600 mt-1">
                      {plan.calories} cal • {plan.mealsPerDay} meals/day
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Plan Details */}
            <div className="md:col-span-2">
              {selectedPlan ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedPlan.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Created {new Date(selectedPlan.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePlan(selectedPlan.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  <div className="border-t pt-4">
                    <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
                      {selectedPlan.plan}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex gap-3">
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedPlan.plan)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      📋 Copy Plan
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <p className="text-gray-600">Select a meal plan to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link href="/meals" className="text-white hover:text-green-200">
            ← Back to Meals
          </Link>
        </div>
      </main>
    </div>
  );
}
