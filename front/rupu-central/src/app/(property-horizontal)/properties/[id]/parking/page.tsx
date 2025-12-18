'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { PropertyNavigation } from '@/services/modules/horizontal-properties/properties/ui/property-navigation';
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
      <PropertyNavigation businessId={businessId} />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gestión de Parqueaderos</h1>
        <p className="text-gray-600 mb-6">
          Administra las zonas de parqueo, espacios individuales, asignaciones permanentes y reservas temporales.
        </p>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'zones' && <ParkingZonesTable businessId={businessId} />}
          {activeTab === 'slots' && <ParkingSlotsTable businessId={businessId} />}
          {activeTab === 'assignments' && <ParkingAssignmentsTable businessId={businessId} />}
          {activeTab === 'reservations' && <ParkingReservationsTable businessId={businessId} />}
        </div>
      </div>
    </div>
  );
}
