"use client";

import { AuthProvider } from "@/hooks/useAuth";
import FloatingChatWidget from "./components/FloatingChatWidget";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <FloatingChatWidget />
    </AuthProvider>
  );
}
