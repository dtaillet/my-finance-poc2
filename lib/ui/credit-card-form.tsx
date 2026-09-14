'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCreditCard, editCreditCard, type CreditCardFormState } from '@/app/credit-cards/actions';
import type { AccountOption } from '@/lib/data/accounts';
import type { CreditCard } from '@/lib/data/credit-cards';

const initialState: CreditCardFormState = {};

export default function CreditCardForm({
  accounts,
  creditCard,
}: {
  accounts: AccountOption[];
  creditCard?: CreditCard;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(creditCard);

  return (
    <>
      {isEdit ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Edit credit card ${creditCard?.description}`}
          className="inline-flex items-center gap-1 rounded-lg border border-line-2 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted-hover focus:outline-hidden"
        >
          <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
          Edit
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-hidden"
        >
          <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          New credit card
        </button>
      )}

      {open && <CreditCardDialog accounts={accounts} creditCard={creditCard} onClose={() => setOpen(false)} />}
    </>
  );
}

function CreditCardDialog({
  accounts,
  creditCard,
  onClose,
}: {
  accounts: AccountOption[];
  creditCard?: CreditCard;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(creditCard);
  const [state, formAction, pending] = useActionState(isEdit ? editCreditCard : createCreditCard, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onClose();
    }
  }, [state.success, router, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credit-card-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl border border-line-2 bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="credit-card-dialog-title" className="text-lg font-semibold text-foreground">
            {isEdit ? 'Edit credit card' : 'New credit card'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-muted-foreground-1 transition-colors hover:text-foreground">
            <svg className="size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {isEdit && <input type="hidden" name="id" value={creditCard?.id} />}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="credit-card-description" className="text-sm font-medium text-foreground">Description</label>
            <input id="credit-card-description" name="description" type="text" required defaultValue={creditCard?.description} disabled={pending} className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black" placeholder="Everyday credit card" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="credit-card-number" className="text-sm font-medium text-foreground">Credit card number</label>
            <input id="credit-card-number" name="creditCardNumber" type="text" required defaultValue={creditCard?.credit_card_number} disabled={pending} className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black" placeholder="1234 5678 9012 3456" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="credit-card-account" className="text-sm font-medium text-foreground">Account</label>
            <select id="credit-card-account" name="accountId" defaultValue={creditCard?.account_id ?? ''} disabled={pending} className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black">
              <option value="">No account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.description} ({account.account_number})</option>
              ))}
            </select>
          </div>

          {state.error && <p className="text-sm text-red-500" role="alert">{state.error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={pending} className="rounded-lg border border-line-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted-hover disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-hidden disabled:opacity-50">
              {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Create credit card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}