import { useCallback, useState } from "react";
import type { TypingStats } from "../types";
import { calculateStats } from "../utils/calculateStats";

export const useTypingStats = () => {
  const [cumulativeStats, setCumulativeStats] = useState({
    correctChars: 0,
    totalChars: 0,
  });

  const addWordStats = useCallback((correctChars: number, totalChars: number) => {
    setCumulativeStats((prev) => ({
      correctChars: prev.correctChars + correctChars,
      totalChars: prev.totalChars + totalChars,
    }));
  }, []);

  const calculateFinalStats = useCallback((
    currentCorrectChars: number,
    currentTotalChars: number,
    timeElapsed: number
  ): TypingStats => {
    const totalCorrectChars = cumulativeStats.correctChars + currentCorrectChars;
    const totalTotalChars = cumulativeStats.totalChars + currentTotalChars;
    
    return calculateStats(totalCorrectChars, totalTotalChars, timeElapsed);
  }, [cumulativeStats]);

  const resetStats = useCallback(() => {
    setCumulativeStats({
      correctChars: 0,
      totalChars: 0,
    });
  }, []);

  return {
    cumulativeStats,
    addWordStats,
    calculateFinalStats,
    resetStats,
  };
};
