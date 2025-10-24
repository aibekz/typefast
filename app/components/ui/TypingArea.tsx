import { RotateCcw, MousePointer } from "lucide-react";
import { useEffect, useState } from "react";
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
  onReset: () => void;
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
          const isCorrect =
            isTyped && input[charIndex].toLowerCase() === char.toLowerCase();
          const charKey = `${index}-${charIndex}`;
          const _wasIncorrect = incorrectChars.has(charKey);

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
                      : "text-red-400" // Incorrect typed characters in red
                    : "text-[var(--fg-muted)] opacity-50" // Untyped characters
                }`}
              >
                {char}
              </span>
              {charIndex === word.text.length - 1 &&
                input.length === word.text.length && (
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
  onReset,
}: TypingAreaProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Track focus state
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);
      
      return () => {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      };
    }
  }, [inputRef]);

  // Global keydown listener to focus input on any key press
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only focus if not already focused
      if (!isFocused && inputRef.current) {
        // Focus the input first
        inputRef.current.focus();
        
        // If it's a printable character, simulate the key press in the input
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // Prevent the default behavior
          e.preventDefault();
          
          // Create a synthetic input event with the pressed key
          const syntheticEvent = new Event('input', { bubbles: true });
          Object.defineProperty(syntheticEvent, 'target', {
            value: inputRef.current,
            enumerable: true
          });
          
          // Set the input value to include the pressed key
          const currentValue = inputRef.current.value;
          inputRef.current.value = currentValue + e.key;
          
          // Dispatch the synthetic input event
          inputRef.current.dispatchEvent(syntheticEvent);
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFocused, inputRef]);



  return (
    <main className="flex flex-col items-center justify-center px-3 sm:px-4 w-full max-w-6xl h-full">
      {/* Timer Counter - Always visible */}
      <div
        className={`mb-8 text-4xl font-space-grotesk transition-colors duration-200 text-center ${
          isTestActive ? "text-[var(--fg-accent)]" : "text-[var(--fg-muted)]"
        }`}
      >
        {formatTime(timeRemaining)}
      </div>

      <button
        type="button"
        className="w-full relative cursor-text bg-transparent border border-dashed border-[var(--border)] p-4 transition-colors duration-200 hover:border-[var(--fg-muted)]"
        onClick={(e) => {
          // Only focus when clicking the text area
          onContainerClick();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onContainerClick();
          }
        }}
        data-typing-area
      >
        <div className={`text-lg sm:text-xl md:text-2xl leading-relaxed text-center word-transition transition-all duration-300 ${
          !isFocused ? 'blur-sm opacity-60' : 'blur-none opacity-100'
        }`}>
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

        {/* Focus message overlay */}
        {!isFocused && timeRemaining > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)] opacity-80">
              <MousePointer className="h-4 w-4" />
              <span>Click here or press any key to focus</span>
            </div>
          </div>
        )}

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

      {/* Reset Button */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg-light)] hover:bg-[var(--bg-dark)] rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--purple-button)] focus:ring-opacity-50"
          title="Reset test"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </main>
  );
}

export default TypingArea;
