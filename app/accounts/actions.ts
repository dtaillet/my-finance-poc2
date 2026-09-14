'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import {
  deleteAccountsByIds,
  insertAccount,
  updateAccount,
} from '@/lib/data/accounts';

export type AccountFormState = {
  error?: string;
  success?: boolean;
};

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && (error as Error & { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE';
}

export async function createAccount(_prevState: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const accountNumber = (formData.get('accountNumber') as string | null)?.trim() ?? '';

  if (description.length === 0) return { error: 'Description cannot be empty.' };
  if (accountNumber.length === 0) return { error: 'Account number cannot be empty.' };

  try {
    insertAccount({ id: randomUUID(), description, accountNumber });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: 'An account with this account number already exists.' };
    throw error;
  }

  revalidatePath('/accounts');
  return { success: true };
}

export async function editAccount(_prevState: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const id = (formData.get('id') as string | null)?.trim() ?? '';
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const accountNumber = (formData.get('accountNumber') as string | null)?.trim() ?? '';

  if (id.length === 0) return { error: 'Missing account.' };
  if (description.length === 0) return { error: 'Description cannot be empty.' };
  if (accountNumber.length === 0) return { error: 'Account number cannot be empty.' };

  try {
    updateAccount({ id, description, accountNumber });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: 'An account with this account number already exists.' };
    throw error;
  }

  revalidatePath('/accounts');
  return { success: true };
}

export async function deleteAccounts(ids: string[]): Promise<{ deleted: number }> {
  const uniqueIds = Array.from(new Set(ids)).filter((id) => typeof id === 'string' && id.length > 0);
  if (uniqueIds.length === 0) return { deleted: 0 };

  const deleted = deleteAccountsByIds(uniqueIds);
  revalidatePath('/accounts');
  return { deleted };
}