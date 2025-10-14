import type { TypingStats } from "../types";

/**
 * Calculate typing statistics
 */
export const calculateStats = (
  correctChars: number,
  totalChars: number,
  timeElapsed: number,
): TypingStats => {
  const wpm =
    timeElapsed > 0 ? Math.round((correctChars / 5) * (60 / timeElapsed)) : 0;
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
