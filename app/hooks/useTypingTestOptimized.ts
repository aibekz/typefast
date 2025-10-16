import { useCallback, useEffect, useState } from "react";
import { useTimer } from "./useTimer";
import { useWordManager } from "./useWordManager";
import { useTypingStats } from "./useTypingStats";
import { useTypingInput } from "./useTypingInput";

interface UseTypingTestOptimizedProps {
  duration: number;
}

export const useTypingTestOptimized = ({ duration }: UseTypingTestOptimizedProps) => {
  // Separate concerns into focused hooks
  const timer = useTimer({
    duration,
    onTimeUp: () => {
      setIsComplete(true);
    },
  });

  const wordManager = useWordManager({ wordCount: 25 });
  const stats = useTypingStats();

  const [isComplete, setIsComplete] = useState(false);

  const typingInput = useTypingInput({
    onInputChange: useCallback((input: string) => {
      const currentWord = wordManager.getCurrentWord();
      if (currentWord) {
        stats.updateCurrentWordStats(input, currentWord.text, wordManager.currentWordIndex);
      }
    }, [wordManager, stats]),
    
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
