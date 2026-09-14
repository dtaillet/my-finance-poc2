'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import {
  accountExists,
  deleteCreditCardsByIds,
  insertCreditCard,
  updateCreditCard,
} from '@/lib/data/credit-cards';

export type CreditCardFormState = {
  error?: string;
  success?: boolean;
};

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && (error as Error & { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE';
}

function readCreditCard(formData: FormData) {
  return {
    description: (formData.get('description') as string | null)?.trim() ?? '',
    creditCardNumber: (formData.get('creditCardNumber') as string | null)?.trim() ?? '',
    accountId: (formData.get('accountId') as string | null)?.trim() || null,
  };
}

function validateCreditCard({
  description,
  creditCardNumber,
  accountId,
}: ReturnType<typeof readCreditCard>): string | undefined {
  if (description.length === 0) return 'Description cannot be empty.';
  if (creditCardNumber.length === 0) return 'Credit card number cannot be empty.';
  if (accountId && !accountExists(accountId)) return 'The selected account no longer exists.';
}

export async function createCreditCard(
  _prevState: CreditCardFormState,
  formData: FormData,
): Promise<CreditCardFormState> {
  const creditCard = readCreditCard(formData);
  const validationError = validateCreditCard(creditCard);
  if (validationError) return { error: validationError };

  try {
    insertCreditCard({ id: randomUUID(), ...creditCard });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: 'A credit card with this number already exists.' };
    throw error;
  }

  revalidatePath('/credit-cards');
  return { success: true };
}

export async function editCreditCard(
  _prevState: CreditCardFormState,
  formData: FormData,
): Promise<CreditCardFormState> {
  const id = (formData.get('id') as string | null)?.trim() ?? '';
  const creditCard = readCreditCard(formData);

  if (id.length === 0) return { error: 'Missing credit card.' };
  const validationError = validateCreditCard(creditCard);
  if (validationError) return { error: validationError };

  try {
    updateCreditCard({ id, ...creditCard });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: 'A credit card with this number already exists.' };
    throw error;
  }

  revalidatePath('/credit-cards');
  return { success: true };
}

export async function deleteCreditCards(ids: string[]): Promise<{ deleted: number }> {
  const uniqueIds = Array.from(new Set(ids)).filter((id) => typeof id === 'string' && id.length > 0);
  if (uniqueIds.length === 0) return { deleted: 0 };

  const deleted = deleteCreditCardsByIds(uniqueIds);
  revalidatePath('/credit-cards');
  return { deleted };
}