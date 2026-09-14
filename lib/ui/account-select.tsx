'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AccountOption } from '@/lib/data/transactions';

export default function AccountSelect({ accounts, selected }: { accounts: AccountOption[]; selected: string[] }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const availableAccounts = useMemo(
        () => accounts.filter((account) => !selected.includes(account.account_id)),
        [accounts, selected],
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
        if (!accounts.some((account) => account.account_id === accountId) || selected.includes(accountId)) return;
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
            {availableAccounts.map((account) => (
                <option key={account.account_id} value={account.account_id}>{account.label}</option>
            ))}
        </select>
    );
}
