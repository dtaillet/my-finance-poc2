'use client';
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AccountSelect({ accountIds, selected }: { accountIds: string[]; selected?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams);
        if (event.target.value) {
            params.set('account_id', event.target.value);
        } else {
            params.delete('account_id');
        }
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <select
            value={selected ?? ''}
            onChange={onChange}
            aria-label="Filter by account"
            className="py-2 px-3 text-sm rounded-lg border border-line-2 bg-white text-foreground dark:bg-black focus:outline-hidden"
        >
            <option value="">All accounts</option>
            {accountIds.map((accountId) => (
                <option key={accountId} value={accountId}>{accountId}</option>
            ))}
        </select>
    );
}
