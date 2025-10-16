"use client";

import { useAuth } from "../../contexts/AuthContext";
import LoginButton from "./LoginButton";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({
  children,
  fallback,
  requireAuth = false,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sign in required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access this feature.
            </p>
            <LoginButton />
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
