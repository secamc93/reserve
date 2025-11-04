/**
 * Modal: Configuración de Recursos de un Business
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Badge, Spinner, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { 
  getBusinessConfiguredResourcesAction,
  activateResourceAction,
  deactivateResourceAction,
} from '../../infrastructure/actions/businesses';

interface ConfiguredResource {
  resource_id: number;
  resource_name: string;
  is_active: boolean;
}

interface BusinessConfiguredResources {
  id: number;
  name: string;
  code: string;
  resources: ConfiguredResource[];
  created_at: string;
  updated_at: string;
}

interface BusinessConfiguredResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  businessName: string;
}

export function BusinessConfiguredResourcesModal({
  isOpen,
  onClose,
  businessId,
  businessName,
}: BusinessConfiguredResourcesModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configuredResources, setConfiguredResources] = useState<BusinessConfiguredResources | null>(null);
  const [updatingResourceId, setUpdatingResourceId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && businessId) {
      loadConfiguredResources();
    } else {
      // Reset al cerrar
      setConfiguredResources(null);
      setError(null);
      setLoading(true);
    }
  }, [isOpen, businessId]);

  const loadConfiguredResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        setLoading(false);
        return;
      }

      const result = await getBusinessConfiguredResourcesAction({
        token,
        businessId,
      });

      if (result.success && result.data) {
        setConfiguredResources(result.data);
      } else {
        setError(result.error || 'Error al cargar recursos configurados');
      }
    } catch (err) {
      console.error('❌ Error al cargar recursos configurados:', err);
      setError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResource = async (resource: ConfiguredResource) => {
    setUpdatingResourceId(resource.resource_id);
    setError(null);
    
    // Actualizar el estado local de forma optimista
    if (configuredResources) {
      setConfiguredResources({
        ...configuredResources,
        resources: configuredResources.resources.map(r =>
          r.resource_id === resource.resource_id
            ? { ...r, is_active: !r.is_active }
            : r
        ),
      });
    }
    
    try {
      const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        // Revertir el cambio si falla
        if (configuredResources) {
          setConfiguredResources({
            ...configuredResources,
            resources: configuredResources.resources.map(r =>
              r.resource_id === resource.resource_id
                ? { ...r, is_active: resource.is_active }
                : r
            ),
          });
        }
        setUpdatingResourceId(null);
        return;
      }

      const result = resource.is_active
        ? await deactivateResourceAction({ token, resourceId: resource.resource_id, businessId })
        : await activateResourceAction({ token, resourceId: resource.resource_id, businessId });

      if (!result.success) {
        // Revertir el cambio si falla
        if (configuredResources) {
          setConfiguredResources({
            ...configuredResources,
            resources: configuredResources.resources.map(r =>
              r.resource_id === resource.resource_id
                ? { ...r, is_active: resource.is_active }
                : r
            ),
          });
        }
        setError(result.error || 'Error al actualizar el recurso');
      }
    } catch (err) {
      console.error('❌ Error al actualizar recurso:', err);
      // Revertir el cambio si falla
      if (configuredResources) {
        setConfiguredResources({
          ...configuredResources,
          resources: configuredResources.resources.map(r =>
            r.resource_id === resource.resource_id
              ? { ...r, is_active: resource.is_active }
              : r
            ),
        });
      }
      setError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setUpdatingResourceId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
      glass={true}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Configuración de Recursos
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {businessName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="xl" text="Cargando recursos..." />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <Alert type="error">
            {error}
          </Alert>
        )}

        {/* Resources List */}
        {!loading && !error && configuredResources && (
          <div className="space-y-4">
            {configuredResources.resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay recursos configurados para este negocio.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {configuredResources.resources.map((resource) => (
                  <div
                    key={resource.resource_id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {resource.resource_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        ID: {resource.resource_id}
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleToggleResource(resource)}
                        disabled={updatingResourceId === resource.resource_id}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg relative overflow-hidden ${
                          resource.is_active
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        } transition-[background-color,color,transform,box-shadow] duration-500 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95`}
                        title={resource.is_active ? 'Click para desactivar' : 'Click para activar'}
                      >
                        <span className="relative z-10 transition-opacity duration-300">
                          {updatingResourceId === resource.resource_id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Actualizando...</span>
                            </div>
                          ) : resource.is_active ? (
                            'Activo'
                          ) : (
                            'Inactivo'
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary btn-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

