"use client";

import { useEffect, useState } from "react";
import { useTypingTestOptimized } from "../hooks/useTypingTestOptimized";
import OptimizedTypingArea from "./ui/OptimizedTypingArea";
import Results from "./ui/Results";
import Toolbar from "./ui/Toolbar";

function OptimizedTypingTest() {
  const [duration, setDuration] = useState(60);

  const {
    words,
    currentWordIndex,
    input,
    isActive,
    isComplete,
    isLoading,
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
  } = useTypingTestOptimized({ duration });

  const adjustDuration = (delta: number) => {
    const newDuration = Math.max(5, Math.min(300, duration + delta));
    setDuration(newDuration);
    resetTest();
  };

  const setCustomDuration = (newDuration: number) => {
    const clampedDuration = Math.max(5, Math.min(300, newDuration));
    setDuration(clampedDuration);
  };

  // Reset test when duration changes
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  return (
    <>
      {isComplete ? (
        <div className="flex items-center justify-center p-4">
          <Results
            stats={stats}
            timeElapsed={timeElapsed}
            formatTime={formatTime}
            onRestart={resetTest}
          />
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--purple-button)] mx-auto mb-4"></div>
            <p className="text-[var(--fg-muted)]">Loading words...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-shrink-0">
            <Toolbar
              duration={duration}
              isActive={isActive}
              onDurationChange={adjustDuration}
              onSetCustomDuration={setCustomDuration}
              onReset={resetTest}
            />
          </div>
          <div className="flex items-center justify-center p-4">
            <OptimizedTypingArea
              words={words}
              currentWordIndex={currentWordIndex}
              input={input}
              incorrectChars={incorrectChars}
              inputRef={inputRef as React.RefObject<HTMLInputElement>}
              onContainerClick={handleContainerClick}
              onInputChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onKeyPress={handleKeyPress}
              isTestActive={isActive}
              timeRemaining={timeRemaining}
              formatTime={formatTime}
            />
          </div>
        </>
      )}
    </>
  );
}

export default OptimizedTypingTest;
