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

// Simplified word rendering component
const WordComponent = ({
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

  if (isCurrentWord) {
    return (
      <span className="inline-block mx-2">
        {word.text.split("").map((char, charIndex) => {
          const isTyped = charIndex < input.length;
          const isCorrect = isTyped && input[charIndex].toLowerCase() === char.toLowerCase();
          const charKey = `${index}-${charIndex}`;
          const wasIncorrect = incorrectChars.has(charKey);

          return (
            <span key={`char-${index}-${charIndex}-${char}`}>
              {charIndex === input.length && (
                <span className="inline-block w-0.5 h-6 bg-[var(--fg-accent)] mr-0.5 animate-pulse"></span>
              )}
              <span
                className={`transition-colors duration-100 ${
                  isTyped
                    ? isCorrect
                      ? "text-green-400" // Correct typed characters in green
                      : "text-red-400"   // Incorrect typed characters in red
                    : "text-[var(--fg-muted)] opacity-50" // Untyped characters
                }`}
              >
                {char}
              </span>
              {charIndex === word.text.length - 1 && input.length === word.text.length && (
                <span className="inline-block w-0.5 h-6 bg-[var(--fg-accent)] ml-0.5 animate-pulse"></span>
              )}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span className="inline-block mx-2">
      {word.text.split("").map((char, charIndex) => {
        const charKey = `${index}-${charIndex}`;
        const wasIncorrect = incorrectChars.has(charKey);

        return (
          <span
            key={`char-${index}-${charIndex}-${char}`}
            className={`transition-colors duration-100 ${
              isCompletedWord
                ? wasIncorrect
                  ? "text-red-400" // Keep error characters in red for completed words
                  : "text-green-400" // Correct characters in green for completed words
                : "text-[var(--fg-muted)] opacity-50" // Future words
            }`}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

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
  return (
    <main className="flex flex-col items-center justify-center px-3 sm:px-4">
      {/* Timer Counter - Always visible */}
      <div className={`mb-4 text-4xl font-space-grotesk transition-colors duration-200 ${
        isTestActive ? "text-[var(--fg-accent)]" : "text-[var(--fg-muted)]"
      }`}>
        {formatTime(timeRemaining)}
      </div>

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
}

export default TypingArea;
