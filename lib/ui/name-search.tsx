'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function NameSearch({ selected }: { selected: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState('');

  function addSearch(raw: string) {
    const term = raw.trim();
    if (term === '' || selected.includes(term)) {
      setValue('');
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set('search', [...selected, term].join(','));
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
    setValue('');
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground-1">Search:</span>

      <input
        type="text"
        value={value}
        placeholder="Search name"
        aria-label="Search transactions by name"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            addSearch(value);
          }
        }}
        className="w-36 rounded-lg border border-line-2 bg-white px-2.5 py-1 text-sm text-foreground focus:outline-hidden dark:bg-black"
      />
    </div>
  );
}
