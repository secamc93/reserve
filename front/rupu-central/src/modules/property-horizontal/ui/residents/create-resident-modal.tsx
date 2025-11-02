'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Alert } from '@shared/ui';
import { createResidentAction } from '../../infrastructure/actions';
import { getPropertyUnitsAction } from '../../infrastructure/actions';
import { CreateResidentDTO } from '../../domain';
import { TokenStorage } from '@/modules/auth/infrastructure/storage';

interface CreateResidentModalProps {
  businessId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateResidentModal({ businessId, onClose, onSuccess }: CreateResidentModalProps) {
  const [units, setUnits] = useState<Array<{ id: number; number: string }>>([]);
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
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

  const loadUnits = async (searchTerm: string = '') => {
    try {
      setLoadingUnits(true);
      const token = TokenStorage.getToken();
      if (!token) return;
      const data = await getPropertyUnitsAction({ 
        businessId, 
        token, 
        page: 1, 
        pageSize: 50,
        number: searchTerm || undefined
      });
      setUnits(data.units.map(u => ({ id: u.id, number: u.number })));
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoadingUnits(false);
    }
  };

  // Cargar unidades al enfocar o al buscar
  useEffect(() => {
    if (showUnitDropdown) {
      const timer = setTimeout(() => {
        loadUnits(unitSearchTerm);
      }, 300); // Debounce de 300ms
      return () => clearTimeout(timer);
    }
  }, [unitSearchTerm, showUnitDropdown, businessId]);

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
        businessId,
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
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar unidad..."
                value={unitSearchTerm}
                onChange={(e) => {
                  setUnitSearchTerm(e.target.value);
                  setShowUnitDropdown(true);
                }}
                onFocus={() => setShowUnitDropdown(true)}
                className="input w-full pr-8"
                required
              />
              {loadingUnits && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {showUnitDropdown && !loadingUnits && units.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {units.map(unit => (
                    <div
                      key={unit.id}
                      onClick={() => {
                        setFormData({ ...formData, propertyUnitId: unit.id });
                        setUnitSearchTerm(unit.number);
                        setShowUnitDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                    >
                      {unit.number}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
