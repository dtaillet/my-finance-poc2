'use client';

import { useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UNTAGGED_FILTER, UNTAGGED_LABEL } from '@/lib/tags';

export default function TagFilter({ allTags, selected }: { allTags: string[]; selected: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const availableTags = useMemo(
    () => [UNTAGGED_FILTER, ...allTags].filter((tag) => !selected.includes(tag)),
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
    // Only existing tags (or the untagged sentinel) are allowed.
    if ((tag !== UNTAGGED_FILTER && !allTags.includes(tag)) || selected.includes(tag)) {
      setValue('');
      return;
    }
    updateTags([...selected, tag]);
    setValue('');
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground-1">Tags:</span>

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
          const normalized = next.trim().toLowerCase();
          if (normalized === UNTAGGED_FILTER || allTags.includes(normalized)) {
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
          <option key={tag} value={tag}>
            {tag === UNTAGGED_FILTER ? UNTAGGED_LABEL : tag}
          </option>
        ))}
      </datalist>
    </div>
  );
}
