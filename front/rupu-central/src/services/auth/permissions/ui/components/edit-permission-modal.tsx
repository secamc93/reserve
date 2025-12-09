'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import { Modal, Input, Alert, Button, Select } from '@shared/ui';
import { updatePermissionAction, getPermissionByIdAction } from '../../infrastructure/actions';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useBusinessTypes } from '../../../business-types/ui/hooks';
import { useActions } from '../../../actions/ui/hooks';
import { useResources } from '../../../resources/ui/hooks';

interface EditPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  permission: {
    id: number;
    name: string;
    description: string;
    resource: string;
    resourceId: number;
    action: string;
    actionId: number;
    scopeId: number;
    businessTypeId?: number;
    businessTypeName?: string;
  } | null;
}

export function EditPermissionModal({
  isOpen,
  onClose,
  onSuccess,
  token,
  permission,
}: EditPermissionModalProps) {
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    resource_id: '',
    action_id: '',
    scope_id: '1',
    business_type_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { businessTypes } = useBusinessTypes();
  const businessTypeList = businessTypes ?? [];
  const businessTypeNumber = useMemo(
    () => (formState.business_type_id ? parseInt(formState.business_type_id, 10) : undefined),
    [formState.business_type_id]
  );
  const { resources, loading: resourcesLoading } = useResources(businessTypeNumber);
  const { actions, loading: actionsLoading } = useActions();

  useEffect(() => {
    const fetchPermissionDetails = async () => {
      if (!permission || !isOpen) {
        return;
      }

      setInitializing(true);
      setError(null);

      try {
        const details = await getPermissionByIdAction({
          id: permission.id,
          token,
        });

        setFormState({
          name: details.name || '',
          description: details.description || '',
          resource_id: details.resource_id ? details.resource_id.toString() : '',
          action_id: details.action_id ? details.action_id.toString() : '',
          scope_id: details.scope_id ? details.scope_id.toString() : '1',
          business_type_id: details.business_type_id ? details.business_type_id.toString() : '',
        });
      } catch (err) {
        console.error('Error cargando permiso por ID:', err);
        setError(
          err instanceof Error ? err.message : 'Error inesperado al cargar el permiso'
        );
      } finally {
        setInitializing(false);
      }
    };

    fetchPermissionDetails();
  }, [permission, isOpen, token]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'business_type_id') {
        updated.resource_id = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!permission) return;

    if (!formState.resource_id || !formState.action_id) {
      setError('Debe seleccionar un recurso y una acción.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updatePermissionAction({
        id: permission.id,
        token,
        name: formState.name.trim(),
        description: formState.description.trim(),
        resource_id: parseInt(formState.resource_id, 10),
        action_id: parseInt(formState.action_id, 10),
        scope_id: parseInt(formState.scope_id, 10),
        business_type_id: formState.business_type_id
          ? parseInt(formState.business_type_id, 10)
          : undefined,
      });

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message || 'No se pudo actualizar el permiso');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error desconocido al actualizar el permiso'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !initializing) {
      setError(null);
      onClose();
    }
  };

  const scopeOptions = [
    { value: '1', label: 'Plataforma' },
    { value: '2', label: 'Negocio' },
  ];

  const businessTypeOptions = [
    { value: '', label: 'Seleccionar tipo de negocio' },
    ...(businessTypeList.map((bt) => ({
      value: bt.id.toString(),
      label: `${bt.icon} ${bt.name}`,
    })) || []),
  ];

  const resourceOptions = [
    { value: '', label: resourcesLoading ? 'Cargando recursos...' : 'Seleccionar recurso' },
    ...(resources?.map((r) => ({
      value: r.id.toString(),
      label: r.name,
    })) || []),
  ];

  const actionOptions = [
    { value: '', label: actionsLoading ? 'Cargando acciones...' : 'Seleccionar acción' },
    ...(actions?.map((action) => ({
      value: action.id.toString(),
      label: `${action.name} - ${action.description}`,
    })) || []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Editar Permiso${permission ? `: ${permission.name}` : ''}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {initializing && (
          <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-700">
            Cargando datos del permiso...
          </div>
        )}

        {error && !initializing && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Input
          label="Nombre"
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Ej: Crear usuarios"
          required
          disabled={loading || initializing}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={formState.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe brevemente este permiso"
            disabled={loading || initializing}
          />
        </div>

        <Select
          label="Tipo de negocio"
          name="business_type_id"
          value={formState.business_type_id}
          onChange={handleChange}
          options={businessTypeOptions}
          disabled={loading || initializing || businessTypeList.length === 0}
        />

        <Select
          label="Recurso"
          name="resource_id"
          value={formState.resource_id}
          onChange={handleChange}
          options={resourceOptions}
          disabled={loading || initializing || resourcesLoading}
          required
        />

        <Select
          label="Acción"
          name="action_id"
          value={formState.action_id}
          onChange={handleChange}
          options={actionOptions}
          disabled={loading || initializing || actionsLoading}
          required
        />

        <Select
          label="Scope / Ámbito"
          name="scope_id"
          value={formState.scope_id}
          onChange={handleChange}
          options={scopeOptions}
          disabled={loading || initializing}
          required
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading || initializing}
          >
            <XMarkIcon className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading || initializing}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
