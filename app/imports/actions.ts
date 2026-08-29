'use server';

import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { insertImport } from '@/lib/data/imports';

export type ImportFormState = { error?: string; success?: boolean };

export async function createImport(_prevState: ImportFormState, formData: FormData): Promise<ImportFormState> {
  const file = formData.get('file');
  const comment = (formData.get('comment') as string | null)?.trim() ?? '';

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Please select a file to import.' };
  }

  const importId = randomUUID();
  const importsDir = path.join(process.cwd(), 'imports');
  await mkdir(importsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(importsDir, importId), buffer);

  insertImport({ importId, fileName: file.name, comment });

  revalidatePath('/imports');
  return { success: true };
}
