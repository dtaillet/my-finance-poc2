import { getImports } from "@/lib/data/imports";

export default async function ImportsTable({ currentPage }: { currentPage: number }) {
  const imports = await getImports({ currentPage });
  const dateFormatter = new Intl.DateTimeFormat("fr-FR");
  return (
    <div className="min-w-full">
      <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
        <table className="min-w-full divide-y divide-table-line">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">#</th>
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Import ID</th>
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">File</th>
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Date</th>
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase tracking-wide">Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-line">
            {imports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground-1">No imports found.</td>
              </tr>
            ) : (
              imports.map((row) => (
                <tr key={row.import_id} className="hover:bg-muted-hover">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-1">{row.row_num}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{row.import_id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{row.file_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-1">{dateFormatter.format(new Date(row.import_date))}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground-1">{row.comment}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
