import Link from "next/link";

export default function TopMenu() {
  return (
    <header className="w-full border-b border-line-2 bg-card">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-3">
        <Link
          href="/"
          aria-label="Home"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-opacity hover:opacity-80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
          </svg>
          <span className="sr-only sm:not-sr-only">Home</span>
        </Link>
        <Link
          href="/transactions"
          className="text-sm font-medium text-muted-foreground-1 transition-colors hover:text-foreground"
        >
          Transactions
        </Link>
      </nav>
    </header>
  );
}
