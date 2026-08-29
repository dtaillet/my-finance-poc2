import AccountSelect from "@/lib/ui/account-select";
import Pagination from "@/lib/ui/pagination";
import { getAccountIds, getTotalTransactionsPages, getTransactions } from "@/lib/data/transactions";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Transactions({ currentPage, accountId }: { currentPage: number; accountId?: string }) {
  const transactions = await getTransactions({ currentPage, accountId });
  const eurFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
  const dateFormatter = new Intl.DateTimeFormat("fr-FR");
  return (
    <div className="min-w-full">
      <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
        <table className="min-w-full divide-y divide-table-line">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">#</th>
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Account</th>
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Date</th>
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Name</th>
              <th scope="col" className="px-4 py-3 text-end text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-line">
            {transactions.map((transaction) => (
              <tr key={transaction.fitid} className="hover:bg-muted-hover">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-1">{transaction.row_num}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{transaction.account_id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-1">{dateFormatter.format(new Date(transaction.dtposted))}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{transaction.name}</td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm text-end font-medium tabular-nums ${transaction.trnamt < 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-500"}`}>{eurFormatter.format(transaction.trnamt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


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
          <Transactions currentPage={currentPage} accountId={accountId} />
        </Suspense>
      </div>

      <div className="flex justify-center sm:justify-end">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}