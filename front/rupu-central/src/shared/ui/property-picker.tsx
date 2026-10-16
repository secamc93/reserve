/**
 * Selector de propiedad horizontal: una tarjeta por propiedad a la que accede el usuario
 * (super admin: todas). Al elegir una se activa y se abre su resumen.
 */

'use client';

import { useState } from 'react';
import { Spinner } from './spinner';
import { PropertyLogo } from './property-logo';
import type { PropertyOption } from '../utils/properties';
import { selectProperty } from './select-property';

interface PropertyPickerProps {
  properties: PropertyOption[];
  loading?: boolean;
  error?: string | null;
  activeId?: number | null;
}

export function PropertyPicker({ properties, loading, error, activeId }: PropertyPickerProps) {
  const [opening, setOpening] = useState<number | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);

  const open = async (property: PropertyOption) => {
    setOpening(property.id);
    setSelectError(null);
    const res = await selectProperty(property);
    if (!res.success) {
      setSelectError(res.error || 'No se pudo abrir la propiedad');
      setOpening(null);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" text="Cargando propiedades..." /></div>;
  if (error) return <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">{error}</p>;
  if (properties.length === 0) {
    return <p className="text-gray-600 bg-white border border-gray-200 rounded-lg p-6 text-center">No tienes propiedades asignadas.</p>;
  }

  return (
    <div>
      {selectError && <p role="alert" className="mb-3 text-sm text-red-700">{selectError}</p>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Propiedades">
        {properties.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => open(p)}
              disabled={opening !== null}
              className={`w-full flex items-center gap-4 rounded-xl border bg-white p-4 text-left transition hover:border-gray-400 hover:shadow-sm disabled:opacity-60 ${
                activeId === p.id ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'
              }`}
            >
              <PropertyLogo name={p.name} logoUrl={p.logoUrl} size={48} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-gray-900 truncate">{p.name}</span>
                <span className="block text-xs text-gray-500">{activeId === p.id ? 'Propiedad actual' : 'Abrir propiedad'}</span>
              </span>
              {opening === p.id && <Spinner size="sm" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
