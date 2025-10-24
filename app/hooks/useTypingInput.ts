import { useCallback, useEffect, useRef, useState } from "react";
import type { Word } from "../types";

interface UseTypingInputProps {
  words: Word[];
  currentWordIndex: number;
  isComplete: boolean;
  timeRemaining: number;
  onWordComplete: (wordIndex: number, stats: { correctChars: number; totalChars: number }) => void;
  onBackspace: (prevWordIndex: number, prevWord: Word) => void;
}

export const useTypingInput = ({
  words,
  currentWordIndex,
  isComplete,
  timeRemaining,
  onWordComplete,
  onBackspace,
}: UseTypingInputProps) => {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState({
    correctChars: 0,
    totalChars: 0,
    incorrectChars: new Set<string>(),
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComplete || timeRemaining <= 0) return;

    const value = e.target.value;
    const currentWord = words[currentWordIndex];

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
  }, [isComplete, timeRemaining, words, currentWordIndex, stats.incorrectChars]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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
        // Notify parent of word completion
        onWordComplete(currentWordIndex, {
          correctChars: stats.correctChars,
          totalChars: stats.totalChars,
        });

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
  }, [isComplete, timeRemaining, input.length, words, currentWordIndex, stats.correctChars, stats.totalChars, onWordComplete]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComplete || timeRemaining <= 0) {
      e.preventDefault();
      return;
    }
  }, [isComplete, timeRemaining]);

  const handleBackspace = useCallback(() => {
    if (input.length === 0 && currentWordIndex > 0) {
      // Go back to previous word
      const prevWordIndex = currentWordIndex - 1;
      const prevWord = words[prevWordIndex];
      
      onBackspace(prevWordIndex, prevWord);
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
            input[i]?.toLowerCase() === prevWord.text[i].toLowerCase();
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
  }, [input.length, currentWordIndex, words, input, stats.incorrectChars, onBackspace]);

  const handleContainerClick = useCallback(() => {
    if (inputRef.current && !isComplete && timeRemaining > 0) {
      inputRef.current.focus();
    }
  }, [isComplete, timeRemaining]);

  const resetInput = useCallback(() => {
    setInput("");
    setStats({
      correctChars: 0,
      totalChars: 0,
      incorrectChars: new Set<string>(),
    });
    // Also clear the input field value directly
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  // Auto-focus input when test is ready
  useEffect(() => {
    if (!isComplete && timeRemaining > 0 && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isComplete, timeRemaining]);

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
        !target.closest("[data-typing-controls]") &&
        !target.closest("input") &&
        !target.closest("button") &&
        !target.closest("[role='dialog']") &&
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

  return {
    input,
    stats,
    inputRef,
    handleInputChange,
    handleKeyDown,
    handleKeyPress,
    handleContainerClick,
    resetInput,
  };
};
