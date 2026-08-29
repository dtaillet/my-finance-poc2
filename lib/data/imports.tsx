import sql from 'better-sqlite3';

const db = sql('database/transactions.db');
const pageSize = 10;

export async function getImports({ currentPage }: { currentPage: number }) {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const offset = (currentPage - 1) * pageSize;
  return db.prepare('SELECT ROW_NUMBER() OVER (ORDER BY import_date DESC, import_id) AS row_num, * FROM imports ORDER BY import_date DESC, import_id LIMIT ? OFFSET ?').all(pageSize, offset);
}

export async function getTotalImportsPages() {
  const totalImports = db.prepare('SELECT COUNT(*) AS count FROM imports').get().count;
  return Math.ceil(totalImports / pageSize);
}

export function insertImport({ importId, fileName, comment }: { importId: string; fileName: string; comment: string }) {
  const importDate = new Date().toISOString().slice(0, 10);
  db.prepare('INSERT INTO imports (import_id, file_name, import_date, comment) VALUES (?, ?, ?, ?)').run(importId, fileName, importDate, comment);
}
