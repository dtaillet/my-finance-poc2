import { redirect } from 'next/navigation';
import { getAccountOptions } from '@/lib/data/accounts';
import { getCreditCards, getTotalCreditCardsPages } from '@/lib/data/credit-cards';
import CreditCardsManager from '@/lib/ui/credit-cards-manager';
import Pagination from '@/lib/ui/pagination';

export default async function CreditCardsPage(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const totalPages = await getTotalCreditCardsPages();
  let currentPage = Number(searchParams?.page) || 1;
  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
    redirect(`/credit-cards?page=${currentPage.toString()}`);
  }
  const [creditCards, accounts] = await Promise.all([
    getCreditCards({ currentPage }),
    getAccountOptions(),
  ]);

  return (
    <main className="flex flex-1 flex-col w-full max-w-7xl mx-auto px-6 py-10 gap-6">
      <CreditCardsManager creditCards={creditCards} accounts={accounts} />

      <div className="flex justify-center sm:justify-end">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}