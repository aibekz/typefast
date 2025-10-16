import { useCallback, useEffect, useRef, useState } from "react";
import { loadWordList } from "../lib/wordLoader";
import type { TypingStats, Word } from "../types";
import { calculateStats } from "../utils/calculateStats";

// Inline utility function
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const useTypingTest = (duration: number = 60) => {
  // Simplified state management
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [stats, setStats] = useState({
    correctChars: 0,
    totalChars: 0,
    incorrectChars: new Set<string>(),
  });

  // Cumulative statistics across all words
  const [cumulativeStats, setCumulativeStats] = useState({
    correctChars: 0,
    totalChars: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ===== WORD GENERATION =====
  const generateWords = useCallback(async () => {
    setIsLoading(true);
    try {
      const wordList = await loadWordList();
      const newWords: Word[] = [];
      for (let i = 0; i < 25; i++) {
        const randomWord =
          wordList[Math.floor(Math.random() * wordList.length)];
        newWords.push({
          text: randomWord,
          status: "pending",
        });
      }
      setWords(newWords);
    } catch (error) {
      console.error("Error generating words:", error);
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===== TEST CONTROL =====
  const endTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsActive(false);
    setIsComplete(true);
  };

  const resetTest = useCallback(() => {
    setIsActive(false);
    setStartTime(null);
    setInput("");
    setCurrentWordIndex(0);
    setStats({
      correctChars: 0,
      totalChars: 0,
      incorrectChars: new Set<string>(),
    });
    setCumulativeStats({
      correctChars: 0,
      totalChars: 0,
    });
    setTimeElapsed(0);
    setTimeRemaining(duration);
    setIsComplete(false);
    setIsLoading(true);
    generateWords();
  }, [duration, generateWords]);

  // ===== FOCUS MANAGEMENT =====
  const handleContainerClick = () => {
    if (inputRef.current && !isComplete && timeRemaining > 0) {
      inputRef.current.focus();
    }
  };

  // Auto-focus input when test is ready
  useEffect(() => {
    if (!isLoading && !isComplete && timeRemaining > 0 && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isComplete, timeRemaining]);

  // ===== INPUT HANDLING =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComplete || timeRemaining <= 0) return;

    const value = e.target.value;
    const currentWord = words[currentWordIndex];

    // Start test on first keystroke
    if (!isActive && value.length > 0) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    // Allow editing of current word only
    if (value.length > currentWord?.text.length) return;

    setInput(value);

    // Create a new set of incorrect characters
    const newIncorrectChars = new Set(stats.incorrectChars);
    // Clear incorrect chars for the current word we're typing
    for (const key of newIncorrectChars) {
      if (key.startsWith(`${currentWordIndex}-`)) {
        newIncorrectChars.delete(key);
      }
    }

    // Calculate correct characters and track incorrect ones for current word
    let correctCount = 0;

    for (let i = 0; i < value.length; i++) {
      if (i < currentWord?.text.length) {
        const isCorrect =
          value[i].toLowerCase() === currentWord.text[i].toLowerCase();
        if (isCorrect) {
          correctCount++;
        } else {
          // Mark this character as incorrect
          newIncorrectChars.add(`${currentWordIndex}-${i}`);
        }
      }
    }

    // Update stats
    setStats((prev) => ({
      ...prev,
      correctChars: correctCount,
      totalChars: value.length,
      incorrectChars: newIncorrectChars,
    }));
  };

  // ===== KEYBOARD HANDLING =====
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComplete || timeRemaining <= 0) {
      e.preventDefault();
      return;
    }

    if (e.key === "Backspace") {
      handleBackspace();
    }

    if (e.key === " ") {
      e.preventDefault();

      // Only allow space to move to next word if current word is complete
      if (input.length >= words[currentWordIndex]?.text.length) {
        // Accumulate statistics for the completed word
        setCumulativeStats((prev) => ({
          correctChars: prev.correctChars + stats.correctChars,
          totalChars: prev.totalChars + stats.totalChars,
        }));

        const nextWordIndex = currentWordIndex + 1;

        // Replace words if we've completed all 25
        if (nextWordIndex === 25) {
          generateWords();
          setCurrentWordIndex(0);
        } else {
          setCurrentWordIndex(nextWordIndex);
        }

        setInput("");
        // Reset current word stats but keep incorrectChars for completed words
        setStats((prev) => ({
          ...prev,
          correctChars: 0,
          totalChars: 0,
          // Keep incorrectChars as they are - don't clear them
        }));
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComplete || timeRemaining <= 0) {
      e.preventDefault();
      return;
    }
  };

  // Handle backspace to go back to previous words
  const handleBackspace = () => {
    if (input.length === 0 && currentWordIndex > 0) {
      // Go back to previous word
      const prevWordIndex = currentWordIndex - 1;
      const prevWord = words[prevWordIndex];
      setCurrentWordIndex(prevWordIndex);
      setInput(prevWord?.text || "");

      // Update stats for previous word
      let correctCount = 0;
      const newIncorrectChars = new Set(stats.incorrectChars);

      // Clear incorrect chars for the word we're going back to
      for (const key of newIncorrectChars) {
        if (key.startsWith(`${prevWordIndex}-`)) {
          newIncorrectChars.delete(key);
        }
      }

      // Recalculate for the previous word
      for (let i = 0; i < (prevWord?.text.length || 0); i++) {
        if (i < prevWord?.text.length) {
          const isCorrect =
            prevWord.text[i].toLowerCase() === prevWord.text[i].toLowerCase();
          if (isCorrect) {
            correctCount++;
          } else {
            newIncorrectChars.add(`${prevWordIndex}-${i}`);
          }
        }
      }

      setStats((prev) => ({
        ...prev,
        correctChars: correctCount,
        totalChars: prevWord?.text.length || 0,
        incorrectChars: newIncorrectChars,
      }));
    }
  };

  // ===== EFFECTS =====
  useEffect(() => {
    generateWords();
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest("[data-typing-area]") &&
        !isComplete &&
        timeRemaining > 0
      ) {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [isComplete, timeRemaining]);

  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);

        setTimeElapsed(elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          endTest();
        }
      }, 1000); // Optimized from 100ms to 1000ms
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, startTime, duration, endTest]);

  // Calculate final stats using cumulative statistics
  const totalCorrectChars = cumulativeStats.correctChars + stats.correctChars;
  const totalTotalChars = cumulativeStats.totalChars + stats.totalChars;

  const finalStats: TypingStats = calculateStats(
    totalCorrectChars,
    totalTotalChars,
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
    incorrectChars: stats.incorrectChars,

    // Refs
    inputRef,

    // Actions
    resetTest,
    handleInputChange,
    handleKeyDown,
    handleKeyPress,
    handleContainerClick,

    // Utils
    formatTime,
  };
};
