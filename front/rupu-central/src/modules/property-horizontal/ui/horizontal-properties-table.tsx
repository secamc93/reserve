/**
 * Componente: Tabla de Propiedades Horizontales
 */

'use client';

import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, type TableColumn } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getHorizontalPropertiesAction } from '../infrastructure/actions/get-horizontal-properties.action';

interface HorizontalProperty {
  id: number;
  name: string;
  code: string;
  businessTypeName: string;
  address: string;
  totalUnits: number;
  isActive: boolean;
  createdAt: string;
}

export function HorizontalPropertiesTable() {
  const [properties, setProperties] = useState<HorizontalProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadProperties();
  }, [page]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        console.error('❌ No hay token disponible');
        setLoading(false);
        return;
      }

      const result = await getHorizontalPropertiesAction({
        token,
        page,
        pageSize,
      });

      if (result.success && result.data) {
        setProperties(result.data.data);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      } else {
        console.error('❌ Error en la respuesta:', result.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar propiedades:', error);
    }
    setLoading(false);
  };

  const columns: TableColumn<HorizontalProperty>[] = [
    { 
      key: 'id', 
      label: 'ID', 
      width: '80px', 
      align: 'center' 
    },
    { 
      key: 'name', 
      label: 'Nombre', 
      width: '250px' 
    },
    { 
      key: 'code', 
      label: 'Código', 
      width: '150px',
      render: (value) => (
        <span className="font-mono text-sm text-gray-600">{value}</span>
      )
    },
    { 
      key: 'businessTypeName', 
      label: 'Tipo', 
      width: '180px',
      render: (value) => (
        <Badge type="info">{value}</Badge>
      )
    },
    { 
      key: 'address', 
      label: 'Dirección',
      render: (value) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    { 
      key: 'totalUnits', 
      label: 'Unidades', 
      width: '100px',
      align: 'center',
      render: (value) => (
        <span className="font-semibold text-gray-800">{value}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '100px',
      align: 'center',
      render: (value) => (
        <Badge type={value ? 'success' : 'danger'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Fecha Creación',
      width: '140px',
      render: (value) => new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '120px',
      align: 'center',
      render: (_, row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleViewDetails(row)}
            className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            title="Ver detalles"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleEditProperty(row)}
            className="w-8 h-8 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
            title="Editar propiedad"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )
    },
  ];

  const handleViewDetails = (property: HorizontalProperty) => {
    console.log('Ver detalles de:', property);
    // TODO: Implementar modal o navegación a página de detalles
  };

  const handleEditProperty = (property: HorizontalProperty) => {
    console.log('Editar propiedad:', property);
    // TODO: Implementar modal de edición
  };

  const handleCreateProperty = () => {
    console.log('Crear nueva propiedad');
    // TODO: Implementar modal de creación
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="md" text="Cargando propiedades..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Propiedades Horizontales ({total})
        </h3>
        <button 
          onClick={handleCreateProperty}
          className="btn btn-primary btn-sm"
        >
          + Agregar Propiedad
        </button>
      </div>

      <Table
        columns={columns}
        data={properties}
        loading={loading}
        emptyMessage="No hay propiedades disponibles"
        keyExtractor={(row) => row.id}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Página {page} de {totalPages} ({total} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-outline btn-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-outline btn-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

