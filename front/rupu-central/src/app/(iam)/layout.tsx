/**
 * Layout para páginas de IAM (Identity & Access Management)
 * Incluye el sidebar de navegación y protección de autenticación
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { Sidebar, Spinner } from '@shared/ui';
import { BusinessSelector } from '@/services/auth/businesses/ui';
import { IAMNavigation } from '@/services/auth/ui';

export default function IamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ userId: string; name: string; email: string; role: string; avatarUrl?: string; is_super_admin?: boolean; scope?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);

  useEffect(() => {
    // Verificar autenticación
    const sessionToken = TokenStorage.getSessionToken();
    const businessToken = TokenStorage.getBusinessToken();
    const userData = TokenStorage.getUser();

    if (!sessionToken || !userData) {
      router.push('/login');
      return;
    }

    // Si el usuario es business y NO es super admin, debe tener business token
    const isSuperAdmin = userData.is_super_admin || false;
    const scope = userData.scope || '';
    const businessesData = TokenStorage.getBusinessesData();
    const isBusinessUser = scope === 'business';

    console.log('🔍 IAM Layout - Validación:', {
      scope,
      isBusinessUser,
      isSuperAdmin,
      hasBusinessToken: !!businessToken,
      businessesCount: businessesData?.length || 0,
    });

    // Si es super admin y no tiene business token, generarlo automáticamente
    if (isSuperAdmin && !businessToken) {
      console.log('🔑 IAM Layout - Generando business token para super admin');
      (async () => {
        try {
          const { generateBusinessTokenAction } = await import('@/services/auth/login/infrastructure/actions');
          const result = await generateBusinessTokenAction({
            business_id: 0,
            session_token: sessionToken,
          });
          if (result.success && result.data) {
            TokenStorage.setBusinessToken(result.data.token);
            TokenStorage.removeUserPermissions(); // Limpiar permisos anteriores
            TokenStorage.setActiveBusiness(0);
            console.log('✅ Business token generado para super admin');
            window.location.reload();
            return;
          }
        } catch (err) {
          console.error('Error generando business token para super admin:', err);
        }
      })();
      return;
    }

    // Usuario business que NO es super admin: requiere business token
    if (isBusinessUser && !isSuperAdmin) {
      // Verificar si tiene negocios asignados
      if (!businessesData || businessesData.length === 0) {
        // No tiene negocios, redirigir al login con mensaje
        console.error('❌ Usuario business sin negocios asignados');
        TokenStorage.clearSession();
        router.push('/login?error=no_business');
        return;
      }

      // Tiene negocios pero no tiene business token: mostrar selector
      if (!businessToken) {
        console.log('✅ IAM Layout - Mostrando selector de negocios');
        setShowBusinessSelector(true);
        setLoading(false);
        return;
      }
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

  const handleBusinessSelected = () => {
    setShowBusinessSelector(false);
    // Recargar la página para asegurar que todos los componentes usen el nuevo token
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" color="primary" text="Cargando..." />
      </div>
    );
  }

  // Si debe mostrar el selector de negocios
  if (showBusinessSelector) {
    const businessesData = TokenStorage.getBusinessesData();
    if (businessesData && businessesData.length > 0) {
      // Mapear los datos básicos al formato esperado por BusinessSelector
      const mappedBusinesses = businessesData.map(b => ({
        id: b.id,
        name: b.name,
        code: b.code,
        business_type_id: 11, // Default
        business_type: {
          id: 11,
          name: 'Propiedad Horizontal',
          code: 'horizontal_property',
          description: '',
          icon: '🏢',
        },
        timezone: 'America/Bogota',
        address: '',
        description: '',
        logo_url: b.logo_url || '',
        primary_color: b.primary_color || '#1f2937',
        secondary_color: b.secondary_color || '#3b82f6',
        tertiary_color: b.tertiary_color || '#10b981',
        quaternary_color: b.quaternary_color || '#fbbf24',
        navbar_image_url: '',
        custom_domain: '',
        is_active: b.is_active || true,
        enable_delivery: false,
        enable_pickup: false,
        enable_reservations: false,
      }));

      return (
        <BusinessSelector
          businesses={mappedBusinesses}
          isOpen={true}
          onClose={handleBusinessSelected}
          showSuperAdminButton={false}
          skipRedirect={true}
        />
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Contenido principal */}
      <main
        className="flex-1 transition-all duration-300 w-full"
        style={{
          marginLeft: sidebarExpanded ? '250px' : '80px'
        }}
        onMouseEnter={() => setSidebarExpanded(false)}
      >
        {/* Navegación IAM horizontal */}
        <IAMNavigation />

        {/* Contenido de las páginas */}
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
