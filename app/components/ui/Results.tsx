import { memo, useMemo } from "react";
import type { TypingStats } from "../../types";

interface ResultsProps {
  stats: TypingStats;
  timeElapsed: number;
  formatTime: (seconds: number) => string;
  onRestart: () => void;
}

function Results({ stats, timeElapsed, formatTime, onRestart }: ResultsProps) {
  // Memoize formatted time to prevent unnecessary recalculations
  const formattedTime = useMemo(
    () => formatTime(timeElapsed),
    [formatTime, timeElapsed],
  );

  // Memoize overall accuracy calculation
  const overallAccuracy = useMemo(
    () => Math.round((stats.correctChars / stats.totalChars) * 100) || 0,
    [stats.correctChars, stats.totalChars],
  );

  return (
    <div className="fixed inset-0 bg-[var(--bg-dark)] bg-opacity-95 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="max-w-4xl w-full py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--fg-accent)] mb-4">
              Test Complete!
            </h2>
            <p className="text-lg sm:text-xl text-[var(--fg-muted)]">
              Your typing performance results
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
            {/* WPM */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-2 sm:p-4 lg:p-6 text-center">
              <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-[var(--fg-accent)] mb-1 sm:mb-2">
                {stats.wpm}
              </div>
              <div className="text-xs sm:text-base lg:text-lg text-[var(--fg-light)] mb-1">
                WPM
              </div>
              <div className="text-xs text-[var(--fg-muted)] hidden sm:block">
                Words Per Minute
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-2 sm:p-4 lg:p-6 text-center">
              <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-[var(--fg-accent)] mb-1 sm:mb-2">
                {stats.accuracy}%
              </div>
              <div className="text-xs sm:text-base lg:text-lg text-[var(--fg-light)] mb-1">
                ACCURACY
              </div>
              <div className="text-xs text-[var(--fg-muted)] hidden sm:block">
                Character Accuracy
              </div>
            </div>

            {/* Time */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-2 sm:p-4 lg:p-6 text-center">
              <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-[var(--fg-accent)] mb-1 sm:mb-2">
                {formattedTime}
              </div>
              <div className="text-xs sm:text-base lg:text-lg text-[var(--fg-light)] mb-1">
                TIME
              </div>
              <div className="text-xs text-[var(--fg-muted)] hidden sm:block">
                Elapsed Time
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-[var(--fg-accent)] mb-1">
                {stats.totalChars}
              </div>
              <div className="text-xs sm:text-sm text-[var(--fg-muted)]">
                Characters Typed
              </div>
            </div>

            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-[var(--fg-accent)] mb-1">
                {stats.correctChars}
              </div>
              <div className="text-xs sm:text-sm text-[var(--fg-muted)]">
                Correct Characters
              </div>
            </div>

            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-400 mb-1">
                {stats.incorrectChars}
              </div>
              <div className="text-xs sm:text-sm text-[var(--fg-muted)]">
                Incorrect Characters
              </div>
            </div>

            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-[var(--fg-accent)] mb-1">
                {overallAccuracy}%
              </div>
              <div className="text-xs sm:text-sm text-[var(--fg-muted)]">
                Overall Accuracy
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              type="button"
              onClick={onRestart}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[var(--fg-accent)] text-[var(--bg-dark)] font-bold text-lg sm:text-xl hover:opacity-80 transition-opacity rounded-lg"
            >
              Restart Test
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--fg-light)] font-bold text-lg sm:text-xl hover:bg-[var(--border-light)] hover:border-[var(--border-light)] transition-all duration-200 rounded-lg"
            >
              New Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize the Results component to prevent unnecessary re-renders
export default memo(Results);
