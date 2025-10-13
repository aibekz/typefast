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

export interface TestState {
  isActive: boolean;
  isComplete: boolean;
  currentWordIndex: number;
  input: string;
  startTime: number | null;
}
