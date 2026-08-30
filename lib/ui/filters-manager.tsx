'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import FilterForm from '@/lib/ui/filter-form';
import FilterApply from '@/lib/ui/filter-apply';
import { deleteFilters } from '@/app/filters/actions';
import type { Filter } from '@/lib/data/filters';

export default function FiltersManager({ filters }: { filters: Filter[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const allSelected = filters.length > 0 && selected.size === filters.length;

  function toggleAll() {
    setSelected((prev) => (prev.size === filters.length ? new Set() : new Set(filters.map((row) => row.filter_id))));
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
      await deleteFilters(ids);
      setSelected(new Set());
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Filters</h1>
        <div className="flex items-center gap-2">
          <FilterForm />
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
                      disabled={filters.length === 0}
                      aria-label="Select all filters"
                      className="size-4 accent-foreground disabled:opacity-50"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">#</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Name</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Tag</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Search values</th>
                  <th scope="col" className="px-4 py-3 text-end text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-line">
                {filters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground-1">No filters found.</td>
                  </tr>
                ) : (
                  filters.map((row) => (
                    <tr key={row.filter_id} className="hover:bg-muted-hover">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.filter_id)}
                          onChange={() => toggleOne(row.filter_id)}
                          aria-label={`Select filter ${row.name}`}
                          className="size-4 accent-foreground"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-1">{row.row_num}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{row.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center rounded-full border border-line-2 bg-muted-hover px-2 py-0.5 text-xs text-foreground">{row.tag}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground-1">
                        <div className="flex flex-wrap gap-1.5">
                          {row.values.map((value) => (
                            <span key={value} className="inline-flex items-center rounded-full border border-line-2 px-2 py-0.5 text-xs text-muted-foreground-1">{value}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="flex justify-end gap-2">
                          <FilterApply filter={row} />
                          <FilterForm filter={row} />
                        </div>
                      </td>
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
              Are you sure you want to delete {selected.size} filter{selected.size === 1 ? '' : 's'}? This action cannot be undone.
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
