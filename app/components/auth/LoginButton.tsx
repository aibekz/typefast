"use client";

import { useAuth } from "../../contexts/AuthContext";

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LoginButton({
  className = "",
  children,
}: LoginButtonProps) {
  const { login, isLoading } = useAuth();

  return (
    <button
      type="button"
      onClick={login}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </>
      ) : (
        children || "Sign In"
      )}
    </button>
  );
}
