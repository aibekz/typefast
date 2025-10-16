import { useEffect, useRef, useState } from "react";

interface ToolbarProps {
  duration: number;
  onDurationChange: (delta: number) => void;
  onSetCustomDuration: (duration: number) => void;
  onReset: () => void;
}

function Toolbar({
  duration,
  onDurationChange,
  onSetCustomDuration,
  onReset,
}: ToolbarProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (showCustomModal && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [showCustomModal]);

  const handlePresetTime = (seconds: number) => {
    onDurationChange(seconds - duration);
  };

  const handleCustomTime = () => {
    const seconds = parseInt(customTime, 10);
    if (seconds >= 5 && seconds <= 300) {
      onSetCustomDuration(seconds);
      setShowCustomModal(false);
      setCustomTime("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomTime();
    } else if (e.key === "Escape") {
      setShowCustomModal(false);
      setCustomTime("");
    }
  };

  const durationPresets = [15, 20, 30, 60];

  return (
    <>
      <div className="flex flex-row justify-center items-center gap-2 max-w-4xl mx-auto px-4 py-4">
        {/* Time Presets */}
        <div className="flex items-center gap-2">
          {durationPresets.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => handlePresetTime(seconds)}
              className={`px-3 py-1 text-sm font-mono transition-all duration-200 rounded ${
                duration === seconds
                  ? "bg-[var(--purple-button)] text-white"
                  : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--fg-muted)] hover:bg-[var(--border-light)] hover:text-[var(--fg-light)]"
              }`}
            >
              {seconds}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="px-3 py-1 text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--fg-muted)] hover:bg-[var(--border-light)] hover:text-[var(--fg-light)] transition-all duration-200 rounded font-mono"
          >
            custom
          </button>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1 text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--fg-muted)] hover:bg-[var(--border-light)] hover:text-[var(--fg-light)] transition-all duration-200 rounded font-mono ml-4"
        >
          reset
        </button>
      </div>

      {/* Custom Time Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-[var(--fg-light)] mb-4">
              Enter custom time
            </h3>
            <div className="mb-4">
              <input
                type="text"
                inputMode="numeric"
                value={customTime}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers and empty string
                  if (value === "" || /^\d*$/.test(value)) {
                    setCustomTime(value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter seconds (e.g., 10, 45, 120, 180)"
                className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] text-[var(--fg-light)] rounded font-mono focus:border-[var(--fg-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--fg-accent)] focus:ring-opacity-50"
                autoComplete="off"
                spellCheck="false"
                tabIndex={0}
                ref={inputRef}
              />
              <p className="text-xs text-[var(--fg-muted)] mt-1">
                Enter any number between 5 and 300 seconds (5 seconds to 5
                minutes)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCustomTime}
                disabled={
                  !customTime ||
                  parseInt(customTime, 10) < 5 ||
                  parseInt(customTime, 10) > 300
                }
                className="px-4 py-2 bg-[var(--purple-button)] text-white rounded font-mono hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Time
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomModal(false);
                  setCustomTime("");
                }}
                className="px-4 py-2 bg-[var(--bg-dark)] border border-[var(--border)] text-[var(--fg-light)] rounded font-mono hover:bg-[var(--border-light)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Toolbar;
