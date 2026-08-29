'use client';

import { useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function TagFilter({ allTags, selected }: { allTags: string[]; selected: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const availableTags = useMemo(
    () => allTags.filter((tag) => !selected.includes(tag)),
    [allTags, selected],
  );

  function updateTags(tags: string[]) {
    const params = new URLSearchParams(searchParams);
    if (tags.length > 0) {
      params.set('tags', tags.join(','));
    } else {
      params.delete('tags');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();
    // Only existing tags are allowed.
    if (!allTags.includes(tag) || selected.includes(tag)) {
      setValue('');
      return;
    }
    updateTags([...selected, tag]);
    setValue('');
  }

  function removeTag(tag: string) {
    updateTags(selected.filter((current) => current !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground-1">Tags:</span>

      {selected.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-line-2 bg-muted-hover px-2.5 py-0.5 text-xs text-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove tag filter ${tag}`}
            className="rounded-full p-0.5 text-muted-foreground-1 transition-colors hover:text-red-600"
          >
            <svg className="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        type="text"
        value={value}
        list="tag-filter-options"
        placeholder="Add tag filter"
        aria-label="Add tag filter"
        disabled={availableTags.length === 0}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          // Selecting a datalist option fires change with the full value.
          if (allTags.includes(next.trim().toLowerCase())) {
            addTag(next);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            addTag(value);
          }
        }}
        className="w-36 rounded-lg border border-line-2 bg-white px-2.5 py-1 text-sm text-foreground focus:outline-hidden disabled:opacity-50 dark:bg-black"
      />
      <datalist id="tag-filter-options">
        {availableTags.map((tag) => (
          <option key={tag} value={tag} />
        ))}
      </datalist>

      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => updateTags([])}
          className="text-sm text-muted-foreground-1 underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
