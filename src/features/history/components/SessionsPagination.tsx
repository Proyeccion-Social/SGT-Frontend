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

  return (
    <Pagination>
      <PaginationContent>
        {/* --- Botón Primera Página --- */}
        <PaginationItem>
          <PaginationLink 
            href={isFirstPage ? undefined : getPageUrl(1)} 
            size="icon" 
            aria-label="Ir a la primera página"
            aria-disabled={isFirstPage}
            tabIndex={isFirstPage ? -1 : undefined}
            className={isFirstPage ? "pointer-events-none opacity-50" : ""}
          >
            <ChevronFirstIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
        
        {/* --- Botón Página Anterior --- */}
        <PaginationItem>
          <PaginationLink 
            href={isFirstPage ? undefined : getPageUrl(prevPage)} 
            size="icon" 
            aria-label="Ir a la página anterior"
            aria-disabled={isFirstPage}
            tabIndex={isFirstPage ? -1 : undefined}
            className={isFirstPage ? "pointer-events-none opacity-50" : ""}
          >
            <ChevronLeftIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
        
        {/* --- Dropdown Custom de Página --- */}
        <PaginationItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-4xl border border-input bg-input/30 px-3 text-sm transition-colors outline-none hover:bg-input/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 cursor-pointer">
              Página {currentPage}
              <ChevronDownIcon className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-36 max-h-60 overflow-y-auto">
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
        
        {/* --- Botón Página Siguiente --- */}
        <PaginationItem>
          <PaginationLink 
            href={isLastPage ? undefined : getPageUrl(nextPage)} 
            size="icon" 
            aria-label="Ir a la página siguiente"
            aria-disabled={isLastPage}
            tabIndex={isLastPage ? -1 : undefined}
            className={isLastPage ? "pointer-events-none opacity-50" : ""}
          >
            <ChevronRightIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
        
        {/* --- Botón Última Página --- */}
        <PaginationItem>
          <PaginationLink 
            href={isLastPage ? undefined : getPageUrl(totalPages)} 
            size="icon" 
            aria-label="Ir a la última página"
            aria-disabled={isLastPage}
            tabIndex={isLastPage ? -1 : undefined}
            className={isLastPage ? "pointer-events-none opacity-50" : ""}
          >
            <ChevronLastIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
