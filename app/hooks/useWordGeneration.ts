import { useCallback, useState } from "react";
import { loadWordList } from "../lib/wordLoader";
import type { Word } from "../types";

export const useWordGeneration = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return {
    words,
    isLoading,
    generateWords,
  };
};
