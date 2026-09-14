import sql from 'better-sqlite3';

const db = sql('database/transactions.db');
const pageSize = 10;

db.exec(
  `CREATE TABLE IF NOT EXISTS accounts (
    id              TEXT PRIMARY KEY,
    description     TEXT NOT NULL,
    account_number  TEXT NOT NULL UNIQUE
  )`,
);

export type Account = {
  id: string;
  description: string;
  account_number: string;
  row_num: number;
};

export async function getAccounts({ currentPage }: { currentPage: number }): Promise<Account[]> {
  const offset = (currentPage - 1) * pageSize;
  return db
    .prepare('SELECT ROW_NUMBER() OVER (ORDER BY description, id) AS row_num, * FROM accounts ORDER BY description, id LIMIT ? OFFSET ?')
    .all(pageSize, offset) as Account[];
}

export async function getTotalAccountsPages() {
  const totalAccounts = db.prepare('SELECT COUNT(*) AS count FROM accounts').get() as { count: number };
  return Math.ceil(totalAccounts.count / pageSize);
}

export function insertAccount({ id, description, accountNumber }: { id: string; description: string; accountNumber: string }) {
  db.prepare('INSERT INTO accounts (id, description, account_number) VALUES (?, ?, ?)').run(id, description, accountNumber);
}

export function updateAccount({ id, description, accountNumber }: { id: string; description: string; accountNumber: string }) {
  db.prepare('UPDATE accounts SET description = ?, account_number = ? WHERE id = ?').run(description, accountNumber, id);
}

export function deleteAccountsByIds(ids: string[]) {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const result = db.prepare(`DELETE FROM accounts WHERE id IN (${placeholders})`).run(...ids);
  return result.changes;
}