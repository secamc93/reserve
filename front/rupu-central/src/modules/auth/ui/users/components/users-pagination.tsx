/**
 * Componente de paginación para usuarios
 * Aplica estilos globales y usa componentes reutilizables
 */

'use client';

import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronDoubleLeftIcon, 
  ChevronDoubleRightIcon 
} from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Select } from '@shared/ui/select';

interface UsersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading?: boolean;
}

export function UsersPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false
}: UsersPaginationProps) {
  // Calcular información de paginación
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);
  const hasItems = totalCount > 0;

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Opciones de tamaño de página
  const pageSizeOptions = [
    { value: '5', label: '5 por página' },
    { value: '10', label: '10 por página' },
    { value: '25', label: '25 por página' },
    { value: '50', label: '50 por página' },
    { value: '100', label: '100 por página' }
  ];

  if (!hasItems) {
    return null;
  }

  return (
    <div className="pagination-alt">
      {/* Información de paginación */}
      <div className="pagination-info">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="spinner w-4 h-4"></div>
            <span>Cargando...</span>
          </div>
        ) : (
          <span>
            Mostrando {startItem} a {endItem} de {totalCount} usuarios
          </span>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Tamaño de página */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar:</span>
          <Select
            value={pageSize.toString()}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            options={pageSizeOptions}
            className="input"
            disabled={loading}
          />
        </div>

        {/* Navegación de páginas */}
        <div className="flex items-center gap-1">
          {/* Primera página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || loading}
            className="p-2 hover:bg-gray-100"
          >
            <ChevronDoubleLeftIcon className="w-4 h-4" />
          </Button>

          {/* Página anterior */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="p-2 hover:bg-gray-100"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>

          {/* Números de página */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {typeof page === 'number' ? (
                  <Button
                    variant={page === currentPage ? "primary" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    className={`p-2 min-w-[2.5rem] ${
                      page === currentPage 
                        ? 'btn-primary' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </Button>
                ) : (
                  <span className="px-2 py-1 text-gray-500">...</span>
                )}
              </div>
            ))}
          </div>

          {/* Página siguiente */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="p-2 hover:bg-gray-100"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>

          {/* Última página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || loading}
            className="p-2 hover:bg-gray-100"
          >
            <ChevronDoubleRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

