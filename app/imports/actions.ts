'use server';

import { randomUUID } from 'crypto';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { insertImport, deleteImportsByIds } from '@/lib/data/imports';
import { isOfx, parseOfx } from '@/lib/data/ofx';
import { importTransactions } from '@/lib/data/transactions';

export type ImportFormState = {
  error?: string;
  success?: boolean;
  imported?: number;
  ignored?: number;
};

export async function createImport(_prevState: ImportFormState, formData: FormData): Promise<ImportFormState> {
  const file = formData.get('file');
  const comment = (formData.get('comment') as string | null)?.trim() ?? '';

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Please select a file to import.' };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const content = buffer.toString('latin1');

  if (!isOfx(content)) {
    return { error: 'The selected file is not a valid OFX (Open Financial Exchange) file.' };
  }

  const transactions = parseOfx(content);
  if (transactions.length === 0) {
    return { error: 'No transactions found in the OFX file.' };
  }

  const importId = randomUUID();
  const importsDir = path.join(process.cwd(), 'imports');
  await mkdir(importsDir, { recursive: true });
  await writeFile(path.join(importsDir, importId), buffer);

  insertImport({ importId, fileName: file.name, comment });
  const { imported, ignored } = importTransactions(transactions);

  revalidatePath('/imports');
  revalidatePath('/transactions');
  return { success: true, imported, ignored };
}

export async function deleteImports(ids: string[]): Promise<{ deleted: number; warnings: string[] }> {
  const warnings: string[] = [];
  const uniqueIds = Array.from(new Set(ids)).filter((id) => typeof id === 'string' && id.length > 0);
  if (uniqueIds.length === 0) {
    return { deleted: 0, warnings };
  }

  const deleted = deleteImportsByIds(uniqueIds);

  const importsDir = path.join(process.cwd(), 'imports');
  for (const id of uniqueIds) {
    const filePath = path.join(importsDir, path.basename(id));
    try {
      await unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        warnings.push(`File not found for import ${id}; nothing to delete on disk.`);
      } else {
        throw err;
      }
    }
  }

  revalidatePath('/imports');
  return { deleted, warnings };
}
