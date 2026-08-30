'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import {
  insertFilter,
  updateFilter,
  deleteFiltersByIds,
  getMatchingTransactions,
  applyTagToTransactions,
  getFilterOptionsForValue,
  addValueToFilter,
  removeValueFromFilter,
  type MatchingTransaction,
  type FilterOptionWithMembership,
} from '@/lib/data/filters';

export type FilterFormState = {
  error?: string;
  success?: boolean;
};

function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase().slice(0, 30);
}

function parseValues(raw: string): string[] {
  const values = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return Array.from(new Set(values));
}

export async function createFilter(_prevState: FilterFormState, formData: FormData): Promise<FilterFormState> {
  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const tag = normalizeTag((formData.get('tag') as string | null) ?? '');
  const values = parseValues((formData.get('values') as string | null) ?? '');

  if (name.length === 0) return { error: 'Name cannot be empty.' };
  if (tag.length === 0) return { error: 'Tag cannot be empty.' };
  if (values.length === 0) return { error: 'Add at least one search value.' };

  insertFilter({ filterId: randomUUID(), name, tag, values });
  revalidatePath('/filters');
  return { success: true };
}

export async function editFilter(_prevState: FilterFormState, formData: FormData): Promise<FilterFormState> {
  const filterId = (formData.get('filterId') as string | null)?.trim() ?? '';
  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const tag = normalizeTag((formData.get('tag') as string | null) ?? '');
  const values = parseValues((formData.get('values') as string | null) ?? '');

  if (filterId.length === 0) return { error: 'Missing filter.' };
  if (name.length === 0) return { error: 'Name cannot be empty.' };
  if (tag.length === 0) return { error: 'Tag cannot be empty.' };
  if (values.length === 0) return { error: 'Add at least one search value.' };

  updateFilter({ filterId, name, tag, values });
  revalidatePath('/filters');
  return { success: true };
}

export async function deleteFilters(ids: string[]): Promise<{ deleted: number }> {
  const uniqueIds = Array.from(new Set(ids)).filter((id) => typeof id === 'string' && id.length > 0);
  if (uniqueIds.length === 0) return { deleted: 0 };

  const deleted = deleteFiltersByIds(uniqueIds);
  revalidatePath('/filters');
  return { deleted };
}

export type FilterMatchesResult =
  | { error: string }
  | { tag: string; transactions: MatchingTransaction[] };

export async function previewFilterMatches(filterId: string): Promise<FilterMatchesResult> {
  if (!filterId) return { error: 'Missing filter.' };
  const result = getMatchingTransactions(filterId);
  if (!result) return { error: 'Filter not found.' };
  return result;
}

export async function applyFilterTag(filterId: string): Promise<{ error?: string; added?: number }> {
  if (!filterId) return { error: 'Missing filter.' };
  const result = getMatchingTransactions(filterId);
  if (!result) return { error: 'Filter not found.' };

  const added = applyTagToTransactions(result.transactions.map((transaction) => transaction.fitid), result.tag);
  revalidatePath('/transactions');
  revalidatePath('/filters');
  return { added };
}

// Applies the filter's tag to its current matching transactions. Returns the number tagged.
function applyFilterTagInternal(filterId: string): number {
  const result = getMatchingTransactions(filterId);
  if (!result) return 0;
  return applyTagToTransactions(result.transactions.map((transaction) => transaction.fitid), result.tag);
}

export async function listFilterOptions(name: string): Promise<FilterOptionWithMembership[]> {
  return getFilterOptionsForValue(name.trim());
}

export async function createFilterForValue(
  filterName: string,
  rawTag: string,
  value: string,
): Promise<{ error?: string; filter?: FilterOptionWithMembership }> {
  const name = filterName.trim();
  const tag = normalizeTag(rawTag);
  const seedValue = value.trim();

  if (name.length === 0) return { error: 'Name cannot be empty.' };
  if (tag.length === 0) return { error: 'Tag cannot be empty.' };
  if (seedValue.length === 0) return { error: 'Transaction name is empty.' };

  const filterId = randomUUID();
  insertFilter({ filterId, name, tag, values: [seedValue] });
  const added = applyFilterTagInternal(filterId);
  revalidatePath('/filters');
  revalidatePath('/transactions');
  return { filter: { filter_id: filterId, name, tag, hasValue: true }, added };
}

export async function addTransactionToFilter(filterId: string, name: string): Promise<{ error?: string; success?: boolean; added?: number }> {
  const value = name.trim();
  if (!filterId) return { error: 'Missing filter.' };
  if (value.length === 0) return { error: 'Transaction name is empty.' };

  const ok = addValueToFilter(filterId, value);
  if (!ok) return { error: 'Filter not found.' };

  const added = applyFilterTagInternal(filterId);
  revalidatePath('/filters');
  revalidatePath('/transactions');
  return { success: true, added };
}

export async function removeTransactionFromFilter(filterId: string, name: string): Promise<{ error?: string; success?: boolean }> {
  const value = name.trim();
  if (!filterId) return { error: 'Missing filter.' };
  if (value.length === 0) return { error: 'Transaction name is empty.' };

  const ok = removeValueFromFilter(filterId, value);
  if (!ok) return { error: 'Filter not found.' };

  revalidatePath('/filters');
  revalidatePath('/transactions');
  return { success: true };
}
