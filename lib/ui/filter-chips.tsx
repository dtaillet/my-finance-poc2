'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UNTAGGED_FILTER, UNTAGGED_LABEL } from '@/lib/tags';

export default function FilterChips({
    accounts,
    tags,
    searches,
}: {
    accounts: string[];
    tags: string[];
    searches: string[];
}) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    function updateParam(key: string, values: string[]) {
        const params = new URLSearchParams(searchParams);
        if (values.length > 0) {
            params.set(key, values.join(','));
        } else {
            params.delete(key);
        }
        params.delete('page');
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    }

    function removeAccount(accountId: string) {
        updateParam('account_id', accounts.filter((current) => current !== accountId));
    }

    function removeTag(tag: string) {
        updateParam('tags', tags.filter((current) => current !== tag));
    }

    function removeSearch(term: string) {
        updateParam('search', searches.filter((current) => current !== term));
    }

    if (accounts.length === 0 && tags.length === 0 && searches.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {accounts.map((accountId) => (
                <span
                    key={`account-${accountId}`}
                    className="inline-flex items-center gap-1 rounded-full border border-line-2 bg-muted-hover px-2.5 py-0.5 text-xs text-foreground"
                >
                    {accountId}
                    <button
                        type="button"
                        onClick={() => removeAccount(accountId)}
                        aria-label={`Remove account filter ${accountId}`}
                        className="rounded-full p-0.5 text-muted-foreground-1 transition-colors hover:text-red-600"
                    >
                        <svg className="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </span>
            ))}

            {tags.map((tag) => (
                <span
                    key={`tag-${tag}`}
                    className="inline-flex items-center gap-1 rounded-full border border-line-2 bg-muted-hover px-2.5 py-0.5 text-xs text-foreground"
                >
                    {tag === UNTAGGED_FILTER ? UNTAGGED_LABEL : tag}
                    <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove tag filter ${tag === UNTAGGED_FILTER ? UNTAGGED_LABEL : tag}`}
                        className="rounded-full p-0.5 text-muted-foreground-1 transition-colors hover:text-red-600"
                    >
                        <svg className="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </span>
            ))}

            {searches.map((term) => (
                <span
                    key={`search-${term}`}
                    className="inline-flex items-center gap-1 rounded-full border border-line-2 bg-muted-hover px-2.5 py-0.5 text-xs text-foreground"
                >
                    {term}
                    <button
                        type="button"
                        onClick={() => removeSearch(term)}
                        aria-label={`Remove search filter ${term}`}
                        className="rounded-full p-0.5 text-muted-foreground-1 transition-colors hover:text-red-600"
                    >
                        <svg className="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </span>
            ))}
        </div>
    );
}
