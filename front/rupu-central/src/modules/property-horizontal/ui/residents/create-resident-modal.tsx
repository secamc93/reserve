'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Alert } from '@shared/ui';
import { createResidentAction } from '../../infrastructure/actions';
import { getPropertyUnitsAction } from '../../infrastructure/actions';
import { CreateResidentDTO } from '../../domain';
import { TokenStorage } from '@/modules/auth/infrastructure/storage';

interface CreateResidentModalProps {
  hpId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateResidentModal({ hpId, onClose, onSuccess }: CreateResidentModalProps) {
  const [units, setUnits] = useState<Array<{ id: number; number: string }>>([]);
  const [formData, setFormData] = useState<CreateResidentDTO>({
    propertyUnitId: 0,
    residentTypeId: 1,
    name: '',
    email: '',
    dni: '',
    phone: '',
    emergencyContact: '',
    isMainResident: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const token = TokenStorage.getToken();
        if (!token) return;
        const data = await getPropertyUnitsAction({ hpId, token, page: 1, pageSize: 100 });
        setUnits(data.units.map(u => ({ id: u.id, number: u.number })));
      } catch (error) {
        console.error('Error loading units:', error);
      }
    };
    loadUnits();
  }, [hpId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Limpiar error previo

    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No se encontró el token de autenticación');

      // Validación de unidad seleccionada
      if (!formData.propertyUnitId || formData.propertyUnitId === 0) {
        throw new Error('Debes seleccionar una unidad');
      }

      await createResidentAction({
        hpId,
        data: formData,
        token,
      });

      onSuccess();
    } catch (error) {
      console.error('Error al crear residente:', error);
      
      // Extraer mensaje de error más específico
      let errorMessage = 'Error al crear el residente';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Mensajes de error más amigables según el tipo
      if (errorMessage.includes('email')) {
        errorMessage = 'El email ya está registrado o no es válido';
      } else if (errorMessage.includes('DNI') || errorMessage.includes('dni')) {
        errorMessage = 'El documento de identidad ya está registrado';
      } else if (errorMessage.includes('token')) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Crear Residente">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Alerta de error */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Unidad</label>
            <select
              value={formData.propertyUnitId}
              onChange={(e) => setFormData({ ...formData, propertyUnitId: Number(e.target.value) })}
              className="input w-full"
              required
            >
              <option value={0}>Seleccionar unidad</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Residente</label>
            <select
              value={formData.residentTypeId}
              onChange={(e) => setFormData({ ...formData, residentTypeId: Number(e.target.value) })}
              className="input w-full"
              required
            >
              <option value={1}>Propietario</option>
              <option value={2}>Arrendatario</option>
              <option value={3}>Familiar</option>
              <option value={4}>Invitado</option>
            </select>
          </div>
        </div>

        <Input
          label="Nombre Completo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Documento de Identidad"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Contacto de Emergencia"
            value={formData.emergencyContact || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isMain"
            checked={formData.isMainResident}
            onChange={(e) => setFormData({ ...formData, isMainResident: e.target.checked })}
            className="checkbox"
          />
          <label htmlFor="isMain">Residente principal</label>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Residente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
