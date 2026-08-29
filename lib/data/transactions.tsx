import sql from 'better-sqlite3';

const db = sql('database/transactions.db');
const pageSize = 10;

export async function getTransactions({ currentPage, accountId }: { currentPage: number; accountId?: string }) {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const offset = (currentPage - 1) * pageSize;
  if (accountId) {
    return db.prepare('SELECT ROW_NUMBER() OVER (ORDER BY fitid) AS row_num, * FROM transactions WHERE account_id = ? LIMIT ? OFFSET ?').all(accountId, pageSize, offset);
  }
  return db.prepare('SELECT ROW_NUMBER() OVER (ORDER BY fitid) AS row_num, * FROM transactions LIMIT ? OFFSET ?').all(pageSize, offset);
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