"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "../auth/UserMenu";
import { AlertCircle } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  return (
    <div className="h-screen bg-[var(--bg-dark)] text-[var(--fg-light)] font-sans flex flex-col">
      {/* SEO Heading - Hidden but accessible to screen readers */}
      <h1 className="sr-only">Retype - Test Your Typing Speed</h1>

      {/* Header */}
      <header className="flex flex-row justify-between items-center p-3 sm:p-4 gap-2 sm:gap-4">
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-lg font-bold text-[var(--fg-light)] transition-colors font-space-grotesk"
          >
            Retype
          </Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center space-x-4">
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-[var(--purple-button)]/20 text-[var(--purple-button)]"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-light)] hover:bg-[var(--bg-card)]"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Auth Section */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--fg-muted)]"></div>
          ) : isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors text-[var(--fg-muted)] hover:text-[var(--fg-light)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Guest Mode Banner */}
      {!isAuthenticated && pathname === "/" && (
        <div className="flex-shrink-0 mx-4 mb-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-[var(--fg-muted)] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[var(--fg-muted)]">
                <strong>Guest Mode:</strong> Your results won't be saved. 
                <a href="/login" className="text-[var(--purple-button)] hover:underline ml-1">
                  Sign in to track your progress
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
        {children}
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0">
        <div className="text-center text-xs text-[var(--fg-muted)] py-2">
          © 2025 Retype from{" "}
          <a
            href="https://nvix.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--fg-light)] hover:opacity-80 transition-opacity"
          >
            Nvix I/O
          </a>
        </div>
      </footer>
    </div>
  );
}
