import { useCallback, useEffect, useState } from "react";
import { useSaveTestResult } from "./useSaveTestResult";
import { useTimer } from "./useTimer";
import { useTypingInput } from "./useTypingInput";
import { useTypingStats } from "./useTypingStats";
import { useWordManager } from "./useWordManager";

interface UseTypingTestOptimizedProps {
  duration: number;
}

export const useTypingTestOptimized = ({
  duration,
}: UseTypingTestOptimizedProps) => {
  const [isComplete, setIsComplete] = useState(false);
  const { saveTestResult } = useSaveTestResult();

  // Separate concerns into focused hooks
  const stats = useTypingStats();

  const timer = useTimer({
    duration,
    onTimeUp: async () => {
      setIsComplete(true);

      // Save test result to database
      // Use the exact duration instead of elapsed time for accuracy
      const finalStats = stats.getFinalStats(duration);
      const testResult = {
        wpm: finalStats.wpm,
        accuracy: finalStats.accuracy,
        time: duration, // Use the original duration setting
        characters: stats.cumulativeStats.totalChars,
        mistakes:
          stats.cumulativeStats.totalChars - stats.cumulativeStats.correctChars,
        testType: "time",
        difficulty: "medium",
      };

      try {
        await saveTestResult(testResult);
      } catch (error) {
        console.error("Failed to save test result:", error);
      }
    },
  });

  const wordManager = useWordManager({ wordCount: 25 });

  const typingInput = useTypingInput({
    onInputChange: useCallback(
      (input: string) => {
        const currentWord = wordManager.getCurrentWord();
        if (currentWord) {
          stats.updateCurrentWordStats(
            input,
            currentWord.text,
            wordManager.currentWordIndex,
          );
        }
      },
      [wordManager, stats],
    ),

    onWordComplete: useCallback(() => {
      stats.completeWord();
      wordManager.nextWord();
    }, [stats, wordManager]),

    onBackspace: useCallback(() => {
      wordManager.previousWord();
    }, [wordManager]),

    isActive: timer.isActive,
  });

  // Start timer on first keystroke
  useEffect(() => {
    if (typingInput.input.length > 0 && !timer.isActive) {
      timer.startTimer();
    }
  }, [typingInput.input.length, timer.isActive, timer.startTimer]);

  // Reset everything when duration changes
  const resetTest = useCallback(() => {
    setIsComplete(false);
    timer.resetTimer();
    wordManager.resetWords();
    stats.resetStats();
    typingInput.clearInput();
  }, [timer, wordManager, stats, typingInput]);

  // Auto-focus input when ready
  useEffect(() => {
    if (!wordManager.isLoading && !isComplete && timer.timeRemaining > 0) {
      const timer = setTimeout(() => {
        typingInput.focusInput();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [wordManager.isLoading, isComplete, timer.timeRemaining, typingInput]);

  // Global click handler for focus
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest("[data-typing-area]") &&
        !target.closest("[data-typing-controls]") &&
        !target.closest("input") &&
        !target.closest("button") &&
        !target.closest("[role='dialog']") &&
        !isComplete &&
        timer.timeRemaining > 0
      ) {
        typingInput.focusInput();
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [isComplete, timer.timeRemaining, typingInput]);

  const finalStats = stats.getFinalStats(timer.timeElapsed);

  return {
    // State
    words: wordManager.words,
    currentWordIndex: wordManager.currentWordIndex,
    input: typingInput.input,
    isActive: timer.isActive,
    isComplete,
    isLoading: wordManager.isLoading,
    timeElapsed: timer.timeElapsed,
    timeRemaining: timer.timeRemaining,
    stats: finalStats,
    incorrectChars: stats.currentStats.incorrectChars,

    // Refs
    inputRef: typingInput.inputRef,

    // Actions
    resetTest,
    handleInputChange: typingInput.handleInputChange,
    handleKeyDown: typingInput.handleKeyDown,
    handleKeyPress: typingInput.handleKeyPress,
    handleContainerClick: typingInput.focusInput,

    // Utils
    formatTime: timer.formatTime,
  };
};
