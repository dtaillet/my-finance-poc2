'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function ClearFilters({ hasFilters }: { hasFilters: boolean }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    if (!hasFilters) return null;

    function clearFilters() {
        const params = new URLSearchParams(searchParams);
        params.delete('account_id');
        params.delete('tags');
        params.delete('page');
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    }

    return (
        <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-muted-foreground-1 underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
            Clear filters
        </button>
    );
}
