'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { removeTransactionComment, setTransactionComment } from '@/app/transactions/actions';

const MAX_COMMENT_LENGTH = 500;

export default function TransactionComment({ fitid, comment }: { fitid: string; comment: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(comment ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startEditing() {
    setValue(comment ?? '');
    setError(null);
    setEditing(true);
  }

  function submit() {
    const trimmed = value.trim();
    if (trimmed === (comment ?? '')) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result = await setTransactionComment(fitid, trimmed);
      if (result.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      setError(null);
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeTransactionComment(fitid);
      setValue('');
      setEditing(false);
      setError(null);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <textarea
          value={value}
          autoFocus
          rows={2}
          maxLength={MAX_COMMENT_LENGTH}
          disabled={pending}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              submit();
            } else if (event.key === 'Escape') {
              setEditing(false);
              setValue(comment ?? '');
              setError(null);
            }
          }}
          placeholder="Add a comment"
          aria-label="Transaction comment"
          className="w-48 rounded-lg border border-line-2 bg-white px-2 py-1 text-xs text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
        />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center rounded-lg border border-line-2 px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-muted-hover disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setValue(comment ?? '');
              setError(null);
            }}
            disabled={pending}
            className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs text-muted-foreground-1 transition-colors hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
        {error && <span className="text-xs text-red-500" role="alert">{error}</span>}
      </div>
    );
  }

  if (comment) {
    return (
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          onClick={startEditing}
          disabled={pending}
          title="Edit comment"
          className="max-w-48 truncate text-start text-xs text-foreground transition-colors hover:text-muted-foreground-1 disabled:opacity-50"
        >
          {comment}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          aria-label="Remove comment"
          className="shrink-0 rounded-full p-0.5 text-muted-foreground-1 transition-colors hover:text-red-600 disabled:opacity-50"
        >
          <svg className="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      disabled={pending}
      aria-label="Add comment"
      className="inline-flex items-center gap-1 rounded-lg border border-dashed border-line-2 px-2 py-1 text-xs font-medium text-muted-foreground-1 transition-colors hover:text-foreground disabled:opacity-50"
    >
      <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
      Comment
    </button>
  );
}
