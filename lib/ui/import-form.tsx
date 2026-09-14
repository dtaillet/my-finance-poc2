'use client';

import { useActionState, useState } from 'react';
import { createImport, type ImportFormState } from '@/app/imports/actions';
import type { AccountOption } from '@/lib/data/accounts';

const initialState: ImportFormState = {};

export default function ImportForm({ accounts }: { accounts: AccountOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-hidden"
      >
        <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
        Import
      </button>

      {open && <ImportDialog accounts={accounts} onClose={() => setOpen(false)} />}
    </>
  );
}

function ImportDialog({ accounts, onClose }: { accounts: AccountOption[]; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createImport, initialState);
  const [fileType, setFileType] = useState<'ofx' | 'qif'>('ofx');
  const [accountId, setAccountId] = useState('');
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const selectedAccount = accounts.find((account) => account.id === accountId);

  function selectFileType(nextFileType: 'ofx' | 'qif') {
    setFileType(nextFileType);
    if (nextFileType === 'qif') setAccountPickerOpen(true);
  }

  function cancelAccountSelection() {
    setFileType('ofx');
    setAccountId('');
    setAccountPickerOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl border border-line-2 bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="import-dialog-title" className="text-lg font-semibold text-foreground">New import</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-muted-foreground-1 transition-colors hover:text-foreground"
          >
            <svg className="size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        {state.success ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-line-2 bg-muted-hover p-4 text-sm text-foreground" role="status">
              <p className="font-medium">Import completed.</p>
              <p className="mt-1 text-muted-foreground-1">
                {state.imported} transaction{state.imported === 1 ? '' : 's'} imported,{' '}
                {state.ignored} ignored (already existing).
              </p>
            </div>
            <div className="mt-2 flex justify-end">
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
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="fileType" value={fileType} />
            {fileType === 'qif' && <input type="hidden" name="accountId" value={accountId} />}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="file-type" className="text-sm font-medium text-foreground">File type</label>
              <select
                id="file-type"
                value={fileType}
                onChange={(event) => selectFileType(event.target.value as 'ofx' | 'qif')}
                disabled={pending}
                className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
              >
                <option value="ofx">OFX</option>
                <option value="qif">QIF</option>
              </select>
            </div>

            {fileType === 'qif' && (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Bank account</span>
                <button
                  type="button"
                  onClick={() => setAccountPickerOpen(true)}
                  disabled={pending}
                  className="rounded-lg border border-line-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted-hover disabled:opacity-50"
                >
                  {selectedAccount ? `${selectedAccount.description} (${selectedAccount.account_number})` : 'Select bank account'}
                </button>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="file" className="text-sm font-medium text-foreground">File</label>
              <input
                id="file"
                name="file"
                type="file"
                required
                disabled={pending}
                className="block w-full text-sm text-muted-foreground-1 file:mr-3 file:rounded-lg file:border-0 file:bg-muted-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted-focus disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="comment" className="text-sm font-medium text-foreground">Comment</label>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                disabled={pending}
                className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
                placeholder="Optional comment"
              />
            </div>

            {pending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground-1" role="status">
                <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                Processing import, please wait…
              </div>
            )}

            {state.error && (
              <p className="text-sm text-red-500" role="alert">{state.error}</p>
            )}

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
                disabled={pending || (fileType === 'qif' && !accountId)}
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-hidden disabled:opacity-50"
              >
                {pending ? 'Importing…' : 'Validate import'}
              </button>
            </div>
          </form>
        )}
      </div>

      {accountPickerOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qif-account-dialog-title"
        >
          <div className="w-full max-w-md rounded-xl border border-line-2 bg-card p-6 shadow-xl">
            <h3 id="qif-account-dialog-title" className="text-lg font-semibold text-foreground">Select bank account</h3>
            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="qif-account" className="text-sm font-medium text-foreground">Account</label>
              <select
                id="qif-account"
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden dark:bg-black"
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.description} ({account.account_number})</option>
                ))}
              </select>
            </div>
            {accounts.length === 0 && <p className="mt-3 text-sm text-red-500" role="alert">Create a bank account before importing a QIF file.</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={cancelAccountSelection} className="rounded-lg border border-line-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted-hover">Cancel</button>
              <button type="button" onClick={() => setAccountPickerOpen(false)} disabled={!accountId} className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50">Select</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
