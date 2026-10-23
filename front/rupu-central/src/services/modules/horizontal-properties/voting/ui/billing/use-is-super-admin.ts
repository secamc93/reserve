'use client';

import { TokenStorage } from '@shared/config';
import { usePermissions } from '@/services/auth/permissions/ui/hooks/use-permissions';

/** Si el usuario es super admin (con los permisos guardados en la sesión mientras llegan). */
export function useIsSuperAdmin(): boolean {
  const { permissions } = usePermissions();
  return (permissions ?? TokenStorage.getUserPermissions())?.isSuperAdmin ?? false;
}
