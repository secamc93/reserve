'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Alert, Spinner } from '@shared/ui';
import { updateResidentAction, getResidentByIdAction } from '../../infrastructure/actions';
import { getPropertyUnitsAction } from '../../infrastructure/actions';
import { Resident, UpdateResidentDTO } from '../../domain';
import { TokenStorage } from '@/modules/auth/infrastructure/storage';

interface EditResidentModalProps {
  hpId: number;
  resident: Resident;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditResidentModal({ hpId, resident, onClose, onSuccess }: EditResidentModalProps) {
  const [units, setUnits] = useState<Array<{ id: number; number: string }>>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingResident, setLoadingResident] = useState(true);
  const [residentData, setResidentData] = useState<Resident | null>(null);
  const [formData, setFormData] = useState<UpdateResidentDTO>({
    propertyUnitId: 0,
    residentTypeId: 1,
    name: '',
    email: '',
    dni: '',
    phone: '',
    emergencyContact: '',
    isMainResident: false,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos completos del residente
  useEffect(() => {
    const loadResident = async () => {
      setLoadingResident(true);
      try {
        const token = TokenStorage.getToken();
        if (!token) return;
        
        const fullResidentData = await getResidentByIdAction({
          hpId,
          residentId: resident.id,
          token,
        });
        
        setResidentData(fullResidentData);
        
        // Inicializar formulario con datos completos
        setFormData({
          propertyUnitId: fullResidentData.propertyUnitId,
          residentTypeId: fullResidentData.residentTypeId,
          name: fullResidentData.name,
          email: fullResidentData.email,
          dni: fullResidentData.dni,
          phone: fullResidentData.phone,
          emergencyContact: fullResidentData.emergencyContact,
          isMainResident: fullResidentData.isMainResident,
          isActive: fullResidentData.isActive,
        });
      } catch (error) {
        console.error('Error loading resident:', error);
        setError('Error al cargar los datos del residente');
      } finally {
        setLoadingResident(false);
      }
    };
    loadResident();
  }, [hpId, resident.id]);

  // Cargar unidades disponibles
  useEffect(() => {
    const loadUnits = async () => {
      setLoadingUnits(true);
      try {
        const token = TokenStorage.getToken();
        if (!token) return;
        const data = await getPropertyUnitsAction({ hpId, token, page: 1, pageSize: 100 });
        setUnits(data.units.map(u => ({ id: u.id, number: u.number })));
      } catch (error) {
        console.error('Error loading units:', error);
      } finally {
        setLoadingUnits(false);
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

      await updateResidentAction({
        hpId,
        residentId: resident.id,
        data: formData,
        token,
      });

      onSuccess();
    } catch (error) {
      console.error('Error al actualizar residente:', error);
      
      // Extraer mensaje de error más específico
      let errorMessage = 'Error al actualizar el residente';
      
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
      } else if (errorMessage.includes('not found') || errorMessage.includes('no encontrado')) {
        errorMessage = 'El residente no fue encontrado';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar spinner mientras carga los datos
  if (loadingResident) {
    return (
      <Modal isOpen onClose={onClose} title="Editar Residente">
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-600">Cargando datos del residente...</span>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title="Editar Residente">
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
              disabled={loadingUnits}
            >
              {loadingUnits ? (
                <option value={formData.propertyUnitId}>Cargando unidades...</option>
              ) : (
                units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.number}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Residente</label>
            <select
              value={formData.residentTypeId}
              onChange={(e) => setFormData({ ...formData, residentTypeId: Number(e.target.value) })}
              className="input w-full"
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
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Documento de Identidad"
            value={formData.dni || ''}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
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

        <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="checkbox"
            />
            <label htmlFor="isActive">Activo</label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar Residente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
