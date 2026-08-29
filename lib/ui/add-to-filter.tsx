'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addTransactionToFilter, listFilterOptions } from '@/app/filters/actions';
import type { FilterOption } from '@/lib/data/filters';

export default function AddToFilter({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Add "${name}" to a filter`}
        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-line-2 px-2 py-1 text-xs font-medium text-muted-foreground-1 transition-colors hover:text-foreground focus:outline-hidden"
      >
        <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
        Filters
      </button>

      {open && <AddToFilterDialog name={name} onClose={() => setOpen(false)} />}
    </>
  );
}

function AddToFilterDialog({ name, onClose }: { name: string; onClose: () => void }) {
  const router = useRouter();
  const [options, setOptions] = useState<FilterOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    listFilterOptions().then((result) => {
      if (active) setOptions(result);
    });
    return () => {
      active = false;
    };
  }, []);

  function handleSelect(filter: FilterOption) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await addTransactionToFilter(filter.filter_id, name);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(`Added to "${filter.name}".`);
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-filter-title"
    >
      <div className="w-full max-w-md rounded-xl border border-line-2 bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="add-to-filter-title" className="text-lg font-semibold text-foreground">
            Add to filter
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

        <p className="mb-4 text-sm text-muted-foreground-1">
          Add <span className="font-medium text-foreground">{name}</span> as a search value to an existing filter.
        </p>

        {options === null ? (
          <p className="text-sm text-muted-foreground-1">Loading filters…</p>
        ) : options.length === 0 ? (
          <p className="text-sm text-muted-foreground-1">No filters yet. Create one on the Filters page.</p>
        ) : (
          <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {options.map((filter) => (
              <li key={filter.filter_id}>
                <button
                  type="button"
                  onClick={() => handleSelect(filter)}
                  disabled={pending}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-line-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted-hover disabled:opacity-50"
                >
                  <span className="font-medium">{filter.name}</span>
                  <span className="inline-flex items-center rounded-full border border-line-2 bg-muted-hover px-2 py-0.5 text-xs text-muted-foreground-1">
                    {filter.tag}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="mt-4 text-sm text-red-500" role="alert">{error}</p>}
        {success && <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-500" role="status">{success}</p>}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted-hover"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
