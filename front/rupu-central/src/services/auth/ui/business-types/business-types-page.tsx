/**
 * Página: Business Types Management
 */

'use client';

import { useState, useEffect } from 'react';
import { BusinessTypesTable } from './business-types-table';
import { useBusinessTypes } from '../hooks/use-business-types';

export default function BusinessTypesPage() {
  const { businessTypes, loading, error, refetch } = useBusinessTypes();

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg font-medium mb-2">
              Error cargando tipos de negocio
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={refetch}
              className="btn btn-primary"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BusinessTypesTable
        businessTypes={businessTypes}
        loading={loading}
        onRefresh={refetch}
      />
    </div>
  );
}
