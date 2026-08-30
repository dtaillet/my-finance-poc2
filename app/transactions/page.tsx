import AccountSelect from "@/lib/ui/account-select";
import ClearFilters from "@/lib/ui/clear-filters";
import FilterChips from "@/lib/ui/filter-chips";
import NameSearch from "@/lib/ui/name-search";
import Pagination from "@/lib/ui/pagination";
import TagFilter from "@/lib/ui/tag-filter";
import TransactionsTable from "@/lib/ui/transactions-table";
import { getAccountIds, getAllTags, getTotalTransactionsPages } from "@/lib/data/transactions";
import { UNTAGGED_FILTER } from "@/lib/tags";
import { redirect } from "next/navigation";
import { Suspense } from "react";


export default async function TransactionsPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    account_id?: string;
    tags?: string;
    search?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const accountIds = await getAccountIds();
  const selectedAccountIds = (searchParams?.account_id?.split(',').map((id) => id.trim()).filter(Boolean) ?? [])
    .filter((id) => accountIds.includes(id));
  const allTags = getAllTags();
  const tags = (searchParams?.tags?.split(',').map((tag) => tag.trim()).filter(Boolean) ?? [])
    .filter((tag) => tag === UNTAGGED_FILTER || allTags.includes(tag));
  const searches = searchParams?.search?.split(',').map((term) => term.trim()).filter(Boolean) ?? [];
  const totalPages = await getTotalTransactionsPages({ accountIds: selectedAccountIds, tags, searches });
  let currentPage = Number(searchParams?.page) || 1;
  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
    const params = new URLSearchParams();
    if (selectedAccountIds.length > 0) params.set('account_id', selectedAccountIds.join(','));
    if (tags.length > 0) params.set('tags', tags.join(','));
    if (searches.length > 0) params.set('search', searches.join(','));
    params.set('page', currentPage.toString());
    redirect(`/transactions?${params.toString()}`);
  }

  return (
    <main className="flex flex-1 flex-col w-full max-w-screen-2xl mx-auto px-6 py-10 gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Transactions
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <AccountSelect accountIds={accountIds} selected={selectedAccountIds} />
        <TagFilter allTags={allTags} selected={tags} />
        <NameSearch selected={searches} />
        <FilterChips accounts={selectedAccountIds} tags={tags} searches={searches} />
        <ClearFilters hasFilters={selectedAccountIds.length > 0 || tags.length > 0 || searches.length > 0} />
      </div>

      <div className="rounded-xl border border-line-2 bg-card overflow-hidden">
        <Suspense fallback={<p className="p-6 text-sm text-muted-foreground-1">Fetching transactions...</p>}>
          <TransactionsTable currentPage={currentPage} accountIds={selectedAccountIds} tags={tags} searches={searches} />
        </Suspense>
      </div>

      <div className="flex justify-center sm:justify-end">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}