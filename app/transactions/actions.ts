'use server';

import { revalidatePath } from 'next/cache';
import { addTag, removeComment, removeTag, setComment } from '@/lib/data/transactions';

export type TagActionState = { error?: string };

const MAX_COMMENT_LENGTH = 500;

export async function setTransactionComment(fitid: string, comment: string): Promise<TagActionState> {
  if (!fitid) return { error: 'Missing transaction.' };
  const trimmed = comment.trim().slice(0, MAX_COMMENT_LENGTH);
  if (trimmed.length === 0) {
    removeComment(fitid);
  } else {
    setComment(fitid, trimmed);
  }
  revalidatePath('/transactions');
  return {};
}

export async function removeTransactionComment(fitid: string): Promise<TagActionState> {
  if (!fitid) return { error: 'Missing transaction.' };
  removeComment(fitid);
  revalidatePath('/transactions');
  return {};
}

function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase().slice(0, 30);
}

export async function addTransactionTag(fitid: string, tag: string): Promise<TagActionState> {
  if (!fitid) return { error: 'Missing transaction.' };
  const normalized = normalizeTag(tag);
  if (normalized.length === 0) return { error: 'Tag cannot be empty.' };

  addTag(fitid, normalized);
  revalidatePath('/transactions');
  return {};
}

export async function removeTransactionTag(fitid: string, tag: string): Promise<TagActionState> {
  if (!fitid || !tag) return { error: 'Missing transaction or tag.' };

  removeTag(fitid, tag);
  revalidatePath('/transactions');
  return {};
}
