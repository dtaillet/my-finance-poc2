import { createHash } from 'crypto';
import type { OfxTransaction } from '@/lib/data/ofx';

// QIF transaction records use one-letter fields and end with a caret on its own line.
export function isQif(content: string): boolean {
  return content.trimStart().toUpperCase().startsWith('!TYPE:');
}

function toIsoDate(value: string): string | null {
  const normalized = value.trim().replace(/'/g, '/');
  const match = normalized.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2}|\d{4})$/);
  if (!match) return null;

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  const day = first;
  const month = second;
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }

  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function createFitid({ accountId, dtposted, trnamt, name }: Pick<OfxTransaction, 'accountId' | 'dtposted' | 'trnamt' | 'name'>): string {
  return createHash('sha256')
    .update(`${accountId}\u0000${dtposted}\u0000${trnamt}\u0000${name.trim()}`)
    .digest('hex');
}

// Normalizes bank/cash QIF records. QIF has no FITID, so one is derived from stable transaction fields.
export function parseQif(content: string, accountId: string): OfxTransaction[] {
  const transactions: OfxTransaction[] = [];
  let current: Record<string, string> = {};

  function addCurrentTransaction() {
    const dtposted = current.D ? toIsoDate(current.D) : null;
    const trnamt = current.T ? Number(current.T.replace(',', '.')) : NaN;
    if (dtposted && Number.isFinite(trnamt)) {
      const name = current.P ?? '';
      transactions.push({
        fitid: createFitid({ accountId, dtposted, trnamt, name }),
        accountId,
        accountType: 'BANK',
        dtposted,
        trnamt,
        name,
        memo: current.M ?? '',
        currency: '',
      });
    }
    current = {};
  }

  for (const raw of content.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = raw.trim();
    if (line === '^') {
      addCurrentTransaction();
    } else if (/^[DTPML]/.test(line)) {
      const field = line[0];
      current[field] = current[field] ? `${current[field]}\n${line.slice(1)}` : line.slice(1).trim();
    }
  }

  return transactions;
}