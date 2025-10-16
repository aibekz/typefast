import { useCallback, useEffect, useState } from "react";
import { loadWordList } from "../lib/wordLoader";
import type { Word } from "../types";

interface UseWordManagerProps {
  wordCount?: number;
}

export const useWordManager = ({ wordCount = 25 }: UseWordManagerProps = {}) => {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const generateWords = useCallback(async () => {
    setIsLoading(true);
    try {
      const wordList = await loadWordList();
      const newWords: Word[] = [];
      
      for (let i = 0; i < wordCount; i++) {
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        newWords.push({
          text: randomWord,
          status: "pending",
        });
      }
      
      setWords(newWords);
    } catch (error) {
      console.error("Error generating words:", error);
      // Fallback to basic words
      const fallbackWords = Array.from({ length: wordCount }, (_, i) => ({
        text: `word${i + 1}`,
        status: "pending" as const,
      }));
      setWords(fallbackWords);
    } finally {
      setIsLoading(false);
    }
  }, [wordCount]);

  const nextWord = useCallback(() => {
    setCurrentWordIndex(prev => {
      const nextIndex = prev + 1;
      
      // If we've completed all words, generate new ones
      if (nextIndex >= words.length) {
        generateWords();
        return 0;
      }
      
      return nextIndex;
    });
  }, [words.length, generateWords]);

  const previousWord = useCallback(() => {
    setCurrentWordIndex(prev => Math.max(0, prev - 1));
  }, []);

  const resetWords = useCallback(() => {
    setCurrentWordIndex(0);
    setWords([]);
    generateWords();
  }, [generateWords]);

  const getCurrentWord = useCallback(() => {
    return words[currentWordIndex];
  }, [words, currentWordIndex]);

  const isLastWord = currentWordIndex >= words.length - 1;

  useEffect(() => {
    generateWords();
  }, [generateWords]);

  return {
    words,
    currentWordIndex,
    isLoading,
    getCurrentWord,
    isLastWord,
    nextWord,
    previousWord,
    resetWords,
    generateWords,
  };
};
