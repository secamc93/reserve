/**
 * Qué puede hacer el rol en Votaciones (crear/editar, marcar asistencia, contraseñas, en vivo).
 * Reacciona cuando llegan los permisos; mientras tanto usa los guardados en la sesión.
 */

'use client';

import { useMemo } from 'react';
import { TokenStorage } from '@shared/config';
import { usePermissions } from '@/services/auth/permissions/ui/hooks/use-permissions';
import { votingCapabilities, type VotingCapabilities } from '@/services/auth/permissions/domain/entities';

export function useVotingCapabilities(): VotingCapabilities {
  const { permissions } = usePermissions();
  return useMemo(() => votingCapabilities(permissions ?? TokenStorage.getUserPermissions()), [permissions]);
}
