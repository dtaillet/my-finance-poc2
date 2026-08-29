import Pagination from "@/lib/ui/pagination";
import FiltersManager from "@/lib/ui/filters-manager";
import { getFilters, getTotalFiltersPages, type Filter } from "@/lib/data/filters";
import { redirect } from "next/navigation";

export default async function FiltersPage(props: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const totalPages = await getTotalFiltersPages();
  let currentPage = Number(searchParams?.page) || 1;
  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
    redirect(`/filters?page=${currentPage.toString()}`);
  }
  const filters = (await getFilters({ currentPage })) as Filter[];

  return (
    <main className="flex flex-1 flex-col w-full max-w-5xl mx-auto px-6 py-10 gap-6">
      <FiltersManager filters={filters} />

      <div className="flex justify-center sm:justify-end">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}
