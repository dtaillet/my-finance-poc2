import sql from 'better-sqlite3';
import type { OfxTransaction } from '@/lib/data/ofx';

const db = sql('database/transactions.db');
const pageSize = 10;

db.exec(
  `CREATE TABLE IF NOT EXISTS transaction_tags (
    fitid TEXT NOT NULL,
    tag   TEXT NOT NULL,
    PRIMARY KEY (fitid, tag),
    FOREIGN KEY (fitid) REFERENCES transactions(fitid) ON DELETE CASCADE
  )`,
);

// Inserts transactions, ignoring any whose fitid already exists.
// Returns how many were imported and how many were ignored.
export function importTransactions(transactions: OfxTransaction[]) {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO transactions (fitid, account_id, account_type, dtposted, trnamt, name, memo, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );

  const run = db.transaction((rows: OfxTransaction[]) => {
    let imported = 0;
    for (const t of rows) {
      const result = insert.run(t.fitid, t.accountId, t.accountType, t.dtposted, t.trnamt, t.name, t.memo, t.currency);
      if (result.changes > 0) imported += 1;
    }
    return imported;
  });

  const imported = run(transactions);
  return { imported, ignored: transactions.length - imported };
}

export async function getTransactions({ currentPage, accountId }: { currentPage: number; accountId?: string }) {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const offset = (currentPage - 1) * pageSize;
  const rows = accountId
    ? db.prepare('SELECT ROW_NUMBER() OVER (ORDER BY fitid) AS row_num, * FROM transactions WHERE account_id = ? LIMIT ? OFFSET ?').all(accountId, pageSize, offset)
    : db.prepare('SELECT ROW_NUMBER() OVER (ORDER BY fitid) AS row_num, * FROM transactions LIMIT ? OFFSET ?').all(pageSize, offset);

  const tagsByFitid = getTagsForTransactions(rows.map((row) => row.fitid));
  return rows.map((row) => ({ ...row, tags: tagsByFitid.get(row.fitid) ?? [] }));
}

export async function getTotalTransactionsPages({ accountId }: { accountId?: string } = {}) {
  const totalTransactions = accountId
    ? db.prepare('SELECT COUNT(*) AS count FROM transactions WHERE account_id = ?').get(accountId).count
    : db.prepare('SELECT COUNT(*) AS count FROM transactions').get().count;
  return Math.ceil(totalTransactions / pageSize);
}

export async function getAccountIds() {
  return db.prepare('SELECT DISTINCT account_id FROM transactions ORDER BY account_id').all().map((row) => row.account_id);
}

export function getTagsForTransactions(fitids: string[]): Map<string, string[]> {
  const tagsByFitid = new Map<string, string[]>();
  if (fitids.length === 0) return tagsByFitid;
  const placeholders = fitids.map(() => '?').join(', ');
  const rows = db.prepare(`SELECT fitid, tag FROM transaction_tags WHERE fitid IN (${placeholders}) ORDER BY tag`).all(...fitids);
  for (const row of rows) {
    const list = tagsByFitid.get(row.fitid) ?? [];
    list.push(row.tag);
    tagsByFitid.set(row.fitid, list);
  }
  return tagsByFitid;
}

export function addTag(fitid: string, tag: string) {
  db.prepare('INSERT OR IGNORE INTO transaction_tags (fitid, tag) VALUES (?, ?)').run(fitid, tag);
}

export function removeTag(fitid: string, tag: string) {
  db.prepare('DELETE FROM transaction_tags WHERE fitid = ? AND tag = ?').run(fitid, tag);
}

export function getAllTags(): string[] {
  return db.prepare('SELECT DISTINCT tag FROM transaction_tags ORDER BY tag').all().map((row) => row.tag);
}