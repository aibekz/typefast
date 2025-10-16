"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthError, handleLoginCallback } from "../../../lib/auth";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const processCallback = async () => {
      // Check if this is a direct visit to /auth/callback without OAuth parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthParams = urlParams.has('code') || urlParams.has('state');
      
      if (!hasAuthParams) {
        // If no OAuth parameters, redirect to home page
        router.push('/');
        return;
      }

      try {
        const { token, error: callbackError } = await handleLoginCallback();

        if (callbackError) {
          setError(callbackError);
          setStatus("error");
          return;
        }

        if (token) {
          // Store the token in localStorage for client-side auth
          localStorage.setItem("auth_token", token);
          console.log("Token stored in localStorage:", token);

          // Dispatch custom event to notify AuthContext of successful login
          window.dispatchEvent(
            new CustomEvent("authLoginSuccess", {
              detail: { token },
            }),
          );

          setStatus("success");
          // Redirect to home page after successful login
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          setError("No authentication token received");
          setStatus("error");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setError(
          error instanceof AuthError ? error.message : "Authentication failed",
        );
        setStatus("error");
      }
    };

    processCallback();
  }, [router]);

  if (status === "loading") {
    return (
      <div className="h-screen bg-[var(--bg-dark)] flex flex-col justify-center items-center overflow-hidden">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-[var(--purple-button)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--purple-button)]"></div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-[var(--fg-light)]">
            Processing Authentication
          </h2>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Please wait while we complete your login...
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="h-screen bg-[var(--bg-dark)] flex flex-col justify-center items-center overflow-hidden">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-[var(--matrix-green)]">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-[var(--fg-light)]">
            Login Successful!
          </h2>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Redirecting you to Retype...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--bg-dark)] flex flex-col justify-center items-center overflow-hidden">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-bold text-[var(--fg-light)]">
          Authentication Failed
        </h2>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          {error || "An unknown error occurred during authentication."}
        </p>
      </div>

      <div className="mt-8 max-w-md w-full">
        <div className="bg-[var(--bg-card)] py-8 px-4 shadow sm:rounded-lg">
          <div className="text-center">
            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--purple-button)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--purple-button)]"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="mt-3 w-full flex justify-center py-2 px-4 border border-[var(--fg-muted)] rounded-md shadow-sm text-sm font-medium text-[var(--fg-light)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--purple-button)]"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
