export default function Footer() {
  return (
    <footer>
      <div className="text-center text-xs text-[var(--fg-muted)] py-2">
        © 2025 TypeFast from{" "}
        <a
          href="https://nvixio.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--fg-light)] hover:opacity-80 transition-opacity"
        >
          Nvixio
        </a>
      </div>
    </footer>
  );
}
