import AccountSelect from "@/lib/ui/account-select";
import Pagination from "@/lib/ui/pagination";
import TransactionsTable from "@/lib/ui/transactions-table";
import { getAccountIds, getTotalTransactionsPages } from "@/lib/data/transactions";
import { redirect } from "next/navigation";
import { Suspense } from "react";


export default async function TransactionsPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    account_id?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const accountId = searchParams?.account_id || undefined;
  const accountIds = await getAccountIds();
  const totalPages = await getTotalTransactionsPages({ accountId });
  let currentPage = Number(searchParams?.page) || 1;
  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
    const params = new URLSearchParams();
    if (accountId) params.set('account_id', accountId);
    params.set('page', currentPage.toString());
    redirect(`/transactions?${params.toString()}`);
  }

  return (
    <main className="flex flex-1 flex-col w-full max-w-5xl mx-auto px-6 py-10 gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Transactions
        </h1>
        <AccountSelect accountIds={accountIds} selected={accountId} />
      </div>

      <div className="rounded-xl border border-line-2 bg-card overflow-hidden">
        <Suspense fallback={<p className="p-6 text-sm text-muted-foreground-1">Fetching transactions...</p>}>
          <TransactionsTable currentPage={currentPage} accountId={accountId} />
        </Suspense>
      </div>

      <div className="flex justify-center sm:justify-end">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}