'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input, Alert, Select } from '@shared/ui';
import { VisitorSearch } from './visitor-search';
import { createVisitAction, searchVisitorAction, createVisitorAction } from '../infrastructure/actions';
import { Visitor, CreateVisitDTO } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { getPropertyUnitsAction } from '@/services/modules/horizontal-properties/units/infrastructure/actions';
import { PropertyUnit } from '@/services/modules/horizontal-properties/units/domain';

interface CreateVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

interface VisitType {
  id: number;
  name: string;
  code: string;
}

export function CreateVisitModal({ isOpen, onClose, onSuccess, businessId }: CreateVisitModalProps) {
  const [step, setStep] = useState<'search' | 'create-visitor' | 'form'>('search');
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [visitorNotFound, setVisitorNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Formulario de visitante nuevo
  const [newVisitor, setNewVisitor] = useState({
    dni: '',
    fullName: '',
    phone: '',
    email: '',
  });

  // Formulario de visita
  const [formData, setFormData] = useState<Partial<CreateVisitDTO>>({
    propertyUnitId: undefined,
    visitTypeId: 1, // Valor por defecto, se puede ajustar
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledStartTime: new Date().toISOString().slice(0, 16),
    scheduledEndTime: undefined,
    purpose: '',
    numberOfVisitors: 1,
    hasCompanions: false,
    hasAssets: false,
    notes: '',
    notifyResident: true,
    notifySecurity: false,
  });

  const [propertyUnits, setPropertyUnits] = useState<PropertyUnit[]>([]);
  const [visitTypes] = useState<VisitType[]>([
    { id: 1, name: 'Visita General', code: 'general' },
    { id: 2, name: 'Visita de Mantenimiento', code: 'maintenance' },
    { id: 3, name: 'Visita de Entrega', code: 'delivery' },
    { id: 4, name: 'Visita de Servicio', code: 'service' },
  ]);

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

  // Cargar unidades de propiedad
  useEffect(() => {
    if (isOpen && step === 'form') {
      loadPropertyUnits();
    }
  }, [isOpen, step]);

  const loadPropertyUnits = async () => {
    try {
      const token = await getBusinessToken();
      const result = await getPropertyUnitsAction({
        businessId,
        token,
        page: 1,
        pageSize: 100,
      });
      setPropertyUnits(result.units || []);
    } catch (err) {
      console.error('Error cargando unidades:', err);
    }
  };

  const handleVisitorFound = (foundVisitor: Visitor) => {
    setVisitor(foundVisitor);
    setVisitorNotFound(false);
    setStep('form');
    setError(null);
  };

  const handleVisitorNotFound = () => {
    setVisitorNotFound(true);
    setVisitor(null);
  };

  const handleCreateVisitor = async () => {
    if (!newVisitor.dni || !newVisitor.fullName || !newVisitor.phone) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getBusinessToken();
      
      // Crear o obtener visitante usando el endpoint
      const created = await createVisitorAction({
        businessId,
        data: {
          dni: newVisitor.dni,
          fullName: newVisitor.fullName,
          phone: newVisitor.phone,
          email: newVisitor.email,
        },
        token,
      });

      setVisitor(created);
      setStep('form');
      setSuccess('Visitante creado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al crear visitante');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!visitor || !formData.propertyUnitId || !formData.visitTypeId) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getBusinessToken();

      // Asegurar que el visitante tenga un ID válido
      if (!visitor.id || visitor.id === 0) {
        setError('El visitante no tiene un ID válido. Por favor, vuelva a buscar o crear el visitante.');
        setLoading(false);
        return;
      }

      const visitData: CreateVisitDTO = {
        visitorId: visitor.id!,
        propertyUnitId: formData.propertyUnitId!,
        visitTypeId: formData.visitTypeId!,
        scheduledDate: formData.scheduledDate || new Date().toISOString().split('T')[0],
        scheduledStartTime: formData.scheduledStartTime || new Date().toISOString(),
        scheduledEndTime: formData.scheduledEndTime ? new Date(formData.scheduledEndTime).toISOString() : undefined,
        purpose: formData.purpose,
        numberOfVisitors: formData.numberOfVisitors || 1,
        hasCompanions: formData.hasCompanions || false,
        hasAssets: formData.hasAssets || false,
        notes: formData.notes,
        notifyResident: formData.notifyResident ?? true,
        notifySecurity: formData.notifySecurity ?? false,
      };

      await createVisitAction({
        businessId,
        data: visitData,
        token,
      });

      setSuccess('Visita creada exitosamente');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al crear la visita');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('search');
    setVisitor(null);
    setVisitorNotFound(false);
    setError(null);
    setSuccess(null);
    setNewVisitor({ dni: '', fullName: '', phone: '', email: '' });
    setFormData({
      propertyUnitId: undefined,
      visitTypeId: 1,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledStartTime: new Date().toISOString().slice(0, 16),
      scheduledEndTime: undefined,
      purpose: '',
      numberOfVisitors: 1,
      hasCompanions: false,
      hasAssets: false,
      notes: '',
      notifyResident: true,
      notifySecurity: false,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Visita" size="2xl">
      <div className="space-y-6">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert type="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {step === 'search' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Instrucciones</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Ingrese el número de documento (DNI) del visitante en el campo de búsqueda</li>
                <li>Haga clic en el botón de búsqueda o presione Enter</li>
                <li>Si el visitante existe, se mostrará su información y podrá continuar</li>
                <li>Si no existe, aparecerá un botón para crear un nuevo visitante</li>
              </ol>
            </div>
            <VisitorSearch
              businessId={businessId}
              onVisitorFound={handleVisitorFound}
              onVisitorNotFound={handleVisitorNotFound}
            />
            {visitorNotFound && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-3">
                  ⚠️ El visitante no fue encontrado en el sistema.
                </p>
                <Button onClick={() => setStep('create-visitor')} className="w-full">
                  ➕ Crear Nuevo Visitante
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'create-visitor' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Datos del Visitante</h3>
            <Input
              label="DNI *"
              value={newVisitor.dni}
              onChange={(e) => setNewVisitor({ ...newVisitor, dni: e.target.value })}
              placeholder="Número de documento"
              required
            />
            <Input
              label="Nombre Completo *"
              value={newVisitor.fullName}
              onChange={(e) => setNewVisitor({ ...newVisitor, fullName: e.target.value })}
              placeholder="Nombre y apellidos"
              required
            />
            <Input
              label="Teléfono *"
              value={newVisitor.phone}
              onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
              placeholder="Número de teléfono"
              required
            />
            <Input
              label="Email"
              type="email"
              value={newVisitor.email}
              onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })}
              placeholder="Correo electrónico (opcional)"
            />
            <div className="flex gap-2">
              <Button onClick={() => setStep('search')} variant="outline" className="flex-1">
                Volver
              </Button>
              <Button onClick={handleCreateVisitor} disabled={loading} className="flex-1">
                {loading ? 'Procesando...' : 'Continuar'}
              </Button>
            </div>
          </div>
        )}

        {step === 'form' && visitor && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Visitante</h3>
              <p className="text-sm"><strong>Nombre:</strong> {visitor.fullName}</p>
              <p className="text-sm"><strong>DNI:</strong> {visitor.dni}</p>
              <p className="text-sm"><strong>Teléfono:</strong> {visitor.phone}</p>
              {visitor.hasBlacklist && (
                <p className="text-sm text-red-600 font-semibold mt-2">⚠️ Visitante en lista negra</p>
              )}
            </div>

            <Select
              label="Unidad de Propiedad *"
              value={formData.propertyUnitId?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, propertyUnitId: parseInt(e.target.value) })}
              options={[
                { value: '', label: 'Seleccione una unidad' },
                ...propertyUnits.map((unit) => ({
                  value: unit.id.toString(),
                  label: `${unit.number}${unit.block ? ` - Bloque ${unit.block}` : ''}${unit.floor ? ` - Piso ${unit.floor}` : ''}`,
                })),
              ]}
              required
            />

            <Select
              label="Tipo de Visita *"
              value={formData.visitTypeId?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, visitTypeId: parseInt(e.target.value) })}
              options={[
                { value: '', label: 'Seleccione un tipo' },
                ...visitTypes.map((type) => ({
                  value: type.id.toString(),
                  label: type.name,
                })),
              ]}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha Programada *"
                type="date"
                value={formData.scheduledDate || ''}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
              <Input
                label="Hora de Inicio *"
                type="datetime-local"
                value={formData.scheduledStartTime || ''}
                onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                required
              />
            </div>

            <Input
              label="Hora de Fin (Opcional)"
              type="datetime-local"
              value={formData.scheduledEndTime || ''}
              onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
            />

            <Input
              label="Propósito"
              value={formData.purpose || ''}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Motivo de la visita"
            />

            <Input
              label="Número de Visitantes"
              type="number"
              min="1"
              value={formData.numberOfVisitors?.toString() || '1'}
              onChange={(e) => setFormData({ ...formData, numberOfVisitors: parseInt(e.target.value) || 1 })}
            />

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasCompanions || false}
                  onChange={(e) => setFormData({ ...formData, hasCompanions: e.target.checked })}
                />
                <span className="text-sm">Tiene acompañantes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasAssets || false}
                  onChange={(e) => setFormData({ ...formData, hasAssets: e.target.checked })}
                />
                <span className="text-sm">Trae activos/equipos</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notifyResident ?? true}
                  onChange={(e) => setFormData({ ...formData, notifyResident: e.target.checked })}
                />
                <span className="text-sm">Notificar al residente</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notifySecurity || false}
                  onChange={(e) => setFormData({ ...formData, notifySecurity: e.target.checked })}
                />
                <span className="text-sm">Notificar a seguridad</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notas
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observaciones adicionales"
                rows={3}
                className="input w-full resize-none"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setStep('search')} variant="outline" className="flex-1">
                Volver
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? 'Creando...' : 'Crear Visita'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
