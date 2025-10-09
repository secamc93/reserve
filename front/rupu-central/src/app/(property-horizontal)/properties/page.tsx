/**
 * Página: Gestión de Propiedades Horizontales
 */

'use client';

import { HorizontalPropertiesTable } from '@modules/property-horizontal/ui';

export default function PropertiesPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Propiedades Horizontales
          </h1>
          <p className="text-gray-600 mt-2">
            Administra las propiedades horizontales del sistema
          </p>
        </div>

        {/* Tabla de propiedades */}
        <div className="card">
          <HorizontalPropertiesTable />
        </div>
      </div>
    </div>
  );
}

