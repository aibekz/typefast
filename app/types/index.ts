export interface Word {
  text: string;
  status: "correct" | "incorrect" | "pending";
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  correctChars: number;
  totalChars: number;
  incorrectChars: number;
}

export interface TypingState {
  words: Word[];
  currentWordIndex: number;
  input: string;
  isActive: boolean;
  isComplete: boolean;
  isLoading: boolean;
  startTime: number | null;
  timeElapsed: number;
  timeRemaining: number;
  stats: {
    correctChars: number;
    totalChars: number;
    incorrectChars: Set<string>;
  };
}
