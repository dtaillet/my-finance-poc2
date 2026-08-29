import Pagination from "@/lib/ui/pagination";
import ImportForm from "@/lib/ui/import-form";
import { getImports, getTotalImportsPages } from "@/lib/data/imports";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Imports({ currentPage }: { currentPage: number }) {
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

export default async function ImportsPage(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const totalPages = await getTotalImportsPages();
  let currentPage = Number(searchParams?.page) || 1;
  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
    redirect(`/imports?page=${currentPage.toString()}`);
  }

  return (
    <main className="flex flex-1 flex-col w-full max-w-5xl mx-auto px-6 py-10 gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Imports
        </h1>
        <ImportForm />
      </div>

      <div className="rounded-xl border border-line-2 bg-card overflow-hidden">
        <Suspense fallback={<p className="p-6 text-sm text-muted-foreground-1">Fetching imports...</p>}>
          <Imports currentPage={currentPage} />
        </Suspense>
      </div>

      <div className="flex justify-center sm:justify-end">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}
