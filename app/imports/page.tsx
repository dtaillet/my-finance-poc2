import Pagination from "@/lib/ui/pagination";
import ImportsManager, { type ImportRecord } from "@/lib/ui/imports-manager";
import { getImports, getTotalImportsPages } from "@/lib/data/imports";
import { redirect } from "next/navigation";

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
  const imports = (await getImports({ currentPage })) as ImportRecord[];

  return (
    <main className="flex flex-1 flex-col w-full max-w-5xl mx-auto px-6 py-10 gap-6">
      <ImportsManager imports={imports} />

      <div className="flex justify-center sm:justify-end">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}
