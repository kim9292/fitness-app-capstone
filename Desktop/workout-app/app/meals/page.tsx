"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import SimpleCarousel from "@/app/components/SimpleCarousel";
import Header from "@/app/components/Header";

interface MealPlan {
  id: string;
  title: string;
  date: string;
  calories?: number;
  mealsPerDay?: number;
}

// Mock food database with nutrition info
const FOOD_DATABASE: { [key: string]: { calories: number; protein: number; carbs: number; fat: number; fiber: number; serving: string } } = {
  // Proteins
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, serving: "100g" },
  "ground beef": { calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0, serving: "100g" },
  "salmon": { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, serving: "100g" },
  "tuna": { calories: 132, protein: 29, carbs: 0, fat: 1.3, fiber: 0, serving: "100g canned in water" },
  "turkey": { calories: 189, protein: 26, carbs: 0, fat: 8.5, fiber: 0, serving: "100g" },
  "pork chop": { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, serving: "100g" },
  "tofu": { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.4, serving: "100g" },
  "egg": { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, serving: "1 large" },
  "cottage cheese": { calories: 98, protein: 11, carbs: 3.4, fat: 5, fiber: 0, serving: "100g" },
  "lentils": { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 3.8, serving: "100g cooked" },
  "black beans": { calories: 84, protein: 6, carbs: 15, fat: 0.3, fiber: 3.6, serving: "100g cooked" },
  "shrimp": { calories: 99, protein: 24, carbs: 0, fat: 0.3, fiber: 0, serving: "100g" },
  "chicken thigh": { calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0, serving: "100g" },
  
  // Grains & Carbs
  "brown rice": { calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8, serving: "100g cooked" },
  "white rice": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, serving: "100g cooked" },
  "pasta": { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, serving: "100g cooked" },
  "oats": { calories: 389, protein: 17, carbs: 66, fat: 6.9, fiber: 10.6, serving: "100g" },
  "quinoa": { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, serving: "100g cooked" },
  "whole wheat bread": { calories: 247, protein: 8, carbs: 47, fat: 1.2, fiber: 6.8, serving: "100g" },
  "white bread": { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, serving: "100g" },
  "bagel": { calories: 245, protein: 9, carbs: 48, fat: 1.5, fiber: 2.5, serving: "1 bagel" },
  "cereal": { calories: 130, protein: 3, carbs: 27, fat: 1, fiber: 1.6, serving: "40g (1 cup)" },
  "sweet potato": { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, serving: "100g" },
  "ramen": { calories: 188, protein: 5.5, carbs: 27, fat: 7, fiber: 1.2, serving: "1 packet cooked" },
  
  // Vegetables
  "broccoli": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.4, serving: "100g" },
  "spinach": { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, serving: "100g" },
  "carrots": { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, serving: "100g" },
  "broccoli": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.4, serving: "100g" },
  "tomato": { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, serving: "100g" },
  "bell pepper": { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2, serving: "100g" },
  "lettuce": { calories: 15, protein: 1.2, carbs: 2.9, fat: 0.2, fiber: 1.3, serving: "100g" },
  "cucumber": { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, serving: "100g" },
  "onion": { calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7, serving: "100g" },
  "mushroom": { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, serving: "100g" },
  "green beans": { calories: 31, protein: 1.8, carbs: 7, fat: 0.2, fiber: 1.8, serving: "100g" },
  "cauliflower": { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2.4, serving: "100g" },
  "zucchini": { calories: 21, protein: 1.5, carbs: 3.7, fat: 0.4, fiber: 1.1, serving: "100g" },
  
  // Fruits
  "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, serving: "1 medium" },
  "apple": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, serving: "1 medium" },
  "orange": { calories: 47, protein: 0.9, carbs: 12, fat: 0.3, fiber: 2.4, serving: "1 medium" },
  "strawberry": { calories: 32, protein: 0.8, carbs: 8, fat: 0.3, fiber: 2, serving: "100g" },
  "blueberry": { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, serving: "100g" },
  "watermelon": { calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, serving: "100g" },
  "grapes": { calories: 67, protein: 0.7, carbs: 17, fat: 0.2, fiber: 0.9, serving: "100g" },
  "peach": { calories: 39, protein: 0.9, carbs: 10, fat: 0.3, fiber: 1.5, serving: "1 medium" },
  "pear": { calories: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1, serving: "1 medium" },
  "pineapple": { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, serving: "100g" },
  
  // Dairy
  "greek yogurt": { calories: 59, protein: 10, carbs: 3.3, fat: 0.4, fiber: 0, serving: "100g" },
  "milk": { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, serving: "100ml" },
  "cheese": { calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, serving: "100g" },
  "cheddar cheese": { calories: 403, protein: 23, carbs: 3.6, fat: 33, fiber: 0, serving: "100g" },
  "mozzarella": { calories: 280, protein: 28, carbs: 3.1, fat: 17, fiber: 0, serving: "100g" },
  
  // Nuts & Seeds
  "almonds": { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, serving: "100g" },
  "peanuts": { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, serving: "100g" },
  "walnuts": { calories: 654, protein: 9, carbs: 14, fat: 65, fiber: 6.7, serving: "100g" },
  "peanut butter": { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, serving: "100g" },
  "almond butter": { calories: 614, protein: 22, carbs: 19, fat: 56, fiber: 10, serving: "100g" },
  "chia seeds": { calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34.4, serving: "100g" },
  
  // Oils & Condiments
  "olive oil": { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, serving: "1 tbsp" },
  "coconut oil": { calories: 892, protein: 0, carbs: 0, fat: 99, fiber: 0, serving: "1 tbsp" },
  "butter": { calories: 717, protein: 0.9, carbs: 0, fat: 81, fiber: 0, serving: "100g" },
  "honey": { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2, serving: "100g" },
  "jam": { calories: 278, protein: 0.5, carbs: 70, fat: 0.1, fiber: 0.7, serving: "100g" },
  
  // Common Meals & Snacks
  "pizza": { calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 1.5, serving: "1 slice" },
  "burger": { calories: 540, protein: 28, carbs: 41, fat: 28, fiber: 2, serving: "1 burger" },
  "hot dog": { calories: 290, protein: 10, carbs: 27, fat: 17, fiber: 0, serving: "1 hot dog" },
  "chicken nuggets": { calories: 320, protein: 17, carbs: 30, fat: 17, fiber: 0, serving: "6 pieces" },
  "french fries": { calories: 365, protein: 3.4, carbs: 48, fat: 17, fiber: 4.2, serving: "100g" },
  "doughnut": { calories: 452, protein: 8, carbs: 51, fat: 25, fiber: 0, serving: "1 doughnut" },
  "ice cream": { calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0, serving: "100g" },
  "chocolate": { calories: 546, protein: 8, carbs: 57, fat: 31, fiber: 7, serving: "100g" },
};


