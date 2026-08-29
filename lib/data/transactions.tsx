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

// Builds a WHERE clause and bound params shared by list and count queries.
// Tags use AND semantics: a transaction must carry every selected tag.
function buildTransactionFilter({ accountId, tags }: { accountId?: string; tags?: string[] }) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (accountId) {
    conditions.push('account_id = ?');
    params.push(accountId);
  }
  if (tags && tags.length > 0) {
    const placeholders = tags.map(() => '?').join(', ');
    conditions.push(
      `(SELECT COUNT(DISTINCT tag) FROM transaction_tags WHERE fitid = transactions.fitid AND tag IN (${placeholders})) = ?`,
    );
    params.push(...tags, tags.length);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

export async function getTransactions({ currentPage, accountId, tags }: { currentPage: number; accountId?: string; tags?: string[] }) {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const offset = (currentPage - 1) * pageSize;
  const { where, params } = buildTransactionFilter({ accountId, tags });
  const rows = db
    .prepare(`SELECT ROW_NUMBER() OVER (ORDER BY fitid) AS row_num, * FROM transactions ${where} LIMIT ? OFFSET ?`)
    .all(...params, pageSize, offset);

  const tagsByFitid = getTagsForTransactions(rows.map((row) => row.fitid));
  return rows.map((row) => ({ ...row, tags: tagsByFitid.get(row.fitid) ?? [] }));
}

export async function getTotalTransactionsPages({ accountId, tags }: { accountId?: string; tags?: string[] } = {}) {
  const { where, params } = buildTransactionFilter({ accountId, tags });
  const totalTransactions = db.prepare(`SELECT COUNT(*) AS count FROM transactions ${where}`).get(...params).count;
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