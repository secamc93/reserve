'use client';

import { useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  ParkingZonesTable, 
  ParkingSlotsTable, 
  ParkingAssignmentsTable, 
  ParkingReservationsTable 
} from '@/services/modules/horizontal-properties/parking/ui';

export default function ParkingPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);
  const [activeTab, setActiveTab] = useState<'zones' | 'slots' | 'assignments' | 'reservations'>('zones');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Cada pestaña es otra tabla: al cambiar, vuelve a la página 1 (conserva page_size y demás params).
  const changeTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (searchParams.get('page') !== null) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  };

  if (isNaN(businessId)) {
    return (
      <div className="p-6">
        <div className="text-red-600">ID de propiedad inválido</div>
      </div>
    );
  }

  const tabs = [
    { id: 'zones' as const, label: 'Zonas de Parqueo' },
    { id: 'slots' as const, label: 'Espacios' },
    { id: 'assignments' as const, label: 'Asignaciones' },
    { id: 'reservations' as const, label: 'Reservas' },
  ];

  return (
    <div>
      {/* Navegación */}

      <div className="p-3 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Gestión de Parqueaderos</h1>
        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
          Administra las zonas de parqueo, espacios individuales, asignaciones permanentes y reservas temporales.
        </p>

        {/* Tabs */}
        {/* Teléfono: selector de sección a ancho completo (las 4 pestañas no caben) */}
        <div className="md:hidden mb-4">
          <label htmlFor="parking-section" className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
            Sección
          </label>
          <select
            id="parking-section"
            value={activeTab}
            onChange={(e) => changeTab(e.target.value as typeof activeTab)}
            className="w-full min-h-[44px] rounded-lg border border-gray-300 bg-white px-3 text-base text-gray-900"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
        </div>
        <div className="hidden md:block border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Secciones de parqueaderos">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido según tab activo */}
        <div className="md:bg-white md:rounded-lg md:shadow md:p-6">
          {activeTab === 'zones' && <ParkingZonesTable businessId={businessId} />}
          {activeTab === 'slots' && <ParkingSlotsTable businessId={businessId} />}
          {activeTab === 'assignments' && <ParkingAssignmentsTable businessId={businessId} />}
          {activeTab === 'reservations' && <ParkingReservationsTable businessId={businessId} />}
        </div>
      </div>
    </div>
  );
}
