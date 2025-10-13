"use client";

import { useCallback, useState } from "react";
import { useTypingTest } from "../hooks/useTypingTest";
import Footer from "./ui/Footer";
import Header from "./ui/Header";
import Results from "./ui/Results";
import TypingArea from "./ui/TypingArea";

export default function TypingTest() {
  const [duration, setDuration] = useState(60);

  const {
    words,
    currentWordIndex,
    input,
    isTestActive,
    isTestComplete,
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

  // Adjust duration
  const adjustDuration = useCallback(
    (delta: number) => {
      const newDuration = Math.max(5, Math.min(300, duration + delta));
      setDuration(newDuration);
      resetTest();
    },
    [duration, resetTest],
  );

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--fg-light)] font-sans">
      {/* SEO Heading - Hidden but accessible to screen readers */}
      <h1 className="sr-only">TypeFast - Free Online Typing Speed Test</h1>
      <Header
        duration={duration}
        timeRemaining={timeRemaining}
        isTestActive={isTestActive}
        onDurationChange={adjustDuration}
        onReset={resetTest}
        formatTime={formatTime}
      />

      {isTestComplete && (
        <Results
          stats={stats}
          timeElapsed={timeElapsed}
          formatTime={formatTime}
          onRestart={resetTest}
        />
      )}

      {!isTestComplete && (
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
        />
      )}

      <Footer />
    </div>
  );
}
