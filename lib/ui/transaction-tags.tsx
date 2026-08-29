'use client';

import { useId, useOptimistic, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addTransactionTag, removeTransactionTag } from '@/app/transactions/actions';

// Mirrors server-side normalization so optimistic chips match what is stored.
function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase().slice(0, 30);
}

export default function TransactionTags({ fitid, tags, suggestions }: { fitid: string; tags: string[]; suggestions: string[] }) {
  const router = useRouter();
  const listId = useId();
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [optimisticTags, applyOptimistic] = useOptimistic(
    tags,
    (state: string[], action: { type: 'add' | 'remove'; tag: string }) => {
      if (action.type === 'remove') return state.filter((tag) => tag !== action.tag);
      if (state.includes(action.tag)) return state;
      return [...state, action.tag].sort();
    },
  );

  function submitAdd() {
    const normalized = normalizeTag(value);
    if (normalized.length === 0) {
      setAdding(false);
      setValue('');
      return;
    }
    startTransition(async () => {
      applyOptimistic({ type: 'add', tag: normalized });
      const result = await addTransactionTag(fitid, normalized);
      if (result.error) {
        setError(result.error);
        return;
      }
      setValue('');
      setAdding(false);
      setError(null);
      router.refresh();
    });
  }

  function handleRemove(tag: string) {
    startTransition(async () => {
      applyOptimistic({ type: 'remove', tag });
      await removeTransactionTag(fitid, tag);
      router.refresh();
    });
  }

  const availableSuggestions = suggestions.filter((tag) => !optimisticTags.includes(tag));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {optimisticTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-line-2 bg-muted-hover px-2 py-0.5 text-xs text-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => handleRemove(tag)}
            disabled={pending}
            aria-label={`Remove tag ${tag}`}
            className="rounded-full p-0.5 text-muted-foreground-1 transition-colors hover:text-red-600 disabled:opacity-50"
          >
            <svg className="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </span>
      ))}

      {adding ? (
        <>
          <input
            type="text"
            value={value}
            autoFocus
            maxLength={30}
            list={listId}
            disabled={pending}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitAdd();
              } else if (event.key === 'Escape') {
                setAdding(false);
                setValue('');
                setError(null);
              }
            }}
            onBlur={submitAdd}
            placeholder="new tag"
            aria-label="New tag"
            className="w-24 rounded-full border border-line-2 bg-white px-2 py-0.5 text-xs text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
          />
          <datalist id={listId}>
            {availableSuggestions.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={pending}
          aria-label="Add tag"
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-2 px-2 py-0.5 text-xs text-muted-foreground-1 transition-colors hover:text-foreground disabled:opacity-50"
        >
          <svg className="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          Tag
        </button>
      )}

      {error && <span className="text-xs text-red-500" role="alert">{error}</span>}
    </div>
  );
}

