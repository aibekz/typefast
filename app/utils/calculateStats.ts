import type { TypingStats } from "../types";

/**
 * Calculate typing statistics
 */
export const calculateStats = (
  correctChars: number,
  totalChars: number,
  timeElapsed: number,
): TypingStats => {
  const wpm = Math.round(correctChars / 5 / (timeElapsed / 60));
  const accuracy =
    totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
  const incorrectChars = totalChars - correctChars;

  return {
    wpm,
    accuracy,
    timeElapsed,
    correctChars,
    totalChars,
    incorrectChars,
  };
};
