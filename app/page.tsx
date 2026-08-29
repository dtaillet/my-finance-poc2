import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">MyFinance</h1>
        <p className="max-w-sm text-muted-foreground-1">
          A simple view of your personal finances.
        </p>
      </div>
      <Link
        href="/transactions"
        className="inline-flex items-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        View transactions
      </Link>
    </main>
  );
}
