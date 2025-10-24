"use client";

import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import AuthGuard from "../components/auth/AuthGuard";
import { useAuth } from "../contexts/AuthContext";

interface Test {
  id: string;
  wpm: number;
  accuracy: number;
  time: number;
  createdAt: string;
}

interface Progress {
  id: string;
  averageWpm: number;
  bestWpm: number;
  testsCount: number;
  accuracy: number;
  date: string;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface UserStats {
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  totalTimeSpentMinutes?: number;
  recentTests: Test[];
  recentProgress: Progress[];
  achievements: Achievement[];
  lastTestDate: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/${user.id}/stats`);

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          const errorData = await response.json();
          console.error("Dashboard: API error:", errorData);
        }
      } catch (error) {
        console.error("Dashboard: Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--purple-button)]"></div>
        </div>
      </AuthGuard>
    );
  }

  if (!stats) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--fg-light)] mb-4">
              No Data Available
            </h2>
            <p className="text-[var(--fg-muted)]">
              Start taking typing tests to see your statistics here.
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="flex-1 flex flex-col min-h-0 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--fg-accent)] mb-2 font-space-grotesk">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-[var(--fg-muted)]">
            Here's your typing progress and statistics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--fg-muted)] text-sm">Total Tests</p>
                <p className="text-2xl font-bold text-[var(--fg-light)]">
                  {stats?.totalTests || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-[var(--purple-button)]" />
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--fg-muted)] text-sm">Average WPM</p>
                <p className="text-2xl font-bold text-[var(--fg-light)]">
                  {stats?.averageWpm || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-[var(--matrix-green)]" />
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--fg-muted)] text-sm">Best WPM</p>
                <p className="text-2xl font-bold text-[var(--fg-light)]">
                  {stats?.bestWpm || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-[var(--matrix-green)]" />
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--fg-muted)] text-sm">Accuracy</p>
                <p className="text-2xl font-bold text-[var(--fg-light)]">
                  {stats?.averageAccuracy || 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-[var(--purple-button)]" />
            </div>
          </div>
        </div>

        {/* Recent Activity and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tests */}
          <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--fg-light)] mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-[var(--purple-button)]" />
              Recent Tests
            </h3>
            {stats?.recentTests && stats.recentTests.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTests.slice(0, 5).map((test) => (
                  <div
                    key={test.id}
                    className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-b-0"
                  >
                    <div>
                      <p className="text-[var(--fg-light)] font-medium">
                        {test.wpm} WPM
                      </p>
                      <p className="text-[var(--fg-muted)] text-sm">
                        {test.accuracy}% accuracy
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[var(--fg-muted)] text-sm">
                        {new Date(test.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[var(--fg-muted)] text-xs">
                        {test.time}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--fg-muted)]">No recent tests found.</p>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--fg-light)] mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-[var(--matrix-green)]" />
              Recent Achievements
            </h3>
            {stats?.achievements && stats.achievements.length > 0 ? (
              <div className="space-y-3">
                {stats.achievements.slice(0, 5).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center py-2 border-b border-[var(--border)] last:border-b-0"
                  >
                    <div className="w-8 h-8 bg-[var(--matrix-green)] rounded-full flex items-center justify-center mr-3">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[var(--fg-light)] font-medium">
                        {achievement.title}
                      </p>
                      <p className="text-[var(--fg-muted)] text-sm">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--fg-muted)]">
                No achievements yet. Keep practicing!
              </p>
            )}
          </div>
        </div>

        {/* Time Spent */}
        {stats?.totalTimeSpent && stats.totalTimeSpent > 0 && (
          <div className="mt-6 bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--fg-light)] mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-[var(--purple-button)]" />
              Time Invested
            </h3>
            <p className="text-[var(--fg-muted)]">
              You've spent{" "}
              <span className="text-[var(--fg-light)] font-semibold">
                {stats.totalTimeSpent < 60 
                  ? `${stats.totalTimeSpent} seconds`
                  : `${Math.round(stats.totalTimeSpent / 60)} minutes`
                }
              </span>{" "}
              practicing your typing skills. Keep up the great work!
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