function FoodNutritionLookup() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setSearchResults([]);
    } else {
      const results = Object.keys(FOOD_DATABASE).filter(food =>
        food.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  const selectedFoodData = selectedFood ? FOOD_DATABASE[selectedFood] : null;

  return (
    <div className="space-y-6">
      <div>
        <input
          type="text"
          placeholder="Search foods (e.g., chicken, rice, broccoli)..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-800"
        />
        {searchTerm.trim() !== "" && (
          <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden">
            {searchResults.length > 0 ? (
              searchResults.map((food) => (
                <button
                  key={food}
                  onClick={() => {
                    setSelectedFood(food);
                    setSearchTerm(food);
                    setSearchResults([]);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-green-50 border-b border-gray-200 last:border-b-0 text-gray-800"
                >
                  {food.charAt(0).toUpperCase() + food.slice(1)}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-600 text-sm">
                No foods found matching "{searchTerm}". Try: chicken, rice, salmon, eggs, banana...
              </div>
            )}
          </div>
        )}
      </div>

      {selectedFoodData && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
          <h4 className="text-2xl font-bold text-gray-800 mb-2 capitalize">{selectedFood}</h4>
          <p className="text-sm text-gray-600 mb-6">per {selectedFoodData.serving}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600">Calories</p>
              <p className="text-2xl font-bold text-green-600">{selectedFoodData.calories}</p>
              <p className="text-xs text-gray-500">kcal</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600">Protein</p>
              <p className="text-2xl font-bold text-blue-600">{selectedFoodData.protein}g</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-gray-600">Carbs</p>
              <p className="text-2xl font-bold text-yellow-600">{selectedFoodData.carbs}g</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-gray-600">Fat</p>
              <p className="text-2xl font-bold text-orange-600">{selectedFoodData.fat}g</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-gray-600">Fiber</p>
              <p className="text-2xl font-bold text-purple-600">{selectedFoodData.fiber}g</p>
            </div>
          </div>
        </div>
      )}

      {!selectedFood && searchTerm === "" && (
        <div className="text-center py-8 text-gray-600">
          <p>💡 Search for any food to see nutrition information</p>
          <p className="text-sm mt-2">Try: chicken, rice, banana, salmon, eggs...</p>
        </div>
      )}
    </div>
  );
}

export default function MealsPage() {
  const { token } = useAuth();
  const [recentPlans, setRecentPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchRecentPlans();
    }
  }, [token]);

  const fetchRecentPlans = async () => {
    try {
      const res = await fetch("/api/meals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRecentPlans((data.mealPlans || []).slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to fetch recent plans:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto p-6">
        {!token ? (
          // Public View - Show Login Prompt
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Track Your Nutrition</h2>
            <p className="text-gray-600 mb-6">
              Create personalized meal plans, track your calories, and maintain a healthy diet.
            </p>
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg h-64">
              <SimpleCarousel
                intervalMs={5000}
                images={[
                  { src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&h=600&fit=crop", alt: "Healthy salad" },
                  { src: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1600&h=600&fit=crop", alt: "Meal prep" },
                  { src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&h=600&fit=crop", alt: "Nutrition" },
                ]}
                className="h-full"
              />
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Available Right Now (No Login):</h3>
              <ul className="text-left text-gray-700 space-y-2 max-w-md mx-auto text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>View sample meal plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>View nutrition inspiration images</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Learn about meal planning features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Explore the app</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">🔓 Unlock by Logging In:</h3>
              <ul className="text-left text-gray-700 space-y-2 max-w-md mx-auto text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>AI-powered meal planning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Track calories and macros</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Save custom meal plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>View nutrition history</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center mb-12">
              <Link href="/register" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium">
                Sign Up Free
              </Link>
              <Link href="/login" className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium">
                Login
              </Link>
            </div>

            {/* Food Nutrition Lookup */}
            <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">🔍 Food Nutrition Lookup</h3>
              <p className="text-gray-600 mb-6">Search for any food and see complete nutrition information</p>
              
              <FoodNutritionLookup />
            </div>
          </div>
        ) : (
          <>
            {/* Carousel - Show only if no meal plans */}
            {!loading && recentPlans.length === 0 && (
              <div className="mb-8 rounded-lg overflow-hidden shadow-lg h-64">
                <SimpleCarousel
                  intervalMs={5000}
                  images={[
                    { src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&h=600&fit=crop", alt: "Healthy salad" },
                    { src: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1600&h=600&fit=crop", alt: "Meal prep" },
                    { src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&h=600&fit=crop", alt: "Nutrition" },
                  ]}
                  className="h-full"
                />
              </div>
            )}

            {/* Recent Meal Plans */}
            <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">My Meal Plans</h3>
            <div className="flex gap-3">
              <Link href="/meals/ai" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                + Create Plan
              </Link>
              {recentPlans.length > 0 && (
                <Link href="/meals/my-meals" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  View All
                </Link>
              )}
            </div>
          </div>
          
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading your meal plans...</p>
          ) : recentPlans.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">No meal plans yet</h4>
              <p className="text-gray-600 mb-6">Create your first meal plan to get started</p>
              <Link href="/meals/ai" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">
                Create Meal Plan
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {recentPlans.map((plan) => (
                <Link key={plan.id} href="/meals/my-meals">
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all cursor-pointer">
                    <h4 className="font-semibold text-gray-800 mb-1">{plan.title}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(plan.date).toLocaleDateString()}
                    </p>
                    {plan.calories && (
                      <p className="text-xs text-green-600 mt-2">
                        {plan.calories} cal • {plan.mealsPerDay} meals/day
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <Link href="/me" className="text-white hover:text-green-200">
            ← Back to Dashboard
          </Link>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
