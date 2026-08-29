'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { previewFilterMatches, applyFilterTag } from '@/app/filters/actions';
import type { Filter, MatchingTransaction } from '@/lib/data/filters';

export default function FilterApply({ filter }: { filter: Filter }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Apply tag for filter ${filter.name}`}
        className="inline-flex items-center gap-1 rounded-lg border border-line-2 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted-hover focus:outline-hidden"
      >
        <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /><path d="m9 14 2 2 4-4" /><path d="M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2Z" /></svg>
        Apply tag
      </button>

      {open && <ApplyDialog filter={filter} onClose={() => setOpen(false)} />}
    </>
  );
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' });

function formatAmount(amount: number, currency: string | null) {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency || 'EUR' }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

function ApplyDialog({ filter, onClose }: { filter: Filter; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<MatchingTransaction[]>([]);
  const [added, setAdded] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    previewFilterMatches(filter.filter_id).then((result) => {
      if (!active) return;
      if ('error' in result) {
        setError(result.error);
      } else {
        setTransactions(result.transactions);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [filter.filter_id]);

  function handleApply() {
    startTransition(async () => {
      const result = await applyFilterTag(filter.filter_id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setAdded(result.added ?? 0);
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-dialog-title"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-line-2 bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="apply-dialog-title" className="text-lg font-semibold text-foreground">
            Apply tag{' '}
            <span className="inline-flex items-center rounded-full border border-line-2 bg-muted-hover px-2 py-0.5 text-xs">{filter.tag}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-muted-foreground-1 transition-colors hover:text-foreground"
          >
            <svg className="size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        {added !== null ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-line-2 bg-muted-hover p-4 text-sm text-foreground" role="status">
              Tag <span className="font-medium">{filter.tag}</span> added to {added} transaction{added === 1 ? '' : 's'}.
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-hidden"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground-1">
              Transactions without the tag whose name contains one of: {filter.values.map((value) => (
                <span key={value} className="mr-1 inline-flex items-center rounded-full border border-line-2 px-2 py-0.5 text-xs">{value}</span>
              ))}
            </p>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-line-2">
              {loading ? (
                <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground-1" role="status">
                  <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  Loading matching transactions…
                </div>
              ) : error ? (
                <p className="p-4 text-sm text-red-500" role="alert">{error}</p>
              ) : transactions.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground-1">No matching transactions without this tag.</p>
              ) : (
                <table className="min-w-full divide-y divide-table-line">
                  <thead className="sticky top-0 bg-card">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Date</th>
                      <th scope="col" className="px-4 py-2 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Account</th>
                      <th scope="col" className="px-4 py-2 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Name</th>
                      <th scope="col" className="px-4 py-2 text-end text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-table-line">
                    {transactions.map((transaction) => (
                      <tr key={transaction.fitid} className="hover:bg-muted-hover">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-muted-foreground-1">{dateFormatter.format(new Date(transaction.dtposted))}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-muted-foreground-1">{transaction.account_id}</td>
                        <td className="px-4 py-2 text-sm text-foreground">{transaction.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-end text-sm text-foreground">{formatAmount(transaction.trnamt, transaction.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground-1">
                {loading ? '' : `${transactions.length} transaction${transactions.length === 1 ? '' : 's'} matched`}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pending}
                  className="rounded-lg border border-line-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted-hover disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={pending || loading || transactions.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? 'Adding…' : 'Add tag'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
