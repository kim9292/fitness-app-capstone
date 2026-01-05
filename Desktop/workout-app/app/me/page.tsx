"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  id?: string;
  title?: string;
  date: string;
  exercise?: Exercise[];
  notes?: string;
  _id?: string;
}

export default function MyPlansPage() {
  const [plans, setPlans] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [measurements, setMeasurements] = useState("");
  const [displayWeight, setDisplayWeight] = useState("");
  const [displayBodyFat, setDisplayBodyFat] = useState("");
  const [savingMeasurements, setSavingMeasurements] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Email check states
  const [emailInput, setEmailInput] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");

  const router = useRouter();
  const { isAuthenticated, apiCall, isLoading: authLoading, token, logout } = useAuth();

  // Redirect if not authenticated
  // No redirect - allow public viewing with limited features

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Fetch plans
  const fetchPlans = async () => {
    if (!isAuthenticated || !token) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/workouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      const plansArray = Array.isArray(data) ? data : (data.workouts || []);
      setPlans(plansArray);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load plans");
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPlans();
    loadMeasurements();
    // Fetch user info from localStorage (since we store it after login)
    const email = localStorage.getItem("userEmail") || "User";
    const createdAt = localStorage.getItem("userCreatedAt");
    setUserEmail(email);
    if (createdAt) {
      setMemberSince(new Date(createdAt).toLocaleDateString());
    }
  }, [isAuthenticated, token]);

  const handleDelete = async (id: string) => {
    if (!id) {
      alert("Cannot delete: Invalid ID");
      return;
    }
    if (!confirm("Delete this plan?")) return;

    try {
      const res = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      // Refetch plans to ensure UI is in sync with DB
      await fetchPlans();
    } catch (err: any) {
      alert("Error: " + (err.message || "Could not delete plan"));
    }
  };

  const saveMeasurements = async () => {
    setSavingMeasurements(true);
    try {
      console.log("Saving measurements:", { weight, bodyFat, measurements });
      const response = await apiCall("/api/user/measurements", {
        method: "POST",
        body: JSON.stringify({
          weight,
          bodyFat,
          measurements
        })
      });
      console.log("Save response:", response);
      if (response.error) {
        throw new Error(response.error);
      }
      alert("Measurements saved successfully!");
      // Clear input fields after successful save
      setWeight("");
      setBodyFat("");
      // Immediately reload measurements from backend to update UI
      await loadMeasurements();
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Failed to save measurements: " + (err.message || "Unknown error"));
    } finally {
      setSavingMeasurements(false);
    }
  };

  const loadMeasurements = async () => {
    try {
      console.log("Loading measurements from API...");
      const response = await apiCall("/api/user/measurements", {
        method: "GET"
      });
      console.log("Load response:", response);
      console.log("Load response.measurements:", response.measurements);
      
      if (response.measurements) {
        const w = response.measurements.weight || "";
        const bf = response.measurements.bodyFat || "";
        const m = response.measurements.other || "";
        
        console.log("Setting weight:", w);
        console.log("Setting bodyFat:", bf);
        console.log("Setting measurements:", m);
        
        // Update display values only
        setDisplayWeight(w);
        setDisplayBodyFat(bf);
        setMeasurements(m);

      } else {
        console.log("No measurements in response!");
      }
    } catch (err) {
      console.error("Failed to load measurements:", err);
    }
  };

  // Calculate stats
  const totalWorkouts = plans.length;
  const totalExercises = plans.reduce((sum, p) => sum + (p.exercise?.length || 0), 0);
  const thisWeek = plans.filter(p => {
    const date = new Date(p.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }).length;
  const thisMonth = plans.filter(p => {
    const date = new Date(p.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return date >= monthAgo;
  }).length;

  // 🔥 Calculate current workout streak (consecutive days)
  const calculateStreak = () => {
    if (plans.length === 0) return 0;
    
    // Helper function to get date string (YYYY-MM-DD)
    const getDateString = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    };
    
    // Get unique workout dates and sort newest first
    const uniqueDates = [...new Set(plans.map(p => getDateString(new Date(p.date))))];
    uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (uniqueDates.length === 0) return 0;
    
    const today = getDateString(new Date());
    const yesterday = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    // Check if most recent workout is today or yesterday
    const mostRecentWorkout = uniqueDates[0];
    if (mostRecentWorkout !== today && mostRecentWorkout !== yesterday) {
      return 0; // Streak is broken if last workout wasn't today or yesterday
    }
    
    // Count consecutive days
    let streak = 0;
    let currentCheckDate = mostRecentWorkout === today ? today : yesterday;
    
    for (const workoutDate of uniqueDates) {
      if (workoutDate === currentCheckDate) {
        streak++;
        // Move to previous day
        const prevDate = new Date(currentCheckDate);
        prevDate.setDate(prevDate.getDate() - 1);
        currentCheckDate = getDateString(prevDate);
      } else {
        // Check if we skipped a day
        const expectedDate = new Date(currentCheckDate);
        expectedDate.setDate(expectedDate.getDate() + 1);
        if (getDateString(expectedDate) !== workoutDate) {
          break; // Gap found, streak ends
        }
      }
    }
    
    return streak;
  };
  
  const currentStreak = calculateStreak();

  // 💪 Calculate total sets/volume this month
  const totalSetsThisMonth = plans.filter(p => {
    const date = new Date(p.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return date >= monthAgo;
  }).reduce((sum, workout) => {
    const workoutSets = workout.exercise?.reduce((exSum, ex) => exSum + (ex.sets || 0), 0) || 0;
    return sum + workoutSets;
  }, 0);

  // ⭐ Get last workout summary (most recent workout)
  const lastWorkout = plans.length > 0 
    ? [...plans].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Sort descending (newest first)
      })[0]
    : null;

  const aiPlans = plans.filter((p) => p.title && p.title.startsWith("AI Plan"));
  const manualPlans = plans.filter((p) => !p.title || !p.title.startsWith("AI Plan"));

  // Email check function
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingEmail(true);
    setEmailError("");

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.error || "Failed to check email");
        return;
      }

      // Store email in sessionStorage for next page
      sessionStorage.setItem("authEmail", emailInput);

      // Redirect based on whether user exists
      if (data.exists) {
        router.push("/login");
      } else {
        router.push("/register");
      }
    } catch (err) {
      console.error("Email check error:", err);
      setEmailError("An error occurred. Please try again.");
    } finally {
      setCheckingEmail(false);
    }
  };

  // Social authentication handlers (placeholders for now)
  const handleGoogleAuth = () => {
    setEmailError("Google authentication coming soon! For now, please use email/password.");
    // TODO: Implement Google OAuth
    // Example: window.location.href = '/api/auth/google';
  };

  const handleLinkedInAuth = () => {
    setEmailError("LinkedIn authentication coming soon! For now, please use email/password.");
    // TODO: Implement LinkedIn OAuth
  };

  const handleAppleAuth = () => {
    setEmailError("Apple authentication coming soon! For now, please use email/password.");
    // TODO: Implement Apple OAuth
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto p-6">
        {!isAuthenticated ? (
          // Public View - Enhanced Login/Signup Prompt
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 text-gray-800">Your Fitness Dashboard</h2>
                <p className="text-gray-600">
                  Enter your email to login or create a free account
                </p>
              </div>

              {/* Email Input Form */}
              <form onSubmit={handleEmailSubmit} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={checkingEmail}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {emailError && (
                    <p className="text-red-600 text-sm mt-2">{emailError}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={checkingEmail}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {checkingEmail ? "Checking..." : "Continue"}
                </button>
              </form>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button 
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button 
                  type="button"
                  onClick={handleLinkedInAuth}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Continue with LinkedIn
                </button>

                <button 
                  type="button"
                  onClick={handleAppleAuth}
                  className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-600 text-center leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#" className="text-purple-600 hover:underline">Terms of Use</a>
                {' '}and{' '}
                <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
              </p>
            </div>

            {/* Feature Highlights Below */}
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🎯 What You'll Get</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-gray-700">Track workout streaks & achievements</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-gray-700">Monitor body measurements</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-gray-700">Access 60+ exercise tutorials</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-gray-700">AI fitness assistant</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-gray-700">Personalized dashboard insights</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-gray-700">Meal planning & nutrition tracking</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!isLoading && (
          <>
            {/* ============ MINIMALIST PROFILE HEADER ============ */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-b-2 border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
                  <p className="text-gray-600">{userEmail}</p>
                  {memberSince && (
                    <p className="text-sm text-gray-500">Member since {memberSince}</p>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* ============ KEY METRICS SECTION ============ */}
            <div className="mb-8">
              {/* 🔥 CURRENT STREAK - Hero Stat */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-8 mb-8 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">🔥 Current Streak</h2>
                  {currentStreak >= 7 && <span className="text-4xl">🏆</span>}
                </div>
                <p className="text-6xl font-bold mb-2">{currentStreak}</p>
                <p className="text-lg opacity-90 mb-4">
                  {currentStreak === 1 ? 'day' : 'days'} in a row
                </p>
                {/* Progress bar */}
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${Math.min((currentStreak / 30) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm opacity-80">
                  {currentStreak === 0 
                    ? "Start today to begin your streak! 💪" 
                    : currentStreak < 7
                    ? `${7 - currentStreak} days to a week!`
                    : "Amazing consistency! 🎉"}
                </p>
              </div>

              {/* Stats Grid (2x2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* � Volume This Month */}
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
                  <p className="text-sm font-semibold text-gray-700 mb-3">� Monthly Volume</p>
                  <p className="text-5xl font-bold text-indigo-600 mb-2">{totalSetsThisMonth}</p>
                  <p className="text-gray-600 mb-4">total sets</p>
                  {/* Progress bar for volume goal (300 sets target) */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${Math.min((totalSetsThisMonth / 300) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Target: 300 sets ({totalSetsThisMonth}/300)
                  </p>
                </div>

                {/* ⭐ Last Workout */}
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500">
                  <p className="text-sm font-semibold text-gray-700 mb-3">⭐ Last Workout</p>
                  {lastWorkout ? (
                    <>
                      <p className="text-2xl font-bold text-pink-600 mb-2 truncate">
                        {lastWorkout.title || 'Workout'}
                      </p>
                      <p className="text-gray-600 mb-1">
                        {new Date(lastWorkout.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-600">
                        {lastWorkout.exercise?.length || 0} exercises
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">No workouts yet</p>
                  )}
                </div>
              </div>

              {/* Other Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-blue-500">
                  <p className="text-2xl font-bold text-blue-600">{totalWorkouts}</p>
                  <p className="text-sm text-gray-600">Total Workouts</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-green-500">
                  <p className="text-2xl font-bold text-green-600">{totalExercises}</p>
                  <p className="text-sm text-gray-600">Total Exercises</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-yellow-500">
                  <p className="text-2xl font-bold text-yellow-600">{thisWeek}</p>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-purple-500">
                  <p className="text-2xl font-bold text-purple-600">{thisMonth}</p>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
              </div>
            </div>

            {/* ============ BODY MEASUREMENTS SECTION ============ */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Body Measurements</h2>
              
              {/* Current Measurements Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-l-4 border-purple-500">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Weight</p>
                  <p className="text-4xl font-bold text-purple-600 mb-1">
                    {displayWeight || <span className="text-gray-400">--</span>}
                  </p>
                  <p className="text-sm text-gray-600">{displayWeight ? "lbs" : "Not set"}</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Body Fat</p>
                  <p className="text-4xl font-bold text-blue-600 mb-1">
                    {displayBodyFat || <span className="text-gray-400">--</span>}
                  </p>
                  <p className="text-sm text-gray-600">{displayBodyFat ? "%" : "Not set"}</p>
                </div>
              </div>

              {/* Update Form */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Your Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Enter weight"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Body Fat (%)</label>

              
                    <input
                      type="number"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      placeholder="Enter body fat %"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={saveMeasurements}
                  disabled={savingMeasurements}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-60"
                >
                  {savingMeasurements ? "Saving..." : "💾 Save Measurements"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Plans Section */}
        {!isLoading && aiPlans.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🤖 AI-Generated Plans</h2>
            <div className="grid gap-4">
              {aiPlans.map((plan) => {
                const id = plan.id || plan._id || "";
                const isExpanded = expandedId === id;
                return (
                  <div
                    key={id}
                    className="bg-white rounded-lg shadow-md border-l-4 border-purple-600 overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{plan.title}</h3>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(plan.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-2xl">{isExpanded ? "▼" : "▶"}</span>
                    </div>

                    {isExpanded && (
                      <div className="border-t p-4 bg-gray-50">
                        <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed bg-white p-3 rounded mb-4">
                          {plan.notes || "No details"}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(plan.notes || "")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                          >
                            📋 Copy
                          </button>
                          <button
                            onClick={() => handleDelete(id || "")}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isLoading && manualPlans.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">💪 Manual Workouts</h2>
            <div className="grid gap-4">
              {manualPlans.map((plan) => {
                const id = plan.id || plan._id || "";
                const isExpanded = expandedId === id;
                return (
                  <div
                    key={id}
                    className="bg-white rounded-lg shadow-md border-l-4 border-blue-600 overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{plan.title}</h3>
                        <p className="text-sm text-gray-500">
                          {plan.exercise?.length || 0} exercises •{" "}
                          {new Date(plan.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-2xl">{isExpanded ? "▼" : "▶"}</span>
                    </div>

                    {isExpanded && (
                      <div className="border-t p-4 bg-gray-50">
                        {plan.exercise && plan.exercise.length > 0 ? (
                          <div className="bg-white p-3 rounded mb-4">
                            {plan.exercise.map((ex, idx) => (
                              <div key={idx} className="mb-3 pb-3 border-b last:border-b-0">
                                <p className="font-medium text-gray-800">{ex.name}</p>
                                <p className="text-sm text-gray-600">
                                  {ex.sets} × {ex.reps} reps
                                  {ex.weight && ` @ ${ex.weight} lbs`}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {plan.notes && (
                          <div className="bg-white p-3 rounded mb-4 text-sm text-gray-700">
                            <p className="font-medium mb-1">Notes:</p>
                            <p>{plan.notes}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Link
                            href={`/workouts?edit=${id}`}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(id || "")}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
}
