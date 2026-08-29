import AccountSelect from "@/lib/ui/account-select";
import Pagination from "@/lib/ui/pagination";
import TagFilter from "@/lib/ui/tag-filter";
import TransactionsTable from "@/lib/ui/transactions-table";
import { getAccountIds, getAllTags, getTotalTransactionsPages } from "@/lib/data/transactions";
import { redirect } from "next/navigation";
import { Suspense } from "react";


export default async function TransactionsPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    account_id?: string;
    tags?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const accountIds = await getAccountIds();
  const selectedAccountIds = (searchParams?.account_id?.split(',').map((id) => id.trim()).filter(Boolean) ?? [])
    .filter((id) => accountIds.includes(id));
  const allTags = getAllTags();
  const tags = (searchParams?.tags?.split(',').map((tag) => tag.trim()).filter(Boolean) ?? [])
    .filter((tag) => allTags.includes(tag));
  const totalPages = await getTotalTransactionsPages({ accountIds: selectedAccountIds, tags });
  let currentPage = Number(searchParams?.page) || 1;
  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
    const params = new URLSearchParams();
    if (selectedAccountIds.length > 0) params.set('account_id', selectedAccountIds.join(','));
    if (tags.length > 0) params.set('tags', tags.join(','));
    params.set('page', currentPage.toString());
    redirect(`/transactions?${params.toString()}`);
  }

  return (
    <main className="flex flex-1 flex-col w-full max-w-5xl mx-auto px-6 py-10 gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Transactions
        </h1>
        <AccountSelect accountIds={accountIds} selected={selectedAccountIds} />
      </div>

      <TagFilter allTags={allTags} selected={tags} />

      <div className="rounded-xl border border-line-2 bg-card overflow-hidden">
        <Suspense fallback={<p className="p-6 text-sm text-muted-foreground-1">Fetching transactions...</p>}>
          <TransactionsTable currentPage={currentPage} accountIds={selectedAccountIds} tags={tags} />
        </Suspense>
      </div>

      <div className="flex justify-center sm:justify-end">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}