import { useCallback, useMemo, useState } from "react";
import { calculateStats } from "../utils/calculateStats";
import type { TypingStats } from "../types";

interface CharacterStats {
  correctChars: number;
  totalChars: number;
  incorrectChars: Set<string>;
}

interface CumulativeStats {
  correctChars: number;
  totalChars: number;
}

export const useTypingStats = () => {
  const [currentStats, setCurrentStats] = useState<CharacterStats>({
    correctChars: 0,
    totalChars: 0,
    incorrectChars: new Set(),
  });

  const [cumulativeStats, setCumulativeStats] = useState<CumulativeStats>({
    correctChars: 0,
    totalChars: 0,
  });

  const updateCurrentWordStats = useCallback((
    input: string,
    wordText: string,
    wordIndex: number
  ) => {
    const newIncorrectChars = new Set(currentStats.incorrectChars);
    
    // Clear incorrect chars for current word
    for (const key of newIncorrectChars) {
      if (key.startsWith(`${wordIndex}-`)) {
        newIncorrectChars.delete(key);
      }
    }

    let correctCount = 0;
    const maxLength = Math.min(input.length, wordText.length);

    for (let i = 0; i < maxLength; i++) {
      const isCorrect = input[i].toLowerCase() === wordText[i].toLowerCase();
      if (isCorrect) {
        correctCount++;
      } else {
        newIncorrectChars.add(`${wordIndex}-${i}`);
      }
    }

    setCurrentStats({
      correctChars: correctCount,
      totalChars: input.length,
      incorrectChars: newIncorrectChars,
    });
  }, [currentStats.incorrectChars]);

  const completeWord = useCallback(() => {
    setCumulativeStats(prev => ({
      correctChars: prev.correctChars + currentStats.correctChars,
      totalChars: prev.totalChars + currentStats.totalChars,
    }));

    setCurrentStats({
      correctChars: 0,
      totalChars: 0,
      incorrectChars: new Set(),
    });
  }, [currentStats]);

  const resetStats = useCallback(() => {
    setCurrentStats({
      correctChars: 0,
      totalChars: 0,
      incorrectChars: new Set(),
    });
    setCumulativeStats({
      correctChars: 0,
      totalChars: 0,
    });
  }, []);

  const getFinalStats = useCallback((timeElapsed: number): TypingStats => {
    const totalCorrectChars = cumulativeStats.correctChars + currentStats.correctChars;
    const totalTotalChars = cumulativeStats.totalChars + currentStats.totalChars;

    return calculateStats(totalCorrectChars, totalTotalChars, timeElapsed);
  }, [cumulativeStats, currentStats]);

  // Memoized stats to prevent unnecessary recalculations
  const finalStats = useMemo(() => {
    return getFinalStats(0); // Will be updated with actual time
  }, [getFinalStats]);

  return {
    currentStats,
    cumulativeStats,
    updateCurrentWordStats,
    completeWord,
    resetStats,
    getFinalStats,
    finalStats,
  };
};
