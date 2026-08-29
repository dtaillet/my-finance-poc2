'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFilter, editFilter, type FilterFormState } from '@/app/filters/actions';
import type { Filter } from '@/lib/data/filters';

const initialState: FilterFormState = {};

export default function FilterForm({ filter }: { filter?: Filter }) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(filter);

  return (
    <>
      {isEdit ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Edit filter ${filter?.name}`}
          className="inline-flex items-center gap-1 rounded-lg border border-line-2 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted-hover focus:outline-hidden"
        >
          <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
          Edit
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-hidden"
        >
          <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          New filter
        </button>
      )}

      {open && <FilterDialog filter={filter} onClose={() => setOpen(false)} />}
    </>
  );
}

function FilterDialog({ filter, onClose }: { filter?: Filter; onClose: () => void }) {
  const router = useRouter();
  const isEdit = Boolean(filter);
  const [state, formAction, pending] = useActionState(isEdit ? editFilter : createFilter, initialState);

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
      aria-labelledby="filter-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl border border-line-2 bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="filter-dialog-title" className="text-lg font-semibold text-foreground">
            {isEdit ? 'Edit filter' : 'New filter'}
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

        <form action={formAction} className="flex flex-col gap-4">
          {isEdit && <input type="hidden" name="filterId" value={filter?.filter_id} />}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={filter?.name}
              disabled={pending}
              className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
              placeholder="Filter name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tag" className="text-sm font-medium text-foreground">Tag</label>
            <input
              id="tag"
              name="tag"
              type="text"
              required
              maxLength={30}
              defaultValue={filter?.tag}
              disabled={pending}
              className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
              placeholder="tag to apply"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="values" className="text-sm font-medium text-foreground">Search values</label>
            <textarea
              id="values"
              name="values"
              rows={4}
              required
              defaultValue={filter?.values.join('\n')}
              disabled={pending}
              className="block w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
              placeholder="One search value per line"
            />
            <p className="text-xs text-muted-foreground-1">One value per line. A transaction matches if it contains any of these.</p>
          </div>

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
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-hidden disabled:opacity-50"
            >
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create filter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
