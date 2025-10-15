interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen bg-[var(--bg-dark)] text-[var(--fg-light)] font-sans flex flex-col">
      {/* SEO Heading - Hidden but accessible to screen readers */}
      <h1 className="sr-only">TypeFast - Test Your Typing Speed</h1>
      
      {/* Header */}
      <header className="flex flex-row justify-between items-center p-3 sm:p-4 gap-2 sm:gap-4">
        <div className="text-sm sm:text-base text-[var(--fg-muted)]">
          TypeFast v1.0.0
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>

      {/* Footer */}
      <footer>
        <div className="text-center text-xs text-[var(--fg-muted)] py-2">
          © 2025 TypeFast from{" "}
          <a
            href="https://nvix.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--fg-light)] hover:opacity-80 transition-opacity"
          >
            Nvix I/O
          </a>
        </div>
      </footer>
    </div>
  );
}
