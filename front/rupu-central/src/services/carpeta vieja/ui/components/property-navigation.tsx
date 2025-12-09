'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { usePermissions } from '@/services/auth/ui/hooks';

interface PropertyNavigationProps {
  businessId: number;
  propertyName?: string;
  currentSection?: 'dashboard' | 'units' | 'residents' | 'voting-groups' | 'attendance';
  groupId?: number;
}

export function PropertyNavigation({
  businessId,
  propertyName,
  currentSection,
  groupId
}: PropertyNavigationProps) {
  const pathname = usePathname();
  const { hasResource } = usePermissions();

  const allNavigationItems = [
    {
      name: 'Dashboard',
      href: `/properties/${businessId}`,
      icon: '🏠',
      resource: 'Propiedades', // El dashboard es parte de Propiedades
      current: currentSection === 'dashboard' || pathname === `/properties/${businessId}`
    },
    {
      name: 'Unidades',
      href: `/properties/${businessId}/units`,
      icon: '🏢',
      resource: 'Unidades',
      current: currentSection === 'units' || pathname === `/properties/${businessId}/units`
    },
    {
      name: 'Residentes',
      href: `/properties/${businessId}/residents`,
      icon: '👥',
      resource: 'Residentes',
      current: currentSection === 'residents' || pathname === `/properties/${businessId}/residents`
    },
    {
      name: 'Votaciones',
      href: `/properties/${businessId}/voting-groups`,
      icon: '🗳️',
      resource: 'Votaciones',
      current: currentSection === 'voting-groups' || pathname.startsWith(`/properties/${businessId}/voting-groups`)
    }
  ];

  // Add attendance navigation if we're in attendance section
  if (currentSection === 'attendance' && groupId) {
    allNavigationItems.push({
      name: 'Asistencia',
      href: `/properties/${businessId}/voting-groups/${groupId}/attendance`,
      icon: '✅',
      resource: 'Asistencia',
      current: true
    });
  }

  // Filtrar items según permisos
  const navigationItems = allNavigationItems.filter(item => hasResource(item.resource));

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        {propertyName && (
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {propertyName}
          </h1>
        )}

        <nav className="flex space-x-8">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.current
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
