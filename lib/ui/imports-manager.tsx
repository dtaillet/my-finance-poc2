'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ImportForm from '@/lib/ui/import-form';
import { deleteImports } from '@/app/imports/actions';

export type ImportRecord = {
  row_num: number;
  import_id: string;
  file_name: string;
  import_date: string;
  comment: string;
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

export default function ImportsManager({ imports }: { imports: ImportRecord[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const allSelected = imports.length > 0 && selected.size === imports.length;

  function toggleAll() {
    setSelected((prev) => (prev.size === imports.length ? new Set() : new Set(imports.map((row) => row.import_id))));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleConfirmDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await deleteImports(ids);
      setWarnings(result.warnings);
      setSelected(new Set());
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Imports</h1>
        <div className="flex items-center gap-2">
          <ImportForm />
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={selected.size === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-line-2 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-muted-hover focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
            Delete
          </button>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-yellow-400/50 bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300" role="alert">
          <div className="flex items-start justify-between gap-3">
            <ul className="list-disc space-y-1 ps-5">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setWarnings([])}
              aria-label="Dismiss warnings"
              className="shrink-0 rounded-lg p-1 transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
            >
              <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-line-2 bg-card overflow-hidden">
        <div className="min-w-full">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
            <table className="min-w-full divide-y divide-table-line">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 text-start">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      disabled={imports.length === 0}
                      aria-label="Select all imports"
                      className="size-4 accent-foreground disabled:opacity-50"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">#</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Import ID</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">File</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Date</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-line">
                {imports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground-1">No imports found.</td>
                  </tr>
                ) : (
                  imports.map((row) => (
                    <tr key={row.import_id} className="hover:bg-muted-hover">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.import_id)}
                          onChange={() => toggleOne(row.import_id)}
                          aria-label={`Select import ${row.import_id}`}
                          className="size-4 accent-foreground"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-1">{row.row_num}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{row.import_id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{row.file_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-1">{dateFormatter.format(new Date(row.import_date))}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground-1">{row.comment}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md rounded-xl border border-line-2 bg-card p-6 shadow-xl">
            <h2 id="delete-dialog-title" className="text-lg font-semibold text-foreground">Confirm deletion</h2>
            <p className="mt-2 text-sm text-muted-foreground-1">
              Are you sure you want to delete {selected.size} import{selected.size === 1 ? '' : 's'}? This removes the
              record{selected.size === 1 ? '' : 's'} and the associated file{selected.size === 1 ? '' : 's'} on disk. This
              action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={pending}
                className="rounded-lg border border-line-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted-hover disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-hidden disabled:opacity-50"
              >
                {pending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
