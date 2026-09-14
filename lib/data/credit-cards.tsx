import sql from 'better-sqlite3';

const db = sql('database/transactions.db');
const pageSize = 10;

db.pragma('foreign_keys = ON');

db.exec(
  `CREATE TABLE IF NOT EXISTS credit_cards (
    id                  TEXT PRIMARY KEY,
    description         TEXT NOT NULL,
    credit_card_number  TEXT NOT NULL UNIQUE,
    account_id          TEXT REFERENCES accounts(id) ON DELETE SET NULL
  )`,
);

export type CreditCard = {
  id: string;
  description: string;
  credit_card_number: string;
  account_id: string | null;
  account_description: string | null;
  account_number: string | null;
  row_num: number;
};

export async function getCreditCards({ currentPage }: { currentPage: number }): Promise<CreditCard[]> {
  const offset = (currentPage - 1) * pageSize;
  return db
    .prepare(
      `SELECT
        ROW_NUMBER() OVER (ORDER BY credit_cards.description, credit_cards.id) AS row_num,
        credit_cards.*,
        accounts.description AS account_description,
        accounts.account_number
      FROM credit_cards
      LEFT JOIN accounts ON accounts.id = credit_cards.account_id
      ORDER BY credit_cards.description, credit_cards.id
      LIMIT ? OFFSET ?`,
    )
    .all(pageSize, offset) as CreditCard[];
}

export async function getTotalCreditCardsPages() {
  const totalCreditCards = db.prepare('SELECT COUNT(*) AS count FROM credit_cards').get() as { count: number };
  return Math.ceil(totalCreditCards.count / pageSize);
}

export function accountExists(id: string) {
  return Boolean(db.prepare('SELECT 1 FROM accounts WHERE id = ?').get(id));
}

export function insertCreditCard({
  id,
  description,
  creditCardNumber,
  accountId,
}: {
  id: string;
  description: string;
  creditCardNumber: string;
  accountId: string | null;
}) {
  db.prepare(
    'INSERT INTO credit_cards (id, description, credit_card_number, account_id) VALUES (?, ?, ?, ?)',
  ).run(id, description, creditCardNumber, accountId);
}

export function updateCreditCard({
  id,
  description,
  creditCardNumber,
  accountId,
}: {
  id: string;
  description: string;
  creditCardNumber: string;
  accountId: string | null;
}) {
  db.prepare(
    'UPDATE credit_cards SET description = ?, credit_card_number = ?, account_id = ? WHERE id = ?',
  ).run(description, creditCardNumber, accountId, id);
}

export function deleteCreditCardsByIds(ids: string[]) {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const result = db.prepare(`DELETE FROM credit_cards WHERE id IN (${placeholders})`).run(...ids);
  return result.changes;
}