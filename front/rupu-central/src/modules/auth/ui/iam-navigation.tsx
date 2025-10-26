'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UsersIcon, ShieldCheckIcon, KeyIcon, CubeTransparentIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export function IAMNavigation() {
  const pathname = usePathname();
  
  const navigationItems = [
    {
      name: 'Usuarios',
      href: '/iam/users',
      icon: UsersIcon,
      current: pathname === '/iam/users' || pathname.startsWith('/iam/users')
    },
    {
      name: 'Roles',
      href: '/iam/roles',
      icon: ShieldCheckIcon,
      current: pathname === '/iam/roles' || pathname.startsWith('/iam/roles')
    },
    {
      name: 'Permisos',
      href: '/iam/permissions',
      icon: KeyIcon,
      current: pathname === '/iam/permissions' || pathname.startsWith('/iam/permissions')
    },
    {
      name: 'Recursos',
      href: '/iam/resources',
      icon: CubeTransparentIcon,
      current: pathname === '/iam/resources' || pathname.startsWith('/iam/resources')
    },
    {
      name: 'Tipos de Negocio',
      href: '/iam/business-types',
      icon: BuildingOfficeIcon,
      current: pathname === '/iam/business-types' || pathname.startsWith('/iam/business-types')
    }
  ];

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
