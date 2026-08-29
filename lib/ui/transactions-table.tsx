import { getAllTags, getTransactions } from "@/lib/data/transactions";
import TransactionTags from "@/lib/ui/transaction-tags";

export default async function TransactionsTable({ currentPage, accountId }: { currentPage: number; accountId?: string }) {
  const transactions = await getTransactions({ currentPage, accountId });
  const allTags = getAllTags();
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
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Tags</th>
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
                <td className="px-4 py-3 text-sm"><TransactionTags fitid={transaction.fitid} tags={transaction.tags} suggestions={allTags} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
