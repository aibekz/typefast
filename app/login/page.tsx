"use client";

import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  return (
    <div className="h-screen bg-[var(--bg-dark)] flex flex-col justify-center items-center overflow-hidden">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--fg-light)]">
            Sign in to TypeFast
          </h2>
        </div>

        <button
          type="button"
          onClick={login}
          disabled={isLoading}
          className="w-full flex justify-center items-center py-4 px-6 border-2 border-[var(--fg-muted)] rounded-xl shadow-lg text-base font-semibold text-[var(--fg-light)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] hover:border-[var(--purple-button)] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[var(--purple-button)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--fg-light)] mr-3"></div>
              Loading...
            </>
          ) : (
            "Continue with Google"
          )}
        </button>
      </div>
    </div>
  );
}
