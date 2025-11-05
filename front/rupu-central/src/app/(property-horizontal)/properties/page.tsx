/**
 * Página: Gestión de Propiedades Horizontales
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HorizontalPropertiesTable } from '@modules/property-horizontal/ui';
import { TokenStorage } from '@shared/config';
import { Spinner } from '@shared/ui';

export default function PropertiesPage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario es super admin
    const user = TokenStorage.getUser();
    const activeBusiness = TokenStorage.getActiveBusiness();

    // Si no es super admin, redirigir a su propiedad
    if (user && !user.is_super_admin && activeBusiness && activeBusiness !== 0) {
      router.replace(`/properties/${activeBusiness}`);
      return;
    }

    // Si no es super admin y no tiene business activo, redirigir a login
    if (user && !user.is_super_admin && (!activeBusiness || activeBusiness === 0)) {
      router.replace('/login');
      return;
    }
  }, [router]);

  // Verificar si el usuario es super admin antes de mostrar la lista
  const user = TokenStorage.getUser();
  const activeBusiness = TokenStorage.getActiveBusiness();

  // Si no es super admin, mostrar loading mientras redirige
  if (user && !user.is_super_admin) {
    if (activeBusiness && activeBusiness !== 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="xl" text="Redirigiendo..." />
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando..." />
      </div>
    );
  }

  // Solo mostrar la lista si es super admin
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

