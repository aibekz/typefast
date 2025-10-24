import { useCallback, useRef, useState } from "react";

interface UseTypingInputProps {
  onInputChange: (input: string) => void;
  onWordComplete: () => void;
  onBackspace: () => void;
  isActive: boolean;
}

export const useTypingInput = ({
  onInputChange,
  onWordComplete,
  onBackspace,
  isActive,
}: UseTypingInputProps) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isActive) return;

      const value = e.target.value;
      setInput(value);
      onInputChange(value);
    },
    [isActive, onInputChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isActive) {
        e.preventDefault();
        return;
      }

      if (e.key === "Backspace" && input.length === 0) {
        e.preventDefault();
        onBackspace();
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        onWordComplete();
        setInput("");
        return;
      }
    },
    [isActive, input.length, onBackspace, onWordComplete],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isActive) {
        e.preventDefault();
        return;
      }
    },
    [isActive],
  );

  const focusInput = useCallback(() => {
    if (inputRef.current && isActive) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const clearInput = useCallback(() => {
    setInput("");
  }, []);

  const setInputValue = useCallback((value: string) => {
    setInput(value);
  }, []);

  return {
    input,
    inputRef,
    handleInputChange,
    handleKeyDown,
    handleKeyPress,
    focusInput,
    clearInput,
    setInputValue,
  };
};
