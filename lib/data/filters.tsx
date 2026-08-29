import sql from 'better-sqlite3';

const db = sql('database/transactions.db');
const pageSize = 10;

db.exec(
  `CREATE TABLE IF NOT EXISTS filters (
    filter_id TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    tag       TEXT NOT NULL
  )`,
);

db.exec(
  `CREATE TABLE IF NOT EXISTS filter_values (
    filter_id TEXT NOT NULL,
    value     TEXT NOT NULL,
    PRIMARY KEY (filter_id, value),
    FOREIGN KEY (filter_id) REFERENCES filters(filter_id) ON DELETE CASCADE
  )`,
);

export type Filter = {
  filter_id: string;
  name: string;
  tag: string;
  values: string[];
};

function getValuesForFilters(filterIds: string[]): Map<string, string[]> {
  const valuesByFilter = new Map<string, string[]>();
  if (filterIds.length === 0) return valuesByFilter;
  const placeholders = filterIds.map(() => '?').join(', ');
  const rows = db
    .prepare(`SELECT filter_id, value FROM filter_values WHERE filter_id IN (${placeholders}) ORDER BY value`)
    .all(...filterIds);
  for (const row of rows) {
    const list = valuesByFilter.get(row.filter_id) ?? [];
    list.push(row.value);
    valuesByFilter.set(row.filter_id, list);
  }
  return valuesByFilter;
}

export async function getFilters({ currentPage }: { currentPage: number }): Promise<Filter[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const offset = (currentPage - 1) * pageSize;
  const rows = db
    .prepare('SELECT ROW_NUMBER() OVER (ORDER BY name) AS row_num, * FROM filters ORDER BY name LIMIT ? OFFSET ?')
    .all(pageSize, offset);
  const valuesByFilter = getValuesForFilters(rows.map((row) => row.filter_id));
  return rows.map((row) => ({ ...row, values: valuesByFilter.get(row.filter_id) ?? [] }));
}

export async function getTotalFiltersPages() {
  const totalFilters = db.prepare('SELECT COUNT(*) AS count FROM filters').get().count;
  return Math.ceil(totalFilters / pageSize);
}

export function insertFilter({ filterId, name, tag, values }: { filterId: string; name: string; tag: string; values: string[] }) {
  const insertFilterRow = db.prepare('INSERT INTO filters (filter_id, name, tag) VALUES (?, ?, ?)');
  const insertValue = db.prepare('INSERT OR IGNORE INTO filter_values (filter_id, value) VALUES (?, ?)');
  const run = db.transaction(() => {
    insertFilterRow.run(filterId, name, tag);
    for (const value of values) {
      insertValue.run(filterId, value);
    }
  });
  run();
}

export function updateFilter({ filterId, name, tag, values }: { filterId: string; name: string; tag: string; values: string[] }) {
  const updateFilterRow = db.prepare('UPDATE filters SET name = ?, tag = ? WHERE filter_id = ?');
  const deleteValues = db.prepare('DELETE FROM filter_values WHERE filter_id = ?');
  const insertValue = db.prepare('INSERT OR IGNORE INTO filter_values (filter_id, value) VALUES (?, ?)');
  const run = db.transaction(() => {
    updateFilterRow.run(name, tag, filterId);
    deleteValues.run(filterId);
    for (const value of values) {
      insertValue.run(filterId, value);
    }
  });
  run();
}

export function deleteFiltersByIds(ids: string[]) {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const result = db.prepare(`DELETE FROM filters WHERE filter_id IN (${placeholders})`).run(...ids);
  return result.changes;
}

export function getFilterById(filterId: string): Filter | null {
  const row = db.prepare('SELECT * FROM filters WHERE filter_id = ?').get(filterId);
  if (!row) return null;
  const values = getValuesForFilters([filterId]).get(filterId) ?? [];
  return { ...row, values };
}

export type FilterOption = {
  filter_id: string;
  name: string;
  tag: string;
};

export function getFilterOptions(): FilterOption[] {
  return db.prepare('SELECT filter_id, name, tag FROM filters ORDER BY name').all() as FilterOption[];
}

// Adds a search value to an existing filter. Returns false if the filter is missing.
export function addValueToFilter(filterId: string, value: string): boolean {
  const exists = db.prepare('SELECT 1 FROM filters WHERE filter_id = ?').get(filterId);
  if (!exists) return false;
  db.prepare('INSERT OR IGNORE INTO filter_values (filter_id, value) VALUES (?, ?)').run(filterId, value);
  return true;
}

export type MatchingTransaction = {
  fitid: string;
  account_id: string;
  dtposted: string;
  trnamt: number;
  name: string;
  currency: string | null;
};

// Escapes LIKE wildcards so search values are matched literally.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

// Returns the filter tag and the transactions whose name contains any search
// value (case-insensitive) and that do not already carry the tag.
export function getMatchingTransactions(filterId: string): { tag: string; transactions: MatchingTransaction[] } | null {
  const filter = getFilterById(filterId);
  if (!filter) return null;
  if (filter.values.length === 0) return { tag: filter.tag, transactions: [] };

  const conditions = filter.values.map(() => `LOWER(name) LIKE '%' || LOWER(?) || '%' ESCAPE '\\'`).join(' OR ');
  const params = filter.values.map((value) => escapeLike(value));
  const transactions = db
    .prepare(
      `SELECT fitid, account_id, dtposted, trnamt, name, currency
       FROM transactions
       WHERE (${conditions})
         AND NOT EXISTS (SELECT 1 FROM transaction_tags WHERE fitid = transactions.fitid AND tag = ?)
       ORDER BY dtposted DESC, fitid`,
    )
    .all(...params, filter.tag) as MatchingTransaction[];
  return { tag: filter.tag, transactions };
}

export function applyTagToTransactions(fitids: string[], tag: string) {
  if (fitids.length === 0) return 0;
  const insert = db.prepare('INSERT OR IGNORE INTO transaction_tags (fitid, tag) VALUES (?, ?)');
  const run = db.transaction(() => {
    let added = 0;
    for (const fitid of fitids) {
      const result = insert.run(fitid, tag);
      if (result.changes > 0) added += 1;
    }
    return added;
  });
  return run();
}

