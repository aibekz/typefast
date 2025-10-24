import { useCallback, useEffect, useRef, useState } from "react";

export const useTypingTimer = (duration: number) => {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isComplete, setIsComplete] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTestRef = useRef<(() => void) | undefined>(undefined);

  const startTimer = useCallback(() => {
    setIsActive(true);
    setStartTime(Date.now());
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
    setIsComplete(true);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setStartTime(null);
    setTimeElapsed(0);
    setTimeRemaining(duration);
    setIsComplete(false);
  }, [duration]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Store endTest in ref to avoid timer restarts
  endTestRef.current = stopTimer;

  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);

        setTimeElapsed(elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          endTestRef.current?.();
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, startTime, duration]);

  return {
    isActive,
    timeElapsed,
    timeRemaining,
    isComplete,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
};
