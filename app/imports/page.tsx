import Pagination from "@/lib/ui/pagination";
import ImportForm from "@/lib/ui/import-form";
import ImportsTable from "@/lib/ui/imports-table";
import { getTotalImportsPages } from "@/lib/data/imports";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
          <ImportsTable currentPage={currentPage} />
        </Suspense>
      </div>

      <div className="flex justify-center sm:justify-end">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}
