/**
 * Simplified word list loader
 */
export const loadWordList = async (): Promise<string[]> => {
  try {
    const response = await fetch("/words.json");
    if (!response.ok) {
      throw new Error(`Failed to load word list: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading word list:", error);
    // Fallback to a minimal word list
    return [
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
      "this",
      "but",
      "his",
      "by",
      "from",
      "they",
      "she",
      "or",
      "an",
      "will",
      "my",
      "one",
      "all",
      "would",
      "there",
      "their",
      "what",
      "so",
      "up",
      "out",
      "if",
      "about",
      "who",
      "get",
      "which",
      "go",
      "me",
      "when",
      "make",
      "can",
      "like",
      "time",
      "no",
      "just",
      "him",
      "know",
      "take",
      "people",
      "into",
      "year",
    ];
  }
};

/**
 * Get a random word from the loaded word list
 */
export const getRandomWord = async (): Promise<string> => {
  const words = await loadWordList();
  return words[Math.floor(Math.random() * words.length)];
};
