import { memo, useMemo } from "react";
import type { Word } from "../../types";

interface TypingAreaProps {
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

// Memoized component for individual word rendering
const MemoizedWord = memo(
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
    const isCompletedWord = index < currentWordIndex;

    const wordContent = useMemo(() => {
      if (isCurrentWord) {
        return word.text.split("").map((char, charIndex) => {
          const isTyped = charIndex < input.length;
          const isCorrect =
            isTyped && input[charIndex].toLowerCase() === char.toLowerCase();
          const charKey = `${index}-${charIndex}`;
          const _wasIncorrect = incorrectChars.has(charKey);

          return (
            <span key={`char-${index}-${charIndex}-${char}`}>
              {/* Cursor positioned at current typing position - before the character */}
              {charIndex === input.length && (
                <span className="inline-block w-0.5 h-6 bg-[var(--fg-accent)] mr-0.5 animate-pulse"></span>
              )}
              <span
                className={`transition-colors duration-100 ${
                  isTyped
                    ? isCorrect
                      ? "text-[var(--fg-accent)]"
                      : "text-red-400"
                    : "text-[var(--fg-muted)] opacity-50"
                }`}
              >
                {char}
              </span>
              {/* Cursor at the end if word is complete */}
              {charIndex === word.text.length - 1 &&
                input.length === word.text.length && (
                  <span className="inline-block w-0.5 h-6 bg-[var(--fg-accent)] ml-0.5 animate-pulse"></span>
                )}
            </span>
          );
        });
      } else {
        return word.text.split("").map((char, charIndex) => {
          const charKey = `${index}-${charIndex}`;
          const _wasIncorrect = incorrectChars.has(charKey);

          return (
            <span
              key={`char-${index}-${charIndex}-${char}`}
              className={`transition-colors duration-100 ${
                _wasIncorrect
                  ? "text-red-400"
                  : "text-[var(--fg-light)] opacity-60"
              }`}
            >
              {char}
            </span>
          );
        });
      }
    }, [word.text, index, input, incorrectChars, isCurrentWord]);

    return (
      <span
        key={`word-${index}-${word.text}`}
        className={`inline-block mx-2 transition-colors duration-200 ${
          isCurrentWord
            ? "text-[var(--fg-accent)]"
            : isCompletedWord
              ? "text-[var(--fg-light)] opacity-60"
              : "text-[var(--fg-muted)] opacity-50"
        }`}
      >
        {wordContent}
      </span>
    );
  },
);

MemoizedWord.displayName = "MemoizedWord";

function TypingArea({
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
}: TypingAreaProps) {
  // Memoize the formatted time to prevent unnecessary recalculations
  const formattedTime = useMemo(
    () => formatTime(timeRemaining),
    [formatTime, timeRemaining],
  );

  // Memoize the timer display class to prevent unnecessary re-renders
  const timerClass = useMemo(
    () =>
      `mb-4 text-4xl font-mono transition-colors duration-200 ${
        isTestActive ? "text-[var(--fg-accent)]" : "text-[var(--fg-muted)]"
      }`,
    [isTestActive],
  );

  return (
    <main className="flex flex-col items-center justify-center px-3 sm:px-4">
      {/* Timer Counter - Always visible */}
      <div className={timerClass}>{formattedTime}</div>

      <button
        type="button"
        className="w-full max-w-4xl mb-6 sm:mb-8 relative cursor-text bg-transparent border-none p-0"
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
            <MemoizedWord
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
}

// Memoize the main TypingArea component to prevent unnecessary re-renders
export default memo(TypingArea);
