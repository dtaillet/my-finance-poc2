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

    function removeAccount(accountId: string) {
        updateAccounts(selected.filter((current) => current !== accountId));
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {selected.map((accountId) => (
                <span
                    key={accountId}
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
        </div>
    );
}
