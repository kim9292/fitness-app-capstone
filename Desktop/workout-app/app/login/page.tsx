"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
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
        className="absolute left-0 mt-1 px-2 py-1 text-xs bg-gray-800 text-white rounded whitespace-nowrap pointer-events-none opacity-0 transition-opacity duration-200 z-10"
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

// Initialize from localStorage
function getInitialCredentials() {
  if (typeof window === "undefined") {
    return { email: "", password: "", rememberMe: false };
  }
  const saved = localStorage.getItem("rememberMeCredentials");
  if (saved) {
    try {
      const creds = JSON.parse(saved); // creds: { [email]: password }
      return {
        email: "",
        password: "",
        rememberMe: true,
        creds,
      };
    } catch {}
  }
  return { email: "", password: "", rememberMe: false, creds: {} };
}

export default function LoginPage() {
  const initialCreds = getInitialCredentials();
  const [email, setEmail] = useState(initialCreds.email);
  const [password, setPassword] = useState(initialCreds.password);
  const [rememberMe, setRememberMe] = useState(initialCreds.rememberMe);
  const [savedCreds, setSavedCreds] = useState(initialCreds.creds || {});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Check for email from /me page redirect
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("authEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      sessionStorage.removeItem("authEmail");
    }
  }, []);

  // When email changes, auto-fill password if saved
  useEffect(() => {
    if (email && savedCreds[email]) {
      setPassword(savedCreds[email]);
    } else {
      setPassword("");
    }
  }, [email, savedCreds]);

  // Redirect if already authenticated (avoid routing in render)
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/workouts");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      // Save credentials ONLY if Remember Me is checked
      if (rememberMe) {
        const updatedCreds = { ...savedCreds, [email]: password };
        localStorage.setItem("rememberMeCredentials", JSON.stringify(updatedCreds));
        setSavedCreds(updatedCreds);
      }
      router.push("/workouts");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Title Outside the Box */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-2">Fitness App</h1>
        <p className="text-lg text-gray-400">Track, Plan & Achieve Your Goals</p>
      </div>

      {/* Login Box */}
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-blue-500/50 hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field with Tooltip */}
          <Tooltip text="Enter your registered email address">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-blue-500 cursor-help">ℹ️</span>
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </Tooltip>

          {/* Password Field with Tooltip */}
          <Tooltip text="Your password must be at least 6 characters long">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-blue-500 cursor-help">ℹ️</span>
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </Tooltip>

          {/* Remember Me with Tooltip */}
          <Tooltip text="Check this to automatically log in next time on this device">
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                suppressHydrationWarning
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer font-medium">
                Remember Me <span className="text-blue-500 cursor-help">ℹ️</span>
              </label>
            </div>
          </Tooltip>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex flex-col items-center mt-4">
          {/* Forgot Password with Tooltip */}
          <Tooltip text="Reset your password if you've forgotten it">
            <Link
              href="/login/identify"
              className="text-blue-600 hover:underline text-sm mb-2"
            >
              Forgot password? <span className="text-blue-500">ℹ️</span>
            </Link>
          </Tooltip>
        </div>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
