/**
 * Utility to load word list from JSON file
 */
let wordListCache: string[] | null = null;
let loadingPromise: Promise<string[]> | null = null;

export const loadWordList = async (): Promise<string[]> => {
  // Return cached version if available
  if (wordListCache) {
    return wordListCache;
  }

  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      const response = await fetch("/words.json", {
        cache: "force-cache",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load word list: ${response.status}`);
      }

      const words = await response.json();

      // Cache the result
      wordListCache = words;
      loadingPromise = null;

      return words;
    } catch (error) {
      console.error("Error loading word list:", error);
      loadingPromise = null;

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
  })();

  return loadingPromise;
};

/**
 * Get a random word from the loaded word list
 */
export const getRandomWord = async (): Promise<string> => {
  const words = await loadWordList();
  return words[Math.floor(Math.random() * words.length)];
};
