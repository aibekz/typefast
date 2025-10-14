"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTypingTest } from "../hooks/useTypingTest";
import Footer from "./ui/Footer";
import Header from "./ui/Header";
import Results from "./ui/Results";
import Toolbar from "./ui/Toolbar";
import TypingArea from "./ui/TypingArea";

function TypingTest() {
  const [duration, setDuration] = useState(60);

  const {
    words,
    currentWordIndex,
    input,
    isTestActive,
    isTestComplete,
    isLoadingWords,
    timeElapsed,
    timeRemaining,
    stats,
    incorrectChars,
    inputRef,
    resetTest,
    handleInputChange,
    handleKeyDown,
    handleKeyPress,
    handleContainerClick,
    formatTime,
  } = useTypingTest(duration);

  // Memoize duration adjustment functions
  const adjustDuration = useCallback(
    (delta: number) => {
      const newDuration = Math.max(5, Math.min(300, duration + delta));
      setDuration(newDuration);
      resetTest();
    },
    [duration, resetTest],
  );

  const setCustomDuration = useCallback((newDuration: number) => {
    const clampedDuration = Math.max(5, Math.min(300, newDuration));
    setDuration(clampedDuration);
  }, []);

  // Memoize the loading state to prevent unnecessary re-renders
  const loadingContent = useMemo(
    () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--fg-accent)] mx-auto mb-4"></div>
          <p className="text-[var(--fg-muted)]">Loading words...</p>
        </div>
      </div>
    ),
    [],
  );

  // Memoize the results content to prevent unnecessary re-renders
  const resultsContent = useMemo(
    () => (
      <div className="flex-1 flex items-center justify-center">
        <Results
          stats={stats}
          timeElapsed={timeElapsed}
          formatTime={formatTime}
          onRestart={resetTest}
        />
      </div>
    ),
    [stats, timeElapsed, formatTime, resetTest],
  );

  // Reset test when duration changes
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  return (
    <div className="h-screen bg-[var(--bg-dark)] text-[var(--fg-light)] font-sans flex flex-col">
      {/* SEO Heading - Hidden but accessible to screen readers */}
      <h1 className="sr-only">TypeFast - Test Your Typing Speed</h1>
      <Header />

      <div className="flex-1 flex flex-col min-h-0">
        {isTestComplete ? (
          resultsContent
        ) : isLoadingWords ? (
          loadingContent
        ) : (
          <>
            <Toolbar
              duration={duration}
              onDurationChange={adjustDuration}
              onSetCustomDuration={setCustomDuration}
              onReset={resetTest}
            />
            <div className="flex-1 flex items-center justify-center">
              <TypingArea
                words={words}
                currentWordIndex={currentWordIndex}
                input={input}
                incorrectChars={incorrectChars}
                inputRef={inputRef as React.RefObject<HTMLInputElement>}
                onContainerClick={handleContainerClick}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onKeyPress={handleKeyPress}
                isTestActive={isTestActive}
                timeRemaining={timeRemaining}
                formatTime={formatTime}
              />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Memoize the main TypingTest component to prevent unnecessary re-renders
export default memo(TypingTest);
