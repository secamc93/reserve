/**
 * Modal para asignar roles a usuarios en sus negocios
 */

'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Select } from '@shared/ui/select';
import { Modal } from '@shared/ui/modal';
import { assignUserRoleAction } from '../../../infrastructure/actions/users/assign-user-role.action';
import { getRolesAction } from '../../../infrastructure/actions/roles/get-roles.action';
import { getBusinessesAction } from '../../../../property-horizontal/infrastructure/actions/businesses/get-businesses.action';
import { TokenStorage } from '../../../infrastructure/storage/token.storage';

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
        const token = TokenStorage.getToken();
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
              const rolesRes = await getRolesAction(token, { business_type_id: business.business_type_id });
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

    const token = TokenStorage.getToken();
    if (!token) return;

    setLoadingRoles(prev => ({ ...prev, [businessId]: true }));
    try {
      const rolesRes = await getRolesAction(token, { business_type_id: business.business_type_id });
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

    const token = TokenStorage.getToken();
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
      setError('Debes seleccionar al menos un rol para un negocio');
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Asignar Roles - ${user.name}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Selecciona un rol para cada negocio asociado al usuario. Los roles se filtran automáticamente según el tipo de negocio.
          </p>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">El usuario no tiene negocios asociados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((business) => {
              const businessRoles = rolesByBusiness[business.id] || [];
              const isLoading = loadingRoles[business.id] || false;
              const selectedRoleId = selectedRoles[business.id]?.toString() || '';

              return (
                <div key={business.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900">{business.name}</h4>
                    <p className="text-xs text-gray-500">
                      Tipo: {business.business_type || `ID: ${business.business_type_id}`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol para este negocio
                    </label>
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="spinner w-4 h-4"></div>
                        <span>Cargando roles...</span>
                      </div>
                    ) : businessRoles.length === 0 ? (
                      <p className="text-sm text-gray-500">No hay roles disponibles para este tipo de negocio</p>
                    ) : (
                      <Select
                        value={selectedRoleId}
                        onChange={(e) => {
                          handleRoleChange(business.id, e.target.value);
                        }}
                        onFocus={() => handleBusinessFocus(business.id)}
                        options={[
                          { value: '', label: 'Selecciona un rol' },
                          ...businessRoles.map(role => ({
                            value: role.id.toString(),
                            label: role.name,
                          })),
                        ]}
                        placeholder="Selecciona un rol"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="btn-outline"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || businesses.length === 0}
            className="btn-primary"
          >
            {loading ? 'Asignando...' : 'Asignar Roles'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

