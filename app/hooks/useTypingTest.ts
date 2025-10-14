import { useCallback, useEffect, useRef, useState } from "react";
import { loadWordList } from "../lib/wordLoader";
import type { TypingStats, Word } from "../types";
import { calculateStats } from "../utils/calculateStats";
import { formatTime } from "../utils/formatTime";

export const useTypingTest = (duration: number = 60) => {
  // Test state
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [isLoadingWords, setIsLoadingWords] = useState(true);

  // Timer state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);

  // Statistics state
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState<Set<string>>(new Set());

  // Cumulative statistics across all words
  const [cumulativeCorrectChars, setCumulativeCorrectChars] = useState(0);
  const [cumulativeTotalChars, setCumulativeTotalChars] = useState(0);

  // Total statistics for WPM calculation (includes current word)
  const [totalTypedCorrectChars, setTotalTypedCorrectChars] = useState(0);
  const [totalTypedTotalChars, setTotalTypedTotalChars] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ===== WORD GENERATION =====
  const generateWords = useCallback(async () => {
    setIsLoadingWords(true);
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
      // Fallback to empty array if word loading fails
      setWords([]);
    } finally {
      setIsLoadingWords(false);
    }
  }, []);

  // ===== TEST CONTROL =====
  const endTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsTestActive(false);
    setIsTestComplete(true);
  }, []);

  const resetTest = useCallback(() => {
    setIsTestActive(false);
    setStartTime(null);
    setInput("");
    setCurrentWordIndex(0);
    setCorrectChars(0);
    setTotalChars(0);
    setCumulativeCorrectChars(0);
    setCumulativeTotalChars(0);
    setTotalTypedCorrectChars(0);
    setTotalTypedTotalChars(0);
    setTimeElapsed(0);
    setTimeRemaining(duration);
    setIsTestComplete(false);
    setIncorrectChars(new Set());
    setIsLoadingWords(true);
    generateWords();
  }, [duration, generateWords]);

  // ===== FOCUS MANAGEMENT =====
  const handleContainerClick = useCallback(() => {
    if (inputRef.current && !isTestComplete && timeRemaining > 0) {
      inputRef.current.focus();
    }
  }, [isTestComplete, timeRemaining]);

  // Auto-focus input when test is ready
  useEffect(() => {
    if (!isLoadingWords && !isTestComplete && timeRemaining > 0 && inputRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoadingWords, isTestComplete, timeRemaining]);

  // ===== INPUT HANDLING =====
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isTestComplete || timeRemaining <= 0) {
        return;
      }

      const value = e.target.value;

      // Start test on first keystroke
      if (!isTestActive && value.length > 0) {
        setIsTestActive(true);
        setStartTime(Date.now());
        setTimeRemaining(duration);
        setCorrectChars(0);
        setTotalChars(0);
        setCumulativeCorrectChars(0);
        setCumulativeTotalChars(0);
        setTotalTypedCorrectChars(0);
        setTotalTypedTotalChars(0);
        setIsTestComplete(false);
      }

      // Always allow backspace (deletion) regardless of word completion - CHECK FIRST
      // This includes deletion of spaces and any other characters
      if (value.length < input.length) {
        setInput(value);
        setTotalChars(value.length);

        // Update incorrect characters when deleting (including spaces)
        const newIncorrectChars = new Set(incorrectChars);
        for (let i = value.length; i < input.length; i++) {
          const charKey = `${currentWordIndex}-${i}`;
          newIncorrectChars.delete(charKey);
        }
        setIncorrectChars(newIncorrectChars);

        // Update correct characters count
        let correctCount = 0;
        for (let i = 0; i < value.length; i++) {
          if (
            i < words[currentWordIndex]?.text.length &&
            value[i].toLowerCase() ===
              words[currentWordIndex].text[i].toLowerCase()
          ) {
            correctCount++;
          }
        }
        setCorrectChars(correctCount);
        return;
      }

      // Handle backspace when input is empty (go back to previous word)
      // This covers cases where user is at beginning of new word and tries to delete
      if (value.length === 0 && currentWordIndex > 0) {
        const prevWordIndex = currentWordIndex - 1;
        const prevWord = words[prevWordIndex];
        setCurrentWordIndex(prevWordIndex);
        setInput(prevWord?.text || "");
        setTotalChars(prevWord?.text.length || 0);

        // Update correct characters count for previous word
        let correctCount = 0;
        for (let i = 0; i < (prevWord?.text.length || 0); i++) {
          // This is always true since we're comparing the same character to itself
          // This logic should be updated to compare with the actual typed input
          correctCount++;
        }
        setCorrectChars(correctCount);
        return;
      }

      // Block input if word is complete (but deletion is handled above)
      if (
        input.length >= words[currentWordIndex]?.text.length &&
        value.length > input.length
      ) {
        return;
      }

      setInput(value);
      setTotalChars(value.length);

      // Track incorrect characters (spaces are always considered incorrect in word context)
      const newIncorrectChars = new Set(incorrectChars);
      for (let i = 0; i < value.length; i++) {
        if (
          i < words[currentWordIndex]?.text.length &&
          value[i].toLowerCase() !==
            words[currentWordIndex].text[i].toLowerCase()
        ) {
          const charKey = `${currentWordIndex}-${i}`;
          newIncorrectChars.add(charKey);
        } else if (i >= words[currentWordIndex]?.text.length) {
          // Any character beyond the word length (including spaces) is incorrect
          const charKey = `${currentWordIndex}-${i}`;
          newIncorrectChars.add(charKey);
        }
      }
      setIncorrectChars(newIncorrectChars);

      // Clear incorrect chars when input is empty
      if (value.length === 0) {
        const currentWordIncorrectChars = new Set<string>();
        for (const key of incorrectChars) {
          if (!key.startsWith(`${currentWordIndex}-`)) {
            currentWordIncorrectChars.add(key);
          }
        }
        setIncorrectChars(currentWordIncorrectChars);
      }

      // Update correct characters count
      let correctCount = 0;
      for (let i = 0; i < value.length; i++) {
        if (
          i < words[currentWordIndex]?.text.length &&
          value[i].toLowerCase() ===
            words[currentWordIndex].text[i].toLowerCase()
        ) {
          correctCount++;
        }
      }
      setCorrectChars(correctCount);

      // Update total typed characters for WPM calculation
      setTotalTypedCorrectChars(cumulativeCorrectChars + correctCount);
      setTotalTypedTotalChars(cumulativeTotalChars + value.length);
    },
    [
      isTestActive,
      isTestComplete,
      timeRemaining,
      words,
      currentWordIndex,
      input,
      incorrectChars,
      duration,
      cumulativeCorrectChars,
      cumulativeTotalChars,
    ],
  );

  // ===== KEYBOARD HANDLING =====
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isTestComplete || timeRemaining <= 0) {
        e.preventDefault();
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        e.stopPropagation();

        // Only allow space to move to next word if current word is complete
        if (input.length >= words[currentWordIndex]?.text.length) {
          // Accumulate statistics for the completed word
          setCumulativeCorrectChars((prev) => prev + correctChars);
          setCumulativeTotalChars((prev) => prev + totalChars);

          const nextWordIndex = currentWordIndex + 1;

          // Replace words if we've completed all 25
          if (nextWordIndex === 25) {
            generateWords();
            setCurrentWordIndex(0);
            // Clear incorrect characters for the new word set
            setIncorrectChars(new Set());
          } else {
            setCurrentWordIndex(nextWordIndex);
          }

          // Reset current word statistics
          setCorrectChars(0);
          setTotalChars(0);
          setInput("");
        }
        // If word is not complete, do nothing (spacebar is ignored)
      }

      if (e.key === "Backspace") {
        // Allow deletion of any character (correct or incorrect)
        const newIncorrectChars = new Set(incorrectChars);
        const charKey = `${currentWordIndex}-${input.length - 1}`;
        newIncorrectChars.delete(charKey);
        setIncorrectChars(newIncorrectChars);

        // Allow going back to previous word if current word is empty or has only 1 character
        if (input.length <= 1 && currentWordIndex > 0) {
          setCurrentWordIndex(currentWordIndex - 1);
          setInput(words[currentWordIndex - 1]?.text || "");
        }
      }
    },
    [
      isTestComplete,
      timeRemaining,
      incorrectChars,
      currentWordIndex,
      input,
      generateWords,
      words,
      correctChars,
      totalChars,
    ],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isTestComplete || timeRemaining <= 0) {
        e.preventDefault();
        return;
      }
      // Spacebar logic moved to handleKeyDown for better reliability
    },
    [isTestComplete, timeRemaining],
  );

  // ===== EFFECTS =====
  useEffect(() => {
    generateWords();
  }, [generateWords]);

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
        !isTestComplete &&
        timeRemaining > 0
      ) {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [isTestComplete, timeRemaining]);

  useEffect(() => {
    if (isTestActive && startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);

        setTimeElapsed(elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          endTest();
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTestActive, startTime, duration, endTest]);

  // Calculate current stats using total typed characters for consistent WPM
  const stats: TypingStats = calculateStats(
    totalTypedCorrectChars,
    totalTypedTotalChars,
    timeElapsed,
  );

  return {
    // State
    words,
    currentWordIndex,
    input,
    isTestActive,
    isTestComplete,
    isLoadingWords,
    timeElapsed,
    timeRemaining,
    stats,
    incorrectChars,

    // Refs
    inputRef,

    // Actions
    resetTest,
    handleInputChange,
    handleKeyDown,
    handleKeyPress,
    handleContainerClick,

    // Utils
    formatTime: (seconds: number) => formatTime(seconds),
  };
};
