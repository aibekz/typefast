import { useCallback, useEffect, useState } from "react";
import type { TypingStats, Word } from "../types";
import { useSaveTestResult } from "./useSaveTestResult";
import { useWordGeneration } from "./useWordGeneration";
import { useTypingTimer } from "./useTypingTimer";
import { useTypingInput } from "./useTypingInput";
import { useTypingStats } from "./useTypingStats";

export const useTypingTest = (duration: number = 60) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Use smaller, focused hooks
  const { words, isLoading, generateWords } = useWordGeneration();
  const { 
    isActive, 
    timeElapsed, 
    timeRemaining, 
    isComplete, 
    startTimer, 
    stopTimer, 
    resetTimer, 
    formatTime 
  } = useTypingTimer(duration);
  const { addWordStats, calculateFinalStats, resetStats } = useTypingStats();
  const { saveTestResult } = useSaveTestResult();

  // ===== TEST CONTROL =====
  const endTest = useCallback(async () => {
    stopTimer();

    // Save test result to database
    const finalStats = calculateFinalStats(0, 0, timeElapsed);

    if (timeElapsed > 0) {
      const testResult = {
        wpm: finalStats.wpm,
        accuracy: finalStats.accuracy,
        time: timeElapsed,
        characters: finalStats.totalChars,
        mistakes: finalStats.incorrectChars,
        testType: "time",
        difficulty: "medium",
      };

      try {
        await saveTestResult(testResult);
      } catch (error) {
        console.error("Failed to save test result:", error);
      }
    }
  }, [stopTimer, calculateFinalStats, timeElapsed, saveTestResult]);

  // ===== WORD COMPLETION HANDLERS =====
  const handleWordComplete = useCallback((wordIndex: number, stats: { correctChars: number; totalChars: number }) => {
    addWordStats(stats.correctChars, stats.totalChars);
    
    const nextWordIndex = wordIndex + 1;
    
    // Replace words if we've completed all 25
    if (nextWordIndex === 25) {
      generateWords();
      setCurrentWordIndex(0);
    } else {
      setCurrentWordIndex(nextWordIndex);
    }
  }, [addWordStats, generateWords]);

  const handleBackspace = useCallback((prevWordIndex: number, prevWord: Word) => {
    setCurrentWordIndex(prevWordIndex);
  }, []);

  // ===== TYPING INPUT =====
  const {
    input,
    stats: inputStats,
    inputRef,
    handleInputChange,
    handleKeyDown,
    handleKeyPress,
    handleContainerClick,
    resetInput,
  } = useTypingInput({
    words,
    currentWordIndex,
    isComplete,
    timeRemaining,
    onWordComplete: handleWordComplete,
    onBackspace: handleBackspace,
  });

  const resetTest = useCallback(() => {
    resetTimer();
    resetStats();
    setCurrentWordIndex(0);
    resetInput();
    generateWords();
  }, [resetTimer, resetStats, resetInput, generateWords]);

  // ===== INPUT HANDLING =====
  const handleInputChangeWithTimer = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Start test on first keystroke
    if (!isActive && e.target.value.length > 0) {
      startTimer();
    }
    handleInputChange(e);
  };

  // ===== EFFECTS =====
  useEffect(() => {
    generateWords();
  }, [generateWords]);

  // Auto-trigger endTest when timer completes
  useEffect(() => {
    if (isComplete) {
      endTest();
    }
  }, [isComplete, endTest]);

  // Calculate final stats using cumulative statistics
  const finalStats: TypingStats = calculateFinalStats(
    inputStats.correctChars,
    inputStats.totalChars,
    timeElapsed,
  );

  return {
    // State
    words,
    currentWordIndex,
    input,
    isActive,
    isComplete,
    isLoading,
    timeElapsed,
    timeRemaining,
    stats: finalStats,
    incorrectChars: inputStats.incorrectChars,

    // Refs
    inputRef,

    // Actions
    resetTest,
    handleInputChange: handleInputChangeWithTimer,
    handleKeyDown,
    handleKeyPress,
    handleContainerClick,

    // Utils
    formatTime,
  };
};
