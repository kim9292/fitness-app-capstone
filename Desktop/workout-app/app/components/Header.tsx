"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      {/* Navigation */}
      <div className="flex justify-center p-6 relative z-20 bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="relative flex items-center justify-center w-full max-w-7xl px-6">
          <Link href="/" className="text-3xl font-bold text-white hover:text-blue-400 transition-colors text-center">
            FitTrack Pro
          </Link>

          <div className="flex gap-4 items-center absolute right-6">
            {/* Hamburger Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ☰
            </button>
            
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="hidden sm:block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block bg-white/20 hover:bg-white/30 backdrop-blur text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Login
                </Link>
                <Link href="/register" className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-10" onClick={() => setMenuOpen(false)}>
          <div className="bg-slate-900 w-full sm:w-96 ml-auto h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <button
                onClick={() => setMenuOpen(false)}
                className="text-white text-2xl mb-6 hover:bg-white/10 p-2 rounded"
              >
                ✕
              </button>

              {/* Description */}
              <div className="mb-6">
                <p className="text-lg text-gray-200">
                  Your personal fitness companion designed to help you achieve your health and wellness goals with precision and ease.
                </p>
              </div>

              {/* Mission Statement */}
              <div className="bg-blue-900/30 backdrop-blur border border-blue-500/30 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-3">Our Mission</h2>
                <p className="text-gray-200 text-sm">
                  To empower individuals on their fitness journey by providing intelligent, personalized tools that make workout planning, nutrition tracking, and progress monitoring effortless and enjoyable.
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
                <div className="space-y-3">
                  <Link href="/workouts" onClick={() => setMenuOpen(false)}>
                    <FeatureCard
                      title="Workout Planning"
                      description="Create and manage personalized workout routines."
                    />
                  </Link>
                  <Link href="/meals" onClick={() => setMenuOpen(false)}>
                    <FeatureCard
                      title="Meal Tracking"
                      description="Log your meals and track nutrition with insights."
                    />
                  </Link>
                  <Link href="/me" onClick={() => setMenuOpen(false)}>
                    <FeatureCard
                      title="Progress Tracking"
                      description="Monitor measurements and fitness milestones."
                    />
                  </Link>
                  <Link href="/exercises" onClick={() => setMenuOpen(false)}>
                    <FeatureCard
                      title="Exercise Library"
                      description="Access comprehensive database of exercises."
                    />
                  </Link>
                  <Link href="/habits" onClick={() => setMenuOpen(false)}>
                    <FeatureCard
                      title="Habit Building"
                      description="Track healthy habits for consistency."
                    />
                  </Link>
                  <Link href="/faq" onClick={() => setMenuOpen(false)}>
                    <FeatureCard
                      title="FAQ"
                      description="Get answers to common questions."
                    />
                  </Link>
                </div>
              </div>

              {/* Goals */}
              <div className="bg-purple-900/30 backdrop-blur border border-purple-500/30 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Our Goals</h2>
                <ul className="space-y-2 text-gray-200 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Build sustainable fitness habits that last a lifetime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Provide data-driven insights for optimal plans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Create a supportive health community</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Make fitness accessible for everyone</span>
                  </li>
                </ul>
              </div>

              {/* Mobile Auth Links */}
              {isAuthenticated ? (
                <div className="sm:hidden">
                  <button
                    onClick={logout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-center"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:hidden">
                  <Link href="/login" className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-colors text-center">
                    Login
                  </Link>
                  <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-center">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
}
