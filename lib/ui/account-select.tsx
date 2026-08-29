'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function AccountSelect({ accountIds, selected }: { accountIds: string[]; selected: string[] }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const availableAccounts = useMemo(
        () => accountIds.filter((accountId) => !selected.includes(accountId)),
        [accountIds, selected],
    );

    function updateAccounts(accounts: string[]) {
        const params = new URLSearchParams(searchParams);
        if (accounts.length > 0) {
            params.set('account_id', accounts.join(','));
        } else {
            params.delete('account_id');
        }
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    }

    function addAccount(accountId: string) {
        if (!accountIds.includes(accountId) || selected.includes(accountId)) return;
        updateAccounts([...selected, accountId]);
    }

    return (
        <select
            value=""
            onChange={(event) => {
                if (event.target.value) addAccount(event.target.value);
            }}
            aria-label="Filter by account"
            disabled={availableAccounts.length === 0}
            className="py-2 px-3 text-sm rounded-lg border border-line-2 bg-white text-foreground dark:bg-black focus:outline-hidden disabled:opacity-50"
        >
            <option value="">{selected.length > 0 ? 'Add account' : 'All accounts'}</option>
            {availableAccounts.map((accountId) => (
                <option key={accountId} value={accountId}>{accountId}</option>
            ))}
        </select>
    );
}
