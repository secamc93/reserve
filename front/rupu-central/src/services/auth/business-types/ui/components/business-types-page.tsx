'use client';

import { BusinessTypesTable } from './business-types-table';
import { useBusinessTypes } from '../hooks/use-business-types';
import { Spinner } from '@shared/ui';

export default function BusinessTypesPage() {
  const { businessTypes, loading, error, refetch } = useBusinessTypes();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" color="primary" text="Cargando tipos de negocio..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Tipos de Negocio
          </h1>
          <p className="mt-2 text-gray-600">
            Administra los tipos de negocio disponibles en el sistema.
          </p>
        </div>

        {/* Business Types Table */}
        <BusinessTypesTable 
          businessTypes={businessTypes} 
          loading={loading}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
}
