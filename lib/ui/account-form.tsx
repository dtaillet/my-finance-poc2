'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount, editAccount, type AccountFormState } from '@/app/accounts/actions';
import type { Account } from '@/lib/data/accounts';

const initialState: AccountFormState = {};

export default function AccountForm({ account }: { account?: Account }) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(account);

  return (
    <>
      {isEdit ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Edit account ${account?.description}`}
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
          New account
        </button>
      )}

      {open && <AccountDialog account={account} onClose={() => setOpen(false)} />}
    </>
  );
}

function AccountDialog({ account, onClose }: { account?: Account; onClose: () => void }) {
  const router = useRouter();
  const isEdit = Boolean(account);
  const [state, formAction, pending] = useActionState(isEdit ? editAccount : createAccount, initialState);

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
      aria-labelledby="account-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl border border-line-2 bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="account-dialog-title" className="text-lg font-semibold text-foreground">
            {isEdit ? 'Edit account' : 'New account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-muted-foreground-1 transition-colors hover:text-foreground"
          >
            <svg className="size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {isEdit && <input type="hidden" name="id" value={account?.id} />}

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="account-id" className="text-sm font-medium text-foreground">ID</label>
              <input
                id="account-id"
                type="text"
                value={account?.id}
                readOnly
                className="block w-full rounded-lg border border-line-2 bg-muted-hover px-3 py-2 font-mono text-sm text-muted-foreground-1"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-foreground">Description</label>
            <input
              id="description"
              name="description"
              type="text"
              required
              defaultValue={account?.description}
              disabled={pending}
              className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
              placeholder="Everyday checking"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="account-number" className="text-sm font-medium text-foreground">Account number</label>
            <input
              id="account-number"
              name="accountNumber"
              type="text"
              required
              defaultValue={account?.account_number}
              disabled={pending}
              className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
              placeholder="123456789"
            />
          </div>

          {state.error && <p className="text-sm text-red-500" role="alert">{state.error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-line-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted-hover disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-hidden disabled:opacity-50"
            >
              {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}