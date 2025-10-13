interface HeaderProps {
  duration: number;
  timeRemaining: number;
  isTestActive: boolean;
  onDurationChange: (delta: number) => void;
  onReset: () => void;
  formatTime: (seconds: number) => string;
}

export default function Header({
  duration,
  timeRemaining,
  isTestActive,
  onDurationChange,
  onReset,
  formatTime,
}: HeaderProps) {
  return (
    <header className="flex flex-row justify-between items-center p-3 sm:p-4 gap-2 sm:gap-4">
      <div className="text-sm sm:text-base text-[var(--fg-muted)]">
        TypeFast v1.0.0
      </div>

      <div className="flex flex-row items-center gap-2 sm:gap-4">
        {/* Duration Controls / Timer */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDurationChange(-15)}
            className="px-2 sm:px-3 py-2 text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--fg-light)] hover:bg-[var(--border-light)] hover:border-[var(--border-light)] transition-all duration-200 rounded min-w-[1.5rem] sm:min-w-[2rem] font-mono"
          >
            -
          </button>
          <span className="text-sm sm:text-base font-mono min-w-[3rem] text-center px-3 py-2 text-[var(--fg-accent)]">
            {isTestActive ? formatTime(timeRemaining) : formatTime(duration)}
          </span>
          <button
            type="button"
            onClick={() => onDurationChange(15)}
            className="px-2 sm:px-3 py-2 text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--fg-light)] hover:bg-[var(--border-light)] hover:border-[var(--border-light)] transition-all duration-200 rounded min-w-[1.5rem] sm:min-w-[2rem] font-mono"
          >
            +
          </button>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--fg-light)] hover:bg-[var(--border-light)] hover:border-[var(--border-light)] transition-all duration-200 rounded font-mono"
        >
          Reset Test
        </button>
      </div>
    </header>
  );
}
