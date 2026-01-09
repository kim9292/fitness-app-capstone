"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Header from "@/app/components/Header";

interface Habit {
  id: string;
  name: string;
  icon: string;
  target?: number;
  unit?: string;
}

interface HabitLog {
  habitId: string;
  date: string;
  completed: boolean;
  value?: number;
}

const DEFAULT_HABITS: Habit[] = [
  { id: "water", name: "Drink Water", icon: "💧", target: 8, unit: "glasses" },
  { id: "steps", name: "Steps", icon: "👟", target: 10000, unit: "steps" },
  { id: "stretch", name: "Stretch", icon: "🧘", target: 1, unit: "session" },
  { id: "protein", name: "Protein Goal", icon: "🥩", target: 150, unit: "g" },
  { id: "sleep", name: "Sleep", icon: "😴", target: 8, unit: "hours" },
];

const MOTIVATIONAL_QUOTES = [
  "Excellence is not a destination; it is a continuous journey that never ends.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Your future is created by what you do today, not tomorrow.",
  "Small daily improvements are the key to staggering long-term results.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Success doesn't come from what you do occasionally, it comes from what you do consistently.",
];

export default function HabitsPage() {
  const { isAuthenticated, apiCall, isLoading } = useAuth();
  const [habits] = useState<Habit[]>(DEFAULT_HABITS);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [todayLogs, setTodayLogs] = useState<Map<string, HabitLog>>(new Map());
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Get today's date in local timezone (YYYY-MM-DD)
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (isAuthenticated) {
      loadHabits();
    }
  }, [isAuthenticated]);

  const loadHabits = async () => {
    try {
      console.log('=== Loading habits from API ===');
      const response = await apiCall("/api/user/habits", { method: "GET" });
      console.log('API Response:', response);
      
      if (response?.logs) {
        console.log('Total logs loaded:', response.logs.length);
        
        // Show logs for today specifically
        const todayLogsFromDB = response.logs.filter((log: HabitLog) => log.date === today);
        console.log(`📅 Today's logs (${today}):`, todayLogsFromDB);
        
        // Show completed logs
        const completedToday = todayLogsFromDB.filter((log: HabitLog) => log.completed);
        console.log(`✅ Completed today: ${completedToday.length}`, completedToday);
        
        setLogs(response.logs);
        
        // Build today's map
        const todayMap = new Map<string, HabitLog>();
        todayLogsFromDB.forEach((log: HabitLog) => todayMap.set(log.habitId, log));
        
        setTodayLogs(todayMap);
        
        // Calculate and log streaks for debugging
        console.log('🔥 Current streaks:');
        habits.forEach(habit => {
          const streak = calculateStreakFromLogs(habit.id, response.logs);
          console.log(`  ${habit.name}: ${streak} days`);
        });
      } else {
        console.log('No logs in response!');
      }
    } catch (err) {
      console.error("Failed to load habits:", err);
    }
  };

  const calculateStreakFromLogs = (habitId: string, logsArray: HabitLog[]): number => {
    const habitLogs = logsArray
      .filter((log) => log.habitId === habitId && log.completed)
      .map((log) => log.date)
      .sort()
      .reverse();

    if (habitLogs.length === 0) return 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Must have today or yesterday to count
    if (habitLogs[0] !== today && habitLogs[0] !== yesterdayStr) return 0;

    let streak = 0;
    let checkDate = habitLogs[0] === today ? today : yesterdayStr;

    for (const logDate of habitLogs) {
      if (logDate === checkDate) {
        streak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split("T")[0];
      } else {
        break;
      }
    }

    return streak;
  };

  const toggleHabit = async (habitId: string) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    const existing = todayLogs.get(habitId);
    const currentlyCompleted = existing?.completed || false;
    
    const newCompleted = !currentlyCompleted; // Toggle between checked and unchecked

    console.log(`=== Toggling ${habitId} ===`);
    console.log('Current state:', currentlyCompleted);
    console.log('New state:', newCompleted);

    // Create new log entry
    const newLog: HabitLog = {
      habitId,
      date: today,
      completed: newCompleted,
    };
    
    // Create completely new Map to force re-render
    const newTodayMap = new Map();
    todayLogs.forEach((value, key) => {
      if (key !== habitId) {
        newTodayMap.set(key, value);
      }
    });
    newTodayMap.set(habitId, newLog);
    
    // Update logs array - remove old entry for this habit today
    const updatedLogs = logs.filter(
      (log) => !(log.habitId === habitId && log.date === today)
    );
    
    // Add new log entry
    updatedLogs.push(newLog);
    
    console.log('New todayMap size:', newTodayMap.size);
    console.log('Updated logs length:', updatedLogs.length);
    
    // Update state
    setTodayLogs(newTodayMap);
    setLogs(updatedLogs);

    try {
      const response = await apiCall("/api/user/habits", {
        method: "POST",
        body: JSON.stringify({
          habitId,
          date: today,
          completed: newCompleted,
        }),
      });
      
      console.log('Habit saved successfully:', response);
      
      if (response?.error) {
        console.error("API error:", response.error);
        await loadHabits();
      }
    } catch (err) {
      console.error("Failed to save habit:", err);
      await loadHabits();
    }
  };

  const resetTodayHabits = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    console.log('=== Resetting today\'s habits ===');
    
    // First, ensure all habits are marked as completed in the database
    try {
      console.log('Saving all habits as completed...');
      const savePromises = habits.map(habit => 
        apiCall("/api/user/habits", {
          method: "POST",
          body: JSON.stringify({
            habitId: habit.id,
            date: today,
            completed: true,
          }),
        })
      );
      
      const results = await Promise.all(savePromises);
      console.log('All habits saved. Results:', results);
      
      // Reload habits from database to get the updated logs
      console.log('Reloading habits from database...');
      await loadHabits();
      console.log('Reload complete! Check streaks now.');
      
    } catch (err) {
      console.error('ERROR in resetTodayHabits:', err);
      return; // Don't proceed if there's an error
    }
    
    // Now reset the UI to allow another round (this doesn't affect the database)
    const newTodayMap = new Map();
    habits.forEach(habit => {
      newTodayMap.set(habit.id, {
        habitId: habit.id,
        date: today,
        completed: false
      });
    });
    setTodayLogs(newTodayMap);
    setShowCelebration(false);
    
    console.log('✅ UI reset complete - you can do another round!');
  };

  const calculateStreak = (habitId: string): number => {
    return calculateStreakFromLogs(habitId, logs);
  };

  const todayCompleted = Array.from(todayLogs.values()).filter(
    (log) => log.completed === true
  ).length;
  const todayTotal = habits.length;
  
  console.log('Today completed:', todayCompleted, 'Total:', todayTotal);
  console.log('TodayLogs Map:', Array.from(todayLogs.entries()));
  
  // Track if all habits were completed to show celebration once
  useEffect(() => {
    if (todayCompleted === todayTotal && todayTotal > 0 && !showCelebration) {
      // Auto-show celebration when all habits are completed
      setShowCelebration(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [todayCompleted, todayTotal]);

  // Calculate next milestone
  const getNextMilestone = (): string => {
    const maxStreak = habits.reduce((max, habit) => Math.max(max, calculateStreak(habit.id)), 0);
    if (maxStreak === 0) return "Complete today to start your streak!";
    if (maxStreak < 3) return `${3 - maxStreak} more days until 3-day streak! 🔥`;
    if (maxStreak < 7) return `${7 - maxStreak} more days until 1-week streak! 🎯`;
    if (maxStreak < 14) return `${14 - maxStreak} more days until 2-week streak! 💪`;
    if (maxStreak < 30) return `${30 - maxStreak} more days until 1-month streak! 🏆`;
    return "You're on fire! Keep the momentum! 🔥🔥🔥";
  };

  // Get random motivational quote
  const getMotivationalQuote = (): string => {
    // Use today's date to pick the same quote all day
    const dateNumber = new Date(today).getDate() + new Date(today).getMonth() * 31;
    const quoteIndex = dateNumber % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[quoteIndex];
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
      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white p-8 shadow-xl mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">✨ Daily Habits Tracker</h1>
              <p className="text-purple-100">Build better habits, one day at a time</p>
            </div>
          </div>
          
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{todayCompleted}/{todayTotal}</p>
              <p className="text-sm text-purple-100">Today's Progress</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">
                {Math.round((todayCompleted / todayTotal) * 100)}%
              </p>
              <p className="text-sm text-purple-100">Completion Rate</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">
                {habits.reduce((max, habit) => Math.max(max, calculateStreak(habit.id)), 0)}
              </p>
              <p className="text-sm text-purple-100">Longest Streak 🔥</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 -mt-8">
        {!isAuthenticated && (
          <div className="mt-4 mb-8 bg-white border border-yellow-200 text-yellow-900 rounded-2xl p-6 md:p-7 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-semibold">Browse only mode</div>
              <div className="text-sm text-yellow-800">Sign in to save progress, track streaks, and sync habits across devices.</div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/login" className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold shadow hover:bg-yellow-600 transition">Sign in</Link>
              <Link href="/register" className="px-4 py-2 rounded-lg bg-white text-yellow-900 font-semibold border border-yellow-300 hover:bg-yellow-100 transition">Create account</Link>
            </div>
          </div>
        )}

        {/* Today's Progress Card - Elevated Design */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Today's Mission
            </h2>
            {todayCompleted === todayTotal && todayTotal > 0 && !showCelebration && (
              <button
                onClick={() => setShowCelebration(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all animate-pulse hover:animate-none"
              >
                <span className="text-2xl">🎉</span>
                <span className="font-bold">All Done! Click Me!</span>
              </button>
            )}
          </div>
          
          <div className="relative">
            <div className="flex justify-between mb-3">
              <span className="text-lg font-semibold text-gray-700">
                {todayCompleted} of {todayTotal} habits completed
              </span>
              <span className="text-lg font-bold text-purple-600">
                {Math.round((todayCompleted / todayTotal) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full h-4 transition-all duration-500 ease-out shadow-lg"
                style={{
                  width: `${(todayCompleted / todayTotal) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Habit Cards - Card Grid Layout */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></span>
            Your Habits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {habits.map((habit) => {
              const isCompleted = todayLogs.get(habit.id)?.completed || false;
              const streak = calculateStreak(habit.id);

              return (
                <div
                  key={habit.id}
                  className={`group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                    isCompleted
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400"
                      : "bg-white border-2 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {/* Decorative corner */}
                  {isCompleted && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 opacity-20 rounded-bl-full"></div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => toggleHabit(habit.id)}
                          disabled={!isAuthenticated}
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed ${
                            isCompleted
                              ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white scale-105"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-purple-100 hover:to-pink-100"
                          }`}
                        >
                          {isCompleted ? "✓" : habit.icon}
                        </button>
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-1 ${
                            isCompleted ? "text-green-700" : "text-gray-800"
                          }`}>
                            {habit.name}
                          </h3>
                          {habit.target && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                              <p className="text-sm text-gray-600">
                                Target: <span className="font-semibold">{habit.target} {habit.unit}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Streak Badge */}
                      {streak > 0 && (
                        <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-xl px-4 py-2 shadow-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🔥</span>
                            <div className="text-right">
                              <p className="text-2xl font-bold leading-none">
                                {streak}
                              </p>
                              <p className="text-xs opacity-90">days</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress indicator for this week */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-1">
                        {[...Array(7)].map((_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (6 - i));
                          const dateStr = date.toISOString().split("T")[0];
                          const logCompleted = logs.find(
                            (log) => log.habitId === habit.id && log.date === dateStr
                          )?.completed;

                          return (
                            <div
                              key={i}
                              className={`flex-1 h-2 rounded-full transition-all ${
                                logCompleted
                                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                  : "bg-gray-200"
                              }`}
                              title={dateStr}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">Last 7 days</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Stats - Modern Cards */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></span>
            This Week's Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {habits.map((habit) => {
              const thisWeekLogs = logs.filter((log) => {
                const logDate = new Date(log.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return (
                  log.habitId === habit.id &&
                  log.completed &&
                  logDate >= weekAgo
                );
              });

              const percentage = Math.round((thisWeekLogs.length / 7) * 100);

              return (
                <div
                  key={habit.id}
                  className="relative text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg group"
                >
                  <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                    {habit.icon}
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                    {thisWeekLogs.length}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">of 7 days</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-1.5 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Celebration Toast Notification */}
        {showCelebration && (
          <div className="fixed top-6 right-6 z-50 animate-slide-in-right max-w-md">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-6 border-4 border-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">🎉</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">All Habits Complete!</h3>
                  <p className="text-green-100 text-sm">Amazing work today! 💪</p>
                </div>
                <button 
                  onClick={() => setShowCelebration(false)}
                  className="text-white hover:text-green-100 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              {/* Daily Summary */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <h4 className="font-bold mb-2 text-sm">📊 Today's Summary</h4>
                <div className="space-y-1 text-sm">
                  {habits.map(habit => {
                    const isCompleted = todayLogs.get(habit.id)?.completed;
                    return isCompleted ? (
                      <div key={habit.id} className="flex items-center gap-2">
                        <span>{habit.icon}</span>
                        <span className="flex-1">{habit.name}</span>
                        <span className="text-xs opacity-90">✓</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Next Milestone */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-4">
                <p className="text-sm font-semibold">🎯 {getNextMilestone()}</p>
              </div>

              {/* Motivational Quote */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <p className="text-sm italic">"{getMotivationalQuote()}"</p>
              </div>
            </div>
          </div>
        )}

        {showAuthPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign in to track habits</h3>
              <p className="text-sm text-gray-700 mb-4">Create a free account to save progress, streaks, and sync across devices.</p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/login" className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition">Sign in</Link>
                <Link href="/register" className="px-4 py-2 rounded-lg bg-white text-purple-700 font-semibold border border-purple-200 hover:bg-purple-50 transition">Create account</Link>
                <button
                  onClick={() => setShowAuthPrompt(false)}
                  className="ml-auto text-sm text-gray-600 hover:text-gray-800"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
