'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface PropertyNavigationProps {
  hpId: number;
  propertyName?: string;
  currentSection?: 'dashboard' | 'units' | 'residents' | 'voting-groups' | 'attendance';
  groupId?: number;
}

export function PropertyNavigation({ 
  hpId, 
  propertyName, 
  currentSection, 
  groupId 
}: PropertyNavigationProps) {
  const pathname = usePathname();
  
  const navigationItems = [
    {
      name: 'Dashboard',
      href: `/properties/${hpId}`,
      icon: '🏠',
      current: currentSection === 'dashboard' || pathname === `/properties/${hpId}`
    },
    {
      name: 'Unidades',
      href: `/properties/${hpId}/units`,
      icon: '🏢',
      current: currentSection === 'units' || pathname === `/properties/${hpId}/units`
    },
    {
      name: 'Residentes',
      href: `/properties/${hpId}/residents`,
      icon: '👥',
      current: currentSection === 'residents' || pathname === `/properties/${hpId}/residents`
    },
    {
      name: 'Votaciones',
      href: `/properties/${hpId}/voting-groups`,
      icon: '🗳️',
      current: currentSection === 'voting-groups' || pathname.startsWith(`/properties/${hpId}/voting-groups`)
    }
  ];

  // Add attendance navigation if we're in attendance section
  if (currentSection === 'attendance' && groupId) {
    navigationItems.push({
      name: 'Asistencia',
      href: `/properties/${hpId}/voting-groups/${groupId}/attendance`,
      icon: '✅',
      current: true
    });
  }

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
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                item.current
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
