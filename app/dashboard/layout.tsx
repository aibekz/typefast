"use client";

import { BarChart3, Home, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthGuard from "../components/auth/AuthGuard";
import { useAuth } from "../contexts/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="fixed inset-0 bg-[var(--bg-dark)] text-[var(--fg-light)] font-sans flex">
        {/* Sidebar */}
        <div className="w-64 bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col">
        {/* Logo and Home Link */}
        <div className="p-6 border-b border-[var(--border)]">
          <Link
            href="/"
            className="flex items-center space-x-3 text-lg font-bold text-[var(--fg-accent)] hover:text-[var(--purple-button)] transition-colors"
          >
            <Home className="h-6 w-6" />
            <span>Retype</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--purple-button)] text-white"
                        : "text-[var(--fg-muted)] hover:bg-[var(--bg-dark)] hover:text-[var(--fg-light)]"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Account Section */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[var(--bg-dark)] transition-colors"
            >
              <div className="w-8 h-8 bg-[var(--purple-button)] rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[var(--fg-light)]">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-[var(--fg-muted)]">
                  Account
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[var(--fg-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--fg-light)] transition-colors rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
