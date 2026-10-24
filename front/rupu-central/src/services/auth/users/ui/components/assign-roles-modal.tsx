/**
 * Modal para asignar roles a usuarios en sus negocios
 */

'use client';

import { useState, useEffect } from 'react';
import { VtDialog, VtNotice, vtBtn, vtInput } from '@shared/ui/ds';
import { assignUserRoleAction } from '../../../users/infrastructure/actions';
import { getRolesAction } from '../../../roles/infrastructure/actions';
import { getBusinessesAction } from '../../../businesses/infrastructure/actions';
import { TokenStorage } from '@shared/config';

interface Business {
  id: number;
  name: string;
  business_type_id: number;
  business_type?: string;
}

interface Role {
  id: number;
  name: string;
  businessTypeId?: number;
}

interface AssignRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    name: string;
    email: string;
    business_role_assignments?: Array<{
      business_id: number;
      business_name?: string;
      role_id: number;
      role_name: string;
    }>;
    businesses?: Array<{
      id: number;
      name: string;
      business_type_id: number;
      business_type_name?: string;
    }>;
  } | null;
  onSuccess?: () => void;
}

export function AssignRolesModal({ isOpen, onClose, user, onSuccess }: AssignRolesModalProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [rolesByBusiness, setRolesByBusiness] = useState<Record<number, Role[]>>({});
  const [selectedRoles, setSelectedRoles] = useState<Record<number, number>>({}); // business_id -> role_id
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setBusinesses([]);
      setRolesByBusiness({});
      setSelectedRoles({});
      setError(null);
    }
  }, [isOpen]);

  // Cargar negocios del usuario
  useEffect(() => {
    if (!isOpen || !user) return;

    const loadBusinesses = async () => {
      try {
        const token = TokenStorage.getBusinessToken();
        if (!token) return;

        let userBusinesses: Business[] = [];

        // Si el usuario tiene businesses con business_type_id, usarlos directamente
        if (user.businesses && user.businesses.length > 0 && user.businesses[0].business_type_id) {
          userBusinesses = user.businesses.map((b: any) => ({
            id: b.id,
            name: b.name,
            business_type_id: b.business_type_id,
            business_type: b.business_type_name || b.business_type,
          }));
        } else {
          // Si no, obtener todos los negocios y filtrar
          const businessesRes = await getBusinessesAction({ token, page: 1, page_size: 200, name: '' } as any);

          if (businessesRes.success && businessesRes.data) {
            // Obtener los IDs de los negocios del usuario
            const userBusinessIds = new Set<number>();

            if (user.business_role_assignments && user.business_role_assignments.length > 0) {
              user.business_role_assignments.forEach(bra => {
                if (bra.business_id) userBusinessIds.add(bra.business_id);
              });
            } else if (user.businesses && user.businesses.length > 0) {
              user.businesses.forEach(b => {
                if (b.id) userBusinessIds.add(b.id);
              });
            }

            // Filtrar solo los negocios del usuario
            userBusinesses = businessesRes.data.businesses.filter((b: any) =>
              userBusinessIds.has(b.id)
            ).map((b: any) => ({
              id: b.id,
              name: b.name,
              business_type_id: b.business_type_id,
              business_type: b.business_type,
            }));
          }
        }

        if (userBusinesses.length > 0) {
          setBusinesses(userBusinesses);

          // Pre-cargar roles para cada negocio
          const rolesMap: Record<number, Role[]> = {};

          // Cargar roles en paralelo para todos los negocios
          const rolePromises = userBusinesses.map(async (business) => {
            setLoadingRoles(prev => ({ ...prev, [business.id]: true }));
            try {
              const rolesRes = await getRolesAction(token, { business_type_id: business.business_type_id, page_size: 200 });
              if (rolesRes.success && rolesRes.data) {
                rolesMap[business.id] = rolesRes.data.roles;
              }
            } catch (err) {
              console.error(`Error cargando roles para negocio ${business.id}:`, err);
              rolesMap[business.id] = [];
            } finally {
              setLoadingRoles(prev => ({ ...prev, [business.id]: false }));
            }
          });

          await Promise.all(rolePromises);
          setRolesByBusiness(rolesMap);

          // Pre-seleccionar roles existentes si hay business_role_assignments
          if (user.business_role_assignments && user.business_role_assignments.length > 0) {
            const initialRoles: Record<number, number> = {};
            user.business_role_assignments.forEach(bra => {
              if (bra.business_id && bra.role_id) {
                initialRoles[bra.business_id] = bra.role_id;
              }
            });
            setSelectedRoles(initialRoles);
          }
        } else {
          setBusinesses([]);
        }
      } catch (err) {
        console.error('Error cargando negocios:', err);
        setError('Error al cargar los negocios del usuario');
      }
    };

    loadBusinesses();
  }, [isOpen, user]);

  // Cargar roles cuando se selecciona un negocio (si no están cargados)
  const handleBusinessFocus = async (businessId: number) => {
    if (rolesByBusiness[businessId] && rolesByBusiness[businessId].length > 0) {
      return; // Ya están cargados
    }

    const business = businesses.find(b => b.id === businessId);
    if (!business) return;

    const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
    if (!token) return;

    setLoadingRoles(prev => ({ ...prev, [businessId]: true }));
    try {
      const rolesRes = await getRolesAction(token, { business_type_id: business.business_type_id, page_size: 200 });
      if (rolesRes.success && rolesRes.data) {
        setRolesByBusiness(prev => ({
          ...prev,
          [businessId]: rolesRes.data!.roles,
        }));
      }
    } catch (err) {
      console.error(`Error cargando roles para negocio ${businessId}:`, err);
    } finally {
      setLoadingRoles(prev => ({ ...prev, [businessId]: false }));
    }
  };

  const handleRoleChange = (businessId: number, roleId: string) => {
    setSelectedRoles(prev => ({
      ...prev,
      [businessId]: Number(roleId),
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
    if (!token) {
      setError('No hay token de autenticación disponible');
      return;
    }

    // Construir assignments solo con los que tienen rol seleccionado
    const assignments = Object.entries(selectedRoles)
      .filter(([_, roleId]) => roleId && Number.isFinite(roleId) && roleId > 0)
      .map(([businessId, roleId]) => ({
        business_id: Number(businessId),
        role_id: Number(roleId),
      }));

    if (assignments.length === 0) {
      setError('Elige un rol para al menos una propiedad');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await assignUserRoleAction({
        token,
        user_id: user.id,
        assignments,
      });

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || 'Error al asignar roles');
      }
    } catch (err) {
      console.error('Error asignando roles:', err);
      setError('Error al asignar roles');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <VtDialog
      open={isOpen}
      onClose={onClose}
      busy={loading}
      eyebrow="Roles"
      title={`Cambiar roles de ${user.name}`}
      subtitle="Un rol por propiedad. Cada propiedad muestra los roles de su tipo."
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="button" className={vtBtn.primary} onClick={handleSubmit} disabled={loading || businesses.length === 0}>
            {loading ? 'Guardando…' : 'Guardar roles'}
          </button>
        </>
      }
    >
      {businesses.length === 0 ? (
        <VtNotice tone="info">No pertenece a ninguna propiedad. Agrégala con "Editar datos" y vuelve aquí para darle un rol.</VtNotice>
      ) : (
        <div className="flex flex-col gap-2.5">
          {businesses.map((business) => {
            const businessRoles = rolesByBusiness[business.id] || [];
            const isLoading = loadingRoles[business.id] || false;
            const selectedRoleId = selectedRoles[business.id]?.toString() || '';
            const selectId = `rol-${business.id}`;
            return (
              <div key={business.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border border-[#e4e2dd] rounded-xl px-3.5 py-3">
                <label htmlFor={selectId} className="text-sm font-semibold">{business.name}</label>
                {isLoading ? (
                  <span className="text-[13px] text-[#8a8580]">Cargando roles…</span>
                ) : businessRoles.length === 0 ? (
                  <span className="text-[13px] text-[#8a8580]">No hay roles para este tipo de propiedad</span>
                ) : (
                  <select
                    id={selectId}
                    className={`${vtInput} md:w-56`}
                    value={selectedRoleId}
                    onChange={(e) => handleRoleChange(business.id, e.target.value)}
                    onFocus={() => handleBusinessFocus(business.id)}
                  >
                    <option value="">Sin rol</option>
                    {businessRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      )}
      {error && <VtNotice>{error}</VtNotice>}
    </VtDialog>
  );
}
