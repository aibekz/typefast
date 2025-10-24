import { useCallback, useEffect, useRef, useState } from "react";

interface TimerState {
  isActive: boolean;
  timeElapsed: number;
  timeRemaining: number;
  startTime: number | null;
}

interface UseTimerProps {
  duration: number;
  onTimeUp?: () => void;
}

export const useTimer = ({ duration, onTimeUp }: UseTimerProps) => {
  const [state, setState] = useState<TimerState>({
    isActive: false,
    timeElapsed: 0,
    timeRemaining: duration,
    startTime: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: true,
      startTime: Date.now(),
    }));
  }, []);

  const stopTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setState({
      isActive: false,
      timeElapsed: 0,
      timeRemaining: duration,
      startTime: null,
    });
  }, [duration]);

  // Timer effect - optimized to only run when needed
  useEffect(() => {
    if (!state.isActive || !state.startTime) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (state.startTime || 0)) / 1000);
      const remaining = Math.max(0, duration - elapsed);

      setState((prev) => ({
        ...prev,
        timeElapsed: elapsed,
        timeRemaining: remaining,
      }));

      if (remaining <= 0) {
        stopTimer();
        onTimeUp?.();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.isActive, state.startTime, duration, stopTimer, onTimeUp]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    ...state,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
};
