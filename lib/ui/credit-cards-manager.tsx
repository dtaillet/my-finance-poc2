'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCreditCards } from '@/app/credit-cards/actions';
import type { AccountOption } from '@/lib/data/accounts';
import type { CreditCard } from '@/lib/data/credit-cards';
import CreditCardForm from '@/lib/ui/credit-card-form';

export default function CreditCardsManager({
  accounts,
  creditCards,
}: {
  accounts: AccountOption[];
  creditCards: CreditCard[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const allSelected = creditCards.length > 0 && selected.size === creditCards.length;

  function toggleAll() {
    setSelected((previous) => (previous.size === creditCards.length ? new Set() : new Set(creditCards.map((creditCard) => creditCard.id))));
  }

  function toggleOne(id: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirmDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      await deleteCreditCards(ids);
      setSelected(new Set());
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Credit cards</h1>
        <div className="flex items-center gap-2">
          <CreditCardForm accounts={accounts} />
          <button type="button" onClick={() => setConfirmOpen(true)} disabled={selected.size === 0} className="inline-flex items-center gap-2 rounded-lg border border-line-2 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-muted-hover focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50">
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
            Delete
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line-2 bg-card">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
          <table className="min-w-full divide-y divide-table-line">
            <thead>
              <tr>
                <th scope="col" className="px-4 py-3 text-start"><input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={creditCards.length === 0} aria-label="Select all credit cards" className="size-4 accent-foreground disabled:opacity-50" /></th>
                <th scope="col" className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground-1">#</th>
                <th scope="col" className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground-1">Description</th>
                <th scope="col" className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground-1">Credit card number</th>
                <th scope="col" className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground-1">Account</th>
                <th scope="col" className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wide text-muted-foreground-1">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-table-line">
              {creditCards.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground-1">No credit cards found.</td></tr>
              ) : (
                creditCards.map((creditCard) => (
                  <tr key={creditCard.id} className="hover:bg-muted-hover">
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.has(creditCard.id)} onChange={() => toggleOne(creditCard.id)} aria-label={`Select credit card ${creditCard.description}`} className="size-4 accent-foreground" /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-1">{creditCard.row_num}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{creditCard.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-1">{creditCard.credit_card_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-1">{creditCard.account_description ? `${creditCard.account_description} (${creditCard.account_number})` : 'None'}</td>
                    <td className="px-4 py-3 text-end"><CreditCardForm accounts={accounts} creditCard={creditCard} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-credit-cards-dialog-title">
          <div className="w-full max-w-md rounded-xl border border-line-2 bg-card p-6 shadow-xl">
            <h2 id="delete-credit-cards-dialog-title" className="text-lg font-semibold text-foreground">Confirm deletion</h2>
            <p className="mt-2 text-sm text-muted-foreground-1">Are you sure you want to delete {selected.size} credit card{selected.size === 1 ? '' : 's'}? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmOpen(false)} disabled={pending} className="rounded-lg border border-line-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted-hover disabled:opacity-50">Cancel</button>
              <button type="button" onClick={handleConfirmDelete} disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-hidden disabled:opacity-50">{pending ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}