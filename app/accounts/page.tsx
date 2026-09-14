import { redirect } from 'next/navigation';
import { getAccounts, getTotalAccountsPages } from '@/lib/data/accounts';
import AccountsManager from '@/lib/ui/accounts-manager';
import Pagination from '@/lib/ui/pagination';

export default async function AccountsPage(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const totalPages = await getTotalAccountsPages();
  let currentPage = Number(searchParams?.page) || 1;
  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
    redirect(`/accounts?page=${currentPage.toString()}`);
  }
  const accounts = await getAccounts({ currentPage });

  return (
    <main className="flex flex-1 flex-col w-full max-w-5xl mx-auto px-6 py-10 gap-6">
      <AccountsManager accounts={accounts} />

      <div className="flex justify-center sm:justify-end">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}