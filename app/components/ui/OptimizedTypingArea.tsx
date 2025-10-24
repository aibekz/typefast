import type React from "react";
import { memo } from "react";
import type { Word } from "../../types";

interface OptimizedTypingAreaProps {
  words: Word[];
  currentWordIndex: number;
  input: string;
  incorrectChars: Set<string>;
  inputRef: React.RefObject<HTMLInputElement>;
  onContainerClick: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isTestActive: boolean;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
}

// Memoized character component to prevent unnecessary re-renders
const CharacterComponent = memo(
  ({
    char,
    charIndex,
    wordIndex,
    isTyped,
    isCorrect,
    wasIncorrect,
    isCurrentWord,
    showCursor,
  }: {
    char: string;
    charIndex: number;
    wordIndex: number;
    isTyped: boolean;
    isCorrect: boolean;
    wasIncorrect: boolean;
    isCurrentWord: boolean;
    showCursor: boolean;
  }) => {
    const _charKey = `${wordIndex}-${charIndex}`;

    return (
      <span key={`char-${wordIndex}-${charIndex}-${char}`}>
        {showCursor && (
          <span className="inline-block w-0.5 h-6 bg-[var(--fg-accent)] mr-0.5 animate-pulse"></span>
        )}
        <span
          className={`transition-colors duration-100 ${
            isTyped
              ? isCorrect
                ? "text-green-400"
                : "text-red-400"
              : isCurrentWord
                ? "text-[var(--fg-muted)] opacity-50"
                : wasIncorrect
                  ? "text-red-400"
                  : "text-green-400"
          }`}
        >
          {char}
        </span>
      </span>
    );
  },
);

// Memoized word component
const WordComponent = memo(
  ({
    word,
    index,
    currentWordIndex,
    input,
    incorrectChars,
  }: {
    word: Word;
    index: number;
    currentWordIndex: number;
    input: string;
    incorrectChars: Set<string>;
  }) => {
    const isCurrentWord = index === currentWordIndex;
    const _isCompletedWord = index < currentWordIndex;

    return (
      <span className="inline-block mx-2">
        {word.text.split("").map((char, charIndex) => {
          const isTyped = isCurrentWord && charIndex < input.length;
          const isCorrect =
            isTyped && input[charIndex].toLowerCase() === char.toLowerCase();
          const charKey = `${index}-${charIndex}`;
          const wasIncorrect = incorrectChars.has(charKey);
          const showCursor = isCurrentWord && charIndex === input.length;

          return (
            <CharacterComponent
              key={`char-${index}-${charIndex}-${char}`}
              char={char}
              charIndex={charIndex}
              wordIndex={index}
              isTyped={isTyped}
              isCorrect={isCorrect}
              wasIncorrect={wasIncorrect}
              isCurrentWord={isCurrentWord}
              showCursor={showCursor}
            />
          );
        })}
      </span>
    );
  },
);

// Main component with memo to prevent unnecessary re-renders
const OptimizedTypingArea = memo(
  ({
    words,
    currentWordIndex,
    input,
    incorrectChars,
    inputRef,
    onContainerClick,
    onInputChange,
    onKeyDown,
    onKeyPress,
    isTestActive,
    timeRemaining,
    formatTime,
  }: OptimizedTypingAreaProps) => {
    return (
      <main className="flex flex-col items-center justify-center px-3 sm:px-4 w-full max-w-6xl h-full">
        {/* Timer Counter */}
        <div
          className={`mb-8 text-4xl font-space-grotesk transition-colors duration-200 text-center ${
            isTestActive ? "text-[var(--fg-accent)]" : "text-[var(--fg-muted)]"
          }`}
        >
          {formatTime(timeRemaining)}
        </div>

        <button
          type="button"
          className="w-full max-w-4xl relative cursor-text bg-transparent border-none p-0"
          onClick={onContainerClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onContainerClick();
            }
          }}
          data-typing-area
        >
          <div className="text-lg sm:text-xl md:text-2xl leading-relaxed text-center word-transition">
            {words.map((word, index) => (
              <WordComponent
                key={`word-${index}-${word.text}`}
                word={word}
                index={index}
                currentWordIndex={currentWordIndex}
                input={input}
                incorrectChars={incorrectChars}
              />
            ))}
          </div>

          {/* Hidden input for capturing keystrokes */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            onKeyPress={onKeyPress}
            className="absolute opacity-0 pointer-events-none"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </button>
      </main>
    );
  },
);

OptimizedTypingArea.displayName = "OptimizedTypingArea";

export default OptimizedTypingArea;
