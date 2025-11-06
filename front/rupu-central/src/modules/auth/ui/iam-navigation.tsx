'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UsersIcon, ShieldCheckIcon, KeyIcon, CubeTransparentIcon, BuildingOfficeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@modules/auth/ui/hooks';

export function IAMNavigation() {
  const pathname = usePathname();
  const { hasResource } = usePermissions();
  
  const allNavigationItems = [
    {
      name: 'Usuarios',
      href: '/iam/users',
      icon: UsersIcon,
      resource: 'Usuarios',
      current: pathname === '/iam/users' || pathname.startsWith('/iam/users')
    },
    {
      name: 'Roles',
      href: '/iam/roles',
      icon: ShieldCheckIcon,
      resource: 'Roles',
      current: pathname === '/iam/roles' || pathname.startsWith('/iam/roles')
    },
    {
      name: 'Permisos',
      href: '/iam/permissions',
      icon: KeyIcon,
      resource: 'Permisos',
      current: pathname === '/iam/permissions' || pathname.startsWith('/iam/permissions')
    },
    {
      name: 'Recursos',
      href: '/iam/resources',
      icon: CubeTransparentIcon,
      resource: 'Recursos',
      current: pathname === '/iam/resources' || pathname.startsWith('/iam/resources')
    },
    {
      name: 'Tipos de Negocio',
      href: '/iam/business-types',
      icon: BuildingOfficeIcon,
      resource: 'Tipos de Negocio',
      current: pathname === '/iam/business-types' || pathname.startsWith('/iam/business-types')
    },
    {
      name: 'Negocios',
      href: '/iam/businesses',
      icon: ShoppingBagIcon,
      resource: 'Negocios',
      current: pathname === '/iam/businesses' || pathname.startsWith('/iam/businesses')
    }
  ];

  // Filtrar items según permisos
  const navigationItems = allNavigationItems.filter(item => hasResource(item.resource));

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Identity & Access Management
        </h1>
        
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
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
