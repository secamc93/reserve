/**
 * Página: elegir propiedad horizontal.
 * Es a donde lleva "Cambiar propiedad" y el login cuando el usuario tiene varias propiedades.
 * - Super admin: ve todas las propiedades.
 * - Demás usuarios: sus propiedades; con una sola, entra directo a ella.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { Spinner, PropertyPicker, useAccessibleProperties, selectProperty } from '@shared/ui';

export default function PropertiesPage() {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const { properties, loading: loadingProperties, error: propertiesError } = useAccessibleProperties();

  useEffect(() => {
    const user = TokenStorage.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setIsSuperAdmin(Boolean(user.is_super_admin));
    setActiveId(TokenStorage.getActiveBusiness());
  }, [router]);

  // Con una sola propiedad (también el super admin) no hay nada que elegir: se entra directo.
  useEffect(() => {
    if (isSuperAdmin !== null && !loadingProperties && properties.length === 1) {
      selectProperty(properties[0]);
    }
  }, [isSuperAdmin, loadingProperties, properties]);

  if (isSuperAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando..." />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div>
          <PropertyPicker properties={properties} loading={loadingProperties} error={propertiesError} activeId={activeId} />
        </div>

      </div>
    </div>
  );
}
