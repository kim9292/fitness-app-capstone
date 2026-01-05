"use client";

// Auth Context for application authentication
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { ReactElement } from "react";

interface AuthContextType {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  apiCall: (url: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    console.log('🔐 Loading auth from localStorage...');
    const savedToken = localStorage.getItem("token");
    const savedUserId = localStorage.getItem("userId");
    console.log('🔐 Saved token exists:', !!savedToken);
    console.log('🔐 Saved userId:', savedUserId);
    
    if (savedToken) {
      setToken(savedToken);
      setUserId(savedUserId);
      console.log('✅ Auth restored from localStorage');
    } else {
      console.log('❌ No saved auth found');
    }
    setIsLoading(false);
  }, []);

  // Save token to localStorage
  const saveAuth = (token: string, userId: string, email?: string, createdAt?: string) => {
    setToken(token);
    setUserId(userId);
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    if (email) {
      localStorage.setItem("userEmail", email);
    }
    if (createdAt) {
      localStorage.setItem("userCreatedAt", createdAt);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await res.json();
    saveAuth(data.token, data.user.id, data.user.email, data.user.createdAt);
  };

  // Register function
  const register = async (email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Registration failed");
    }

    // After registering, auto-login
    await login(email, password);
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userCreatedAt");
    // Do NOT remove rememberMeCredentials so login page stays pre-filled
  };

  // Helper for authenticated API calls
  const apiCall = async (url: string, options: RequestInit = {}) => {
    console.log('📡 API Call:', url, 'Token exists:', !!token);
    
    if (!token) {
      console.error('❌ No token available for API call');
      throw new Error("Not authenticated");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      if (res.status === 401) {
        logout(); // Token expired or invalid
        throw new Error("Session expired. Please login again.");
      }
      const error = await res.json();
      throw new Error(error.error || `API error: ${res.status}`);
    }

    // Handle 204 No Content responses (e.g., DELETE)
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return null;
    }

    return res.json();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        apiCall,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
