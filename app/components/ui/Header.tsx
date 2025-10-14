export default function Header() {
  return (
    <header className="flex flex-row justify-between items-center p-3 sm:p-4 gap-2 sm:gap-4">
      <div className="text-sm sm:text-base text-[var(--fg-muted)]">
        TypeFast v1.0.0
      </div>
    </header>
  );
}
