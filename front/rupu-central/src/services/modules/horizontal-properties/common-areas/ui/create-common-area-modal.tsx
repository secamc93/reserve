'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input, Alert, Select } from '@shared/ui';
import { createCommonAreaAction, getCommonAreaTypesAction } from '../infrastructure/actions';
import { CreateCommonAreaDTO, CommonAreaType } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

interface CreateCommonAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

export function CreateCommonAreaModal({ isOpen, onClose, onSuccess, businessId }: CreateCommonAreaModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commonAreaTypes, setCommonAreaTypes] = useState<CommonAreaType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const getBusinessToken = useCallback(async (): Promise<string> => {
    let businessToken = TokenStorage.getBusinessToken();
    if (businessToken) return businessToken;

    const sessionToken = TokenStorage.getSessionToken();
    if (!sessionToken) throw new Error('No session token available');

    const user = TokenStorage.getUser();
    const isSuperAdmin = user?.is_super_admin;
    const business_id = isSuperAdmin ? 0 : businessId;

    const result = await generateBusinessTokenAction({
      business_id,
      session_token: sessionToken,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'No se pudo generar business token');
    }

    TokenStorage.setBusinessToken(result.data.token);
    TokenStorage.setActiveBusiness(business_id);
    return result.data.token;
  }, [businessId]);

  const [formData, setFormData] = useState<CreateCommonAreaDTO>({
    commonAreaTypeId: 0,
    name: '',
    description: '',
    location: '',
    maxCapacity: 1,
    areaSqm: undefined,
    hasEquipment: false,
    equipmentDescription: '',
    hourlyRate: undefined,
    requiresApproval: false,
    requiresDeposit: false,
    depositAmount: undefined,
    allowsRecurring: false,
    imageUrls: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCommonAreaTypes();
      resetForm();
    }
  }, [isOpen]);

  const loadCommonAreaTypes = async () => {
    try {
      setLoadingTypes(true);
      const token = await getBusinessToken();
      const types = await getCommonAreaTypesAction(token);
      setCommonAreaTypes(types.filter(t => t.isActive));
      
      // Si hay tipos y no hay uno seleccionado, seleccionar el primero
      if (types.length > 0 && formData.commonAreaTypeId === 0) {
        const firstType = types.find(t => t.isActive);
        if (firstType) {
          setFormData(prev => ({
            ...prev,
            commonAreaTypeId: firstType.id,
            maxCapacity: firstType.defaultMaxCapacity || 1,
            requiresApproval: firstType.requiresApproval,
            allowsRecurring: firstType.allowsRecurring,
          }));
        }
      }
    } catch (err) {
      console.error('Error cargando tipos de zonas comunes:', err);
      setError('Error cargando tipos de zonas comunes');
    } finally {
      setLoadingTypes(false);
    }
  };

  const resetForm = () => {
    setFormData({
      commonAreaTypeId: 0,
      name: '',
      description: '',
      location: '',
      maxCapacity: 1,
      areaSqm: undefined,
      hasEquipment: false,
      equipmentDescription: '',
      hourlyRate: undefined,
      requiresApproval: false,
      requiresDeposit: false,
      depositAmount: undefined,
      allowsRecurring: false,
      imageUrls: '',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.commonAreaTypeId || formData.commonAreaTypeId === 0) {
      setError('Debe seleccionar un tipo de zona común');
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (formData.maxCapacity < 1) {
      setError('La capacidad máxima debe ser al menos 1');
      return;
    }

    if (formData.requiresDeposit && (!formData.depositAmount || formData.depositAmount <= 0)) {
      setError('Si requiere depósito, debe especificar un monto válido');
      return;
    }

    setLoading(true);

    try {
      const token = await getBusinessToken();
      await createCommonAreaAction({
        businessId,
        token,
        data: {
          ...formData,
          description: formData.description || undefined,
          location: formData.location || undefined,
          areaSqm: formData.areaSqm || undefined,
          equipmentDescription: formData.equipmentDescription || undefined,
          hourlyRate: formData.hourlyRate || undefined,
          depositAmount: formData.depositAmount || undefined,
          imageUrls: formData.imageUrls || undefined,
        },
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creando zona común');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTypeChange = (typeId: number) => {
    const selectedType = commonAreaTypes.find(t => t.id === typeId);
    if (selectedType) {
      setFormData(prev => ({
        ...prev,
        commonAreaTypeId: typeId,
        maxCapacity: selectedType.defaultMaxCapacity || prev.maxCapacity,
        requiresApproval: selectedType.requiresApproval,
        allowsRecurring: selectedType.allowsRecurring,
      }));
    } else {
      setFormData(prev => ({ ...prev, commonAreaTypeId: typeId }));
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Nueva Zona Común"
      size="2xl"
      className="!max-w-4xl !w-[95vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            <div className="whitespace-pre-line">{error}</div>
          </Alert>
        )}

        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Información Básica
          </h3>

          <Select
            label="Tipo de Zona Común *"
            value={formData.commonAreaTypeId}
            onChange={(e) => handleTypeChange(Number(e.target.value))}
            options={commonAreaTypes.map(type => ({
              value: type.id,
              label: type.name,
            }))}
            placeholder="Seleccione un tipo"
            required
            disabled={loadingTypes || loading}
          />

          <Input
            label="Nombre *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Salón Comunal Principal"
            disabled={loading}
            required
          />

          <Input
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción de la zona común"
            disabled={loading}
          />

          <Input
            label="Ubicación"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Ej: Piso 1, Bloque A"
            disabled={loading}
          />
        </div>

        {/* Capacidad y Dimensiones */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Capacidad y Dimensiones
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Capacidad Máxima *"
              type="number"
              min="1"
              value={formData.maxCapacity}
              onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: Number(e.target.value) }))}
              disabled={loading}
              required
            />

            <Input
              label="Área (m²)"
              type="number"
              min="0"
              step="0.01"
              value={formData.areaSqm || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                areaSqm: e.target.value ? Number(e.target.value) : undefined 
              }))}
              disabled={loading}
            />
          </div>
        </div>

        {/* Equipamiento */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Equipamiento
          </h3>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasEquipment"
              checked={formData.hasEquipment}
              onChange={(e) => setFormData(prev => ({ ...prev, hasEquipment: e.target.checked }))}
              disabled={loading}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasEquipment" className="text-sm font-medium text-gray-700">
              Tiene equipamiento
            </label>
          </div>

          {formData.hasEquipment && (
            <Input
              label="Descripción del Equipamiento"
              value={formData.equipmentDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, equipmentDescription: e.target.value }))}
              placeholder="Ej: Proyector, Sonido, Mesas, Sillas"
              disabled={loading}
            />
          )}
        </div>

        {/* Tarifas y Depósitos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Tarifas y Depósitos
          </h3>

          <Input
            label="Tarifa por Hora"
            type="number"
            min="0"
            step="0.01"
            value={formData.hourlyRate || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              hourlyRate: e.target.value ? Number(e.target.value) : undefined 
            }))}
            disabled={loading}
            placeholder="0.00"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requiresDeposit"
              checked={formData.requiresDeposit}
              onChange={(e) => setFormData(prev => ({ ...prev, requiresDeposit: e.target.checked }))}
              disabled={loading}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="requiresDeposit" className="text-sm font-medium text-gray-700">
              Requiere depósito
            </label>
          </div>

          {formData.requiresDeposit && (
            <Input
              label="Monto del Depósito *"
              type="number"
              min="0"
              step="0.01"
              value={formData.depositAmount || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                depositAmount: e.target.value ? Number(e.target.value) : undefined 
              }))}
              disabled={loading}
              required={formData.requiresDeposit}
              placeholder="0.00"
            />
          )}
        </div>

        {/* Configuración */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Configuración
          </h3>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requiresApproval"
                checked={formData.requiresApproval}
                onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                disabled={loading}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="requiresApproval" className="text-sm font-medium text-gray-700">
                Requiere aprobación
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowsRecurring"
                checked={formData.allowsRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, allowsRecurring: e.target.checked }))}
                disabled={loading}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="allowsRecurring" className="text-sm font-medium text-gray-700">
                Permite reservas recurrentes
              </label>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={handleClose}
            disabled={loading}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || loadingTypes}
            variant="primary"
          >
            {loading ? 'Creando...' : 'Crear Zona Común'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
