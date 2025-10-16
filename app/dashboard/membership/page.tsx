"use client";

import AuthGuard from "../../components/auth/AuthGuard";
import { useAuth } from "../../contexts/AuthContext";

export default function MembershipPage() {
  const { user } = useAuth();

  // Mock user stats - in a real app, this would come from an API
  const userStats = {
    plan: "free",
    planExpiry: null,
    features: {
      testsPerDay: 10,
      historyRetention: "7 days",
      analytics: false,
      customTests: false,
      prioritySupport: false,
    },
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      current: userStats.plan === "free",
      features: [
        "10 tests per day",
        "7 days history",
        "Basic statistics",
        "Community support",
      ],
      buttonText: "Current Plan",
      buttonStyle:
        "border border-[var(--border)] text-[var(--fg-muted)] cursor-not-allowed",
    },
    {
      name: "Pro",
      price: "$9",
      period: "month",
      current: userStats.plan === "pro",
      popular: true,
      features: [
        "Unlimited tests",
        "Unlimited history",
        "Advanced analytics",
        "Custom test creation",
        "Priority support",
        "Export data",
      ],
      buttonText: userStats.plan === "pro" ? "Current Plan" : "Upgrade to Pro",
      buttonStyle:
        userStats.plan === "pro"
          ? "border border-[var(--border)] text-[var(--fg-muted)] cursor-not-allowed"
          : "bg-[var(--purple-button)] hover:bg-[var(--purple-button)]/80 text-white",
    },
    {
      name: "Enterprise",
      price: "$29",
      period: "month",
      current: userStats.plan === "enterprise",
      features: [
        "Everything in Pro",
        "Team management",
        "Custom integrations",
        "API access",
        "Dedicated support",
        "Custom branding",
      ],
      buttonText:
        userStats.plan === "enterprise" ? "Current Plan" : "Contact Sales",
      buttonStyle:
        userStats.plan === "enterprise"
          ? "border border-[var(--border)] text-[var(--fg-muted)] cursor-not-allowed"
          : "border border-[var(--purple-button)] text-[var(--purple-button)] hover:bg-[var(--purple-button)]/10",
    },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[var(--fg-accent)] mb-2 font-space-grotesk">
                Membership & Billing
              </h1>
              <p className="text-[var(--fg-muted)]">
                Manage your subscription and billing preferences
              </p>
            </div>

            {/* Current Plan Status */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--fg-accent)] mb-2">
                    Current Plan:{" "}
                    {userStats.plan.charAt(0).toUpperCase() +
                      userStats.plan.slice(1)}
                  </h2>
                  <p className="text-[var(--fg-muted)]">
                    {userStats.plan === "free"
                      ? "You're using the free plan with basic features"
                      : `Your ${userStats.plan} subscription is active`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--purple-button)]">
                    {userStats.plan === "free"
                      ? "Free"
                      : `$${userStats.plan === "pro" ? "9" : "29"}/mo`}
                  </div>
                  <div className="text-sm text-[var(--fg-muted)]">
                    {userStats.plan === "free" ? "Forever" : "Monthly billing"}
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[var(--fg-accent)] mb-6 font-space-grotesk">
                Your Current Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">⚡</span>
                    <span className="font-medium text-[var(--fg-accent)]">
                      Daily Tests
                    </span>
                  </div>
                  <div className="text-sm text-[var(--fg-muted)]">
                    {userStats.features.testsPerDay} tests per day
                  </div>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">📈</span>
                    <span className="font-medium text-[var(--fg-accent)]">
                      History
                    </span>
                  </div>
                  <div className="text-sm text-[var(--fg-muted)]">
                    {userStats.features.historyRetention} retention
                  </div>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">📊</span>
                    <span className="font-medium text-[var(--fg-accent)]">
                      Analytics
                    </span>
                  </div>
                  <div className="text-sm text-[var(--fg-muted)]">
                    {userStats.features.analytics
                      ? "Advanced analytics"
                      : "Basic statistics"}
                  </div>
                </div>
              </div>
            </div>

            {/* Available Plans */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[var(--fg-accent)] mb-6 font-space-grotesk">
                Available Plans
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`bg-[var(--bg-card)] border rounded-xl p-6 relative ${
                      plan.popular
                        ? "border-[var(--purple-button)] ring-2 ring-[var(--purple-button)]/20"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[var(--purple-button)] text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-[var(--fg-accent)] mb-2">
                        {plan.name}
                      </h3>
                      <div className="text-3xl font-bold text-[var(--purple-button)] mb-1">
                        {plan.price}
                      </div>
                      <div className="text-sm text-[var(--fg-muted)]">
                        per {plan.period}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <span className="text-[var(--matrix-green)]">✓</span>
                          <span className="text-sm text-[var(--fg-light)]">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${plan.buttonStyle}`}
                      disabled={plan.current}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[var(--fg-accent)] mb-6 font-space-grotesk">
                Billing Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-[var(--fg-accent)] mb-3">
                    Payment Method
                  </h3>
                  <div className="text-[var(--fg-muted)]">
                    {userStats.plan === "free"
                      ? "No payment method required for free plan"
                      : "Credit card ending in •••• 4242"}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--fg-accent)] mb-3">
                    Next Billing Date
                  </h3>
                  <div className="text-[var(--fg-muted)]">
                    {userStats.plan === "free"
                      ? "No billing for free plan"
                      : "January 15, 2025"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
