"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "../auth/UserMenu";

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
              className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
              title="Sign In"
            >
              <svg 
                className="w-6 h-6 text-[var(--fg-muted)] hover:text-[var(--fg-light)]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-label="Sign In"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </Link>
          )}
        </div>
      </header>

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
