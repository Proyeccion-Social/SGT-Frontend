import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

// 1. Definimos las Props basándonos en los datos que devuelve tu backend
interface SessionsPaginationProps {
  currentPage: number;
  totalPages: number;
  currentUrl: string;
}

import { navigate } from 'astro:transitions/client';

export function SessionsPagination({ 
  currentPage: rawCurrentPage, 
  totalPages: rawTotalPages,
  currentUrl
}: SessionsPaginationProps) {
  
  const currentPage = Number(rawCurrentPage);
  const totalPages = Number(rawTotalPages);

  // 2. Calculamos las páginas previas y siguientes evitando que salgan del límite
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // 3. Creamos un arreglo dinámico para las opciones de nuestro Select
  // Ej: Si totalPages es 5, creará [1, 2, 3, 4, 5]
  const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);

  // 4. Función auxiliar que crea el Link conservando otros filtros en la URL (como el estado)
  const getPageUrl = (pageNumber: number) => {
    try {
      // Usamos la URL actual que viene del servidor (o del cliente en subsecuentes renderizados)
      // Garantizado que será igual en SSR y Client Rendering (hidratación)
      const url = new URL(currentUrl, 'http://localhost'); // Segundo parámetro por si es relativa, aunque Astro.url.href es absoluta
      url.searchParams.set("page", pageNumber.toString());
      return `${url.pathname}${url.search}`;
    } catch (e) {
      return `?page=${pageNumber}`;
    }
  };

  // 5. Esta función maneja cuando el usuario selecciona una página directamente del Select
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPage = event.target.value;
    // Utilizamos el router de cliente de Astro en lugar de recargar para no perder estado visual
    navigate(getPageUrl(Number(selectedPage))); 
  };

  // Si no hay páginas (o solo hay 1), no renderizamos la paginación para no estorbar visualmente
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
            // Si ya estamos en la pág 1, lo deshabilitamos visualmente y le quitamos el href
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
        
        {/* --- Nuestro Select Dinámico --- */}
        <PaginationItem>
          <NativeSelect 
            className="w-32" 
            defaultValue={currentPage.toString()} // Carga el select en la página actual
            onChange={handleSelectChange} // Reacciona al cambio
          >
             {/* Iteramos dinamikcamente basado en `totalPages` que llega por props */}
            {pageOptions.map((page) => (
              <NativeSelectOption key={page} value={page.toString()}>
                Página {page}
              </NativeSelectOption>
            ))}
          </NativeSelect>
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
