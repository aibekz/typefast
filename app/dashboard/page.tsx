"use client";

import AuthGuard from "../components/auth/AuthGuard";

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[var(--fg-accent)] mb-4 font-space-grotesk">
              Welcome to your Dashboard
            </h1>
            <p className="text-[var(--fg-muted)] max-w-md mx-auto">
              Your personal typing dashboard.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
