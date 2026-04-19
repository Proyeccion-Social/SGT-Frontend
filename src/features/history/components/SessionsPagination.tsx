import { navigate } from 'astro:transitions/client';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react'

interface SessionsPaginationProps {
  currentPage: number;
  totalPages: number;
  currentUrl: string;
}

export function SessionsPagination({ 
  currentPage: rawCurrentPage, 
  totalPages: rawTotalPages,
  currentUrl
}: SessionsPaginationProps) {
  
  const currentPage = Number(rawCurrentPage);
  const totalPages = Number(rawTotalPages);

  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);

  const getPageUrl = (pageNumber: number) => {
    try {
      const url = new URL(currentUrl, 'http://localhost');
      url.searchParams.set("page", pageNumber.toString());
      return `${url.pathname}${url.search}`;
    } catch (e) {
      return `?page=${pageNumber}`;
    }
  };

  const handlePageSelect = (value: string) => {
    navigate(getPageUrl(Number(value)));
  };

  if (totalPages <= 1) return null;

  const navBtnBase = "size-8 rounded-lg border border-[#e7dcff] bg-white text-[#9f74ff] hover:bg-[#f3edff] hover:text-[#7c3aed] transition-colors"
  const navBtnDisabled = "pointer-events-none opacity-40"

  return (
    <Pagination className="w-auto justify-end">
      <PaginationContent className="gap-1.5">
        {/* --- Dropdown Custom de Página --- */}
        <PaginationItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e7dcff] bg-white px-4 py-2 text-[12px]! font-bold! text-[#b797ff]! tracking-[-0.02em] transition-colors outline-none hover:bg-[#f3edff] focus-visible:border-[#9f74ff] focus-visible:ring-2 focus-visible:ring-[#9f74ff]/30 cursor-pointer">
              Página {currentPage}
              <ChevronDownIcon className="size-3 text-[#b797ff]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-28 max-h-60 overflow-y-auto">
              <DropdownMenuRadioGroup
                value={currentPage.toString()}
                onValueChange={handlePageSelect}
              >
                {pageOptions.map((page) => (
                  <DropdownMenuRadioItem key={page} value={page.toString()}>
                    Página {page}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  )
}
