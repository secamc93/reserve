/**
 * Página: elegir propiedad horizontal.
 * Es a donde lleva "Cambiar propiedad" y el login cuando el usuario tiene varias propiedades.
 * - Super admin: ve todas las propiedades y puede crear una nueva ("+ Nueva propiedad").
 * - Demás usuarios: sus propiedades; con una sola, entra directo a ella.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { Spinner, PropertyPicker, useAccessibleProperties, selectProperty } from '@shared/ui';
import { vtBtn } from '@shared/ui/ds';
import { CreatePropertyModal } from '@/services/modules/horizontal-properties/properties/ui/create-property-modal';

export default function PropertiesPage() {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const { properties, loading: loadingProperties, error: propertiesError, reload } = useAccessibleProperties();

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
        {isSuperAdmin && (
          <div className="flex justify-end mb-3">
            <button type="button" className={vtBtn.primary} onClick={() => setCreating(true)}>
              + Nueva propiedad
            </button>
          </div>
        )}
        <div>
          <PropertyPicker properties={properties} loading={loadingProperties} error={propertiesError} activeId={activeId} />
        </div>
        {isSuperAdmin && <CreatePropertyModal isOpen={creating} onClose={() => setCreating(false)} onSuccess={reload} />}

      </div>
    </div>
  );
}
