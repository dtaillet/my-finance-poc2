'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addTransactionToFilter, createFilterForValue, listFilterOptions, removeTransactionFromFilter } from '@/app/filters/actions';
import type { FilterOptionWithMembership } from '@/lib/data/filters';

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
  const [options, setOptions] = useState<FilterOptionWithMembership[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    let active = true;
    listFilterOptions(name).then((result) => {
      if (active) setOptions(result);
    });
    return () => {
      active = false;
    };
  }, [name]);

  function handleToggle(filter: FilterOptionWithMembership) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = filter.hasValue
        ? await removeTransactionFromFilter(filter.filter_id, name)
        : await addTransactionToFilter(filter.filter_id, name);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOptions((current) =>
        current?.map((option) =>
          option.filter_id === filter.filter_id ? { ...option, hasValue: !filter.hasValue } : option,
        ) ?? current,
      );
      if (filter.hasValue) {
        setSuccess(`Removed from "${filter.name}".`);
      } else {
        const added = result.added ?? 0;
        setSuccess(
          added > 0
            ? `Added to "${filter.name}" and tagged ${added} transaction${added === 1 ? '' : 's'}.`
            : `Added to "${filter.name}".`,
        );
      }
      router.refresh();
    });
  }

  function handleCreate() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await createFilterForValue(newName, newTag, name);
      if (result.error || !result.filter) {
        setError(result.error ?? 'Could not create filter.');
        return;
      }
      const created = result.filter;
      setOptions((current) => [...(current ?? []), created].sort((a, b) => a.name.localeCompare(b.name)));
      const added = result.added ?? 0;
      setSuccess(
        added > 0
          ? `Created "${created.name}" and tagged ${added} transaction${added === 1 ? '' : 's'}.`
          : `Created "${created.name}" and added "${name}".`,
      );
      setNewName('');
      setNewTag('');
      setCreating(false);
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
          Add or remove <span className="font-medium text-foreground">{name}</span> as a search value on your filters.
        </p>

        {options === null ? (
          <p className="text-sm text-muted-foreground-1">Loading filters…</p>
        ) : options.length === 0 ? (
          <p className="text-sm text-muted-foreground-1">No filters yet. Create one below.</p>
        ) : (
          <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {options.map((filter) => (
              <li key={filter.filter_id} className="flex items-center justify-between gap-2 rounded-lg border border-line-2 px-3 py-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{filter.name}</span>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-line-2 bg-muted-hover px-2 py-0.5 text-xs text-muted-foreground-1">
                    {filter.tag}
                  </span>
                </span>
                {filter.hasValue ? (
                  <button
                    type="button"
                    onClick={() => handleToggle(filter)}
                    disabled={pending}
                    aria-label={`Remove "${name}" from ${filter.name}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-line-2 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-muted-hover disabled:opacity-50 dark:text-red-500"
                  >
                    <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggle(filter)}
                    disabled={pending}
                    aria-label={`Add "${name}" to ${filter.name}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-line-2 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted-hover disabled:opacity-50"
                  >
                    <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    Add
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 border-t border-line-2 pt-4">
          {creating ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-filter-name" className="text-sm font-medium text-foreground">Filter name</label>
                <input
                  id="new-filter-name"
                  type="text"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  disabled={pending}
                  className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
                  placeholder="Filter name"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-filter-tag" className="text-sm font-medium text-foreground">Tag</label>
                <input
                  id="new-filter-tag"
                  type="text"
                  maxLength={30}
                  value={newTag}
                  onChange={(event) => setNewTag(event.target.value)}
                  disabled={pending}
                  className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
                  placeholder="tag to apply"
                />
              </div>
              <p className="text-xs text-muted-foreground-1">
                The new filter starts with <span className="font-medium text-foreground">{name}</span> as its search value.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewName('');
                    setNewTag('');
                  }}
                  disabled={pending}
                  className="rounded-lg border border-line-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted-hover disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={pending}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-hidden disabled:opacity-50"
                >
                  {pending ? 'Creating…' : 'Create filter'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccess(null);
                setCreating(true);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-line-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted-hover focus:outline-hidden"
            >
              <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
              New filter
            </button>
          )}
        </div>

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
