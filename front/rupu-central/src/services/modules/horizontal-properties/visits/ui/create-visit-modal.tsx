'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Button, Input, Alert, Select } from '@shared/ui';
import { VisitorSearch } from './visitor-search';
import { UnitAutocomplete } from './unit-autocomplete';
import { createVisitAction, searchVisitorAction, createVisitorAction, getVisitTypesAction } from '../infrastructure/actions';
import { Visitor, CreateVisitDTO, VisitType } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { PropertyUnit } from '@/services/modules/horizontal-properties/units/domain';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface CreateVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
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
    visitTypeId: undefined,
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

  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [businessToken, setBusinessToken] = useState<string>('');
  const calendarRef = useRef<HTMLDivElement>(null);
  const endCalendarRef = useRef<HTMLDivElement>(null);

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

  // Cargar tipos de visita y token
  useEffect(() => {
    if (isOpen && step === 'form') {
      loadTokenAndTypes();
      // Inicializar fecha de fin si existe
      if (formData.scheduledEndTime) {
        setSelectedEndDate(new Date(formData.scheduledEndTime));
      }
    }
  }, [isOpen, step]);

  const loadTokenAndTypes = async () => {
    try {
      const token = await getBusinessToken();
      setBusinessToken(token);
      await loadVisitTypes(token);
    } catch (err) {
      console.error('Error cargando token:', err);
    }
  };

  const loadVisitTypes = async (token?: string) => {
    setLoadingTypes(true);
    try {
      const t = token || await getBusinessToken();
      const types = await getVisitTypesAction({ token: t });
      // Filtrar solo los tipos activos
      const activeTypes = types.filter(type => type.isActive);
      setVisitTypes(activeTypes);
      // Si no hay un tipo seleccionado o el tipo seleccionado no está activo, seleccionar el primero
      if (activeTypes.length > 0 && (!formData.visitTypeId || !activeTypes.find(t => t.id === formData.visitTypeId))) {
        setFormData(prev => ({ ...prev, visitTypeId: activeTypes[0].id }));
      }
    } catch (err) {
      console.error('Error cargando tipos de visita:', err);
      setError('Error al cargar los tipos de visita');
    } finally {
      setLoadingTypes(false);
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
      visitTypeId: visitTypes.length > 0 ? visitTypes[0].id : undefined,
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

  // Funciones helper para fechas de inicio
  const setQuickDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    setSelectedDate(date);
    setFormData({ ...formData, scheduledDate: date.toISOString().split('T')[0] });
    setShowCalendar(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setFormData({ ...formData, scheduledDate: date.toISOString().split('T')[0] });
    setShowCalendar(false);
  };

  // Funciones helper para fechas de fin
  const handleEndDateSelect = (date: Date) => {
    setSelectedEndDate(date);
    // Si ya hay una hora de fin configurada, mantenerla pero actualizar la fecha
    if (formData.scheduledEndTime) {
      const endTime = new Date(formData.scheduledEndTime);
      endTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setFormData({ ...formData, scheduledEndTime: endTime.toISOString().slice(0, 16) });
    } else {
      // Si no hay hora configurada, establecer hora por defecto según la hora de inicio
      let defaultHour = 14; // Por defecto 14:00
      if (formData.scheduledStartTime) {
        const startHour = new Date(formData.scheduledStartTime).getHours();
        defaultHour = Math.min(startHour + 1, 20); // 1 hora después de inicio, máximo 20:00
      }
      const endTime = new Date(date);
      endTime.setHours(defaultHour, 0, 0, 0);
      setFormData({ ...formData, scheduledEndTime: endTime.toISOString().slice(0, 16) });
    }
    // No cerrar el calendario automáticamente para permitir ajustar la hora
  };

  const generateEndCalendarDays = () => {
    const baseDate = selectedEndDate || selectedDate || new Date();
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: new Date(year, month, -startingDayOfWeek + i + 1), isCurrentMonth: false });
    }
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Días del siguiente mes
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const navigateEndMonth = (direction: 'prev' | 'next') => {
    const baseDate = selectedEndDate || selectedDate || new Date();
    const newDate = new Date(baseDate);
    newDate.setMonth(baseDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedEndDate(newDate);
  };

  const isEndDateSelected = (date: Date) => {
    if (!formData.scheduledEndTime) return false;
    return date.toDateString() === new Date(formData.scheduledEndTime).toDateString();
  };

  const setQuickTime = (hour: number, minute: number = 0) => {
    const date = new Date(formData.scheduledDate || new Date().toISOString().split('T')[0]);
    date.setHours(hour, minute, 0, 0);
    setFormData({ ...formData, scheduledStartTime: date.toISOString().slice(0, 16) });
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    if (!selectedDate) return [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Días del mes anterior (para completar la primera semana)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: new Date(year, month, -startingDayOfWeek + i + 1), isCurrentMonth: false });
    }
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Días del siguiente mes (para completar la última semana)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!formData.scheduledDate) return false;
    return date.toDateString() === new Date(formData.scheduledDate).toDateString();
  };

  // Cerrar calendarios al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Calendario de fecha inicio
      if (calendarRef.current && !calendarRef.current.contains(target)) {
        if (!target.closest('input[placeholder*="Seleccione una fecha"]')) {
          setShowCalendar(false);
        }
      }
      
      // Calendario de fecha fin
      if (endCalendarRef.current && !endCalendarRef.current.contains(target)) {
        if (!target.closest('input[placeholder*="Seleccione fecha de fin"]')) {
          setShowEndCalendar(false);
        }
      }
    };

    if (showCalendar || showEndCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar, showEndCalendar]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Nueva Visita"
      className="!max-w-5xl !w-[95vw]"
    >
      <div className="space-y-6">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            <div className="whitespace-pre-line">{error}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            <div className="flex gap-2 pt-4">
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
          <div className="space-y-6">
            {/* Información del visitante - Header */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {visitor.fullName?.charAt(0)?.toUpperCase() || 'V'}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800">{visitor.fullName}</h3>
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>DNI: <strong>{visitor.dni}</strong></span>
                    <span>Tel: <strong>{visitor.phone}</strong></span>
                  </div>
                </div>
              {visitor.hasBlacklist && (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold text-sm">
                    ⚠️ Lista negra
                  </div>
              )}
              </div>
            </div>

            {/* Grid principal del formulario */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">1</span>
                    Destino de la Visita
                  </h4>
                  <div className="space-y-4">
                    {businessToken && (
                      <UnitAutocomplete
                        value={formData.propertyUnitId}
                        onChange={(id) => setFormData({ ...formData, propertyUnitId: id })}
                        businessId={businessId}
                        token={businessToken}
              required
            />
                    )}
            <Select
              label="Tipo de Visita *"
              value={formData.visitTypeId?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, visitTypeId: parseInt(e.target.value) })}
              options={[
                        { value: '', label: loadingTypes ? 'Cargando tipos...' : 'Seleccione un tipo' },
                ...visitTypes.map((type) => ({
                  value: type.id.toString(),
                  label: type.name,
                })),
              ]}
              required
                      disabled={loadingTypes || visitTypes.length === 0}
              />
              <Input
                      label="Propósito de la Visita"
              value={formData.purpose || ''}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      placeholder="Ej: Visita familiar, entrega de paquete, mantenimiento..."
            />
                  </div>
                </div>

                {/* Opciones adicionales */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">3</span>
                    Opciones Adicionales
                  </h4>
                  <div className="space-y-4">
            <Input
              label="Número de Visitantes"
              type="number"
              min="1"
                      max="20"
              value={formData.numberOfVisitors?.toString() || '1'}
              onChange={(e) => setFormData({ ...formData, numberOfVisitors: parseInt(e.target.value) || 1 })}
            />
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.hasCompanions || false}
                  onChange={(e) => setFormData({ ...formData, hasCompanions: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                        <span className="text-sm text-slate-700">Tiene acompañantes</span>
              </label>
                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.hasAssets || false}
                  onChange={(e) => setFormData({ ...formData, hasAssets: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                        <span className="text-sm text-slate-700">Trae equipos/activos</span>
              </label>
                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.notifyResident ?? true}
                  onChange={(e) => setFormData({ ...formData, notifyResident: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                        <span className="text-sm text-slate-700">Notificar residente</span>
              </label>
                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.notifySecurity || false}
                  onChange={(e) => setFormData({ ...formData, notifySecurity: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                        <span className="text-sm text-slate-700">Notificar seguridad</span>
              </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-5">
                {/* Selector de Fecha y Hora */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">2</span>
                    Fecha y Hora de la Visita
                  </h4>
                  
                    {/* Selector rápido de fecha */}
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <CalendarIcon className="w-4 h-4 inline mr-1" />
                          Fecha de la Visita *
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setQuickDate(0)}
                            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                              formData.scheduledDate === new Date().toISOString().split('T')[0]
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Hoy
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickDate(1)}
                            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                              formData.scheduledDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Mañana
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickDate(2)}
                            className="px-4 py-2 text-sm rounded-lg font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                          >
                            Pasado mañana
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickDate(7)}
                            className="px-4 py-2 text-sm rounded-lg font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                          >
                            En 1 semana
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.scheduledDate ? formatDisplayDate(formData.scheduledDate) : ''}
                            onFocus={() => setShowCalendar(true)}
                            readOnly
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 bg-white cursor-pointer"
                            placeholder="Seleccione una fecha"
                            required
                          />
                          <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {formData.scheduledDate && (
                          <p className="text-sm text-slate-500 mt-2">
                            📅 Fecha seleccionada: {formatDisplayDate(formData.scheduledDate)}
                          </p>
                        )}

                        {/* Calendario visual */}
                        {showCalendar && (
                          <div ref={calendarRef} className="absolute z-50 mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl p-4 w-full max-w-sm">
                            <div className="flex items-center justify-between mb-4">
                              <button
                                type="button"
                                onClick={() => navigateMonth('prev')}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <h3 className="font-semibold text-gray-900">
                                {selectedDate?.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                              </h3>
                              <button
                                type="button"
                                onClick={() => navigateMonth('next')}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                                  {day}
                                </div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {generateCalendarDays().map((dayObj, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleDateSelect(dayObj.date)}
                                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                    !dayObj.isCurrentMonth
                                      ? 'text-gray-300'
                                      : isSelected(dayObj.date)
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : isToday(dayObj.date)
                                      ? 'bg-blue-100 text-blue-700 font-bold'
                                      : 'text-gray-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {dayObj.date.getDate()}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowCalendar(false)}
                              className="mt-4 w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Cerrar
                            </button>
                          </div>
                        )}
                      </div>

                    {/* Selector de hora de inicio */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Hora de Inicio *
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[8, 9, 10, 11, 12, 14, 15, 16, 17, 18].map((hour) => (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => setQuickTime(hour)}
                            className="px-3 py-2 text-sm rounded-lg font-medium bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-all"
                          >
                            {hour}:00
                          </button>
                        ))}
                      </div>
                      <input
                        type="datetime-local"
                        value={formData.scheduledStartTime || ''}
                        onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 bg-white"
                        required
                      />
                      {formData.scheduledStartTime && (
                        <p className="text-sm text-slate-500 mt-2">
                          🕐 Hora seleccionada: {formatDisplayTime(formData.scheduledStartTime)}
                        </p>
                      )}
                    </div>

                    {/* Hora de fin opcional con calendario */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                        Fecha y Hora de Fin (Opcional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.scheduledEndTime 
                            ? `${formatDisplayDate(formData.scheduledEndTime)} - ${formatDisplayTime(formData.scheduledEndTime)}`
                            : ''}
                          onFocus={() => setShowEndCalendar(true)}
                          readOnly
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 bg-white cursor-pointer"
                          placeholder="Seleccione fecha de fin (opcional)"
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        {formData.scheduledEndTime && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, scheduledEndTime: undefined });
                              setSelectedEndDate(null);
                            }}
                            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Calendario visual para fecha de fin */}
                      {showEndCalendar && (
                        <div ref={endCalendarRef} className="absolute z-50 mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl p-4 w-full max-w-sm">
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={() => navigateEndMonth('prev')}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <h3 className="font-semibold text-gray-900">
                              {(selectedEndDate || selectedDate || new Date()).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                              type="button"
                              onClick={() => navigateEndMonth('next')}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                                {day}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1 mb-4">
                            {generateEndCalendarDays().map((dayObj, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleEndDateSelect(dayObj.date)}
                                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                  !dayObj.isCurrentMonth
                                    ? 'text-gray-300'
                                    : isEndDateSelected(dayObj.date)
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : isToday(dayObj.date)
                                    ? 'bg-blue-100 text-blue-700 font-bold'
                                    : 'text-gray-700 hover:bg-slate-100'
                                }`}
                              >
                                {dayObj.date.getDate()}
                              </button>
                            ))}
            </div>

                          {/* Selector de hora */}
                          <div className="border-t border-slate-200 pt-4 mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              <ClockIcon className="w-4 h-4 inline mr-1" />
                              Hora de Fin
              </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {[14, 15, 16, 17, 18, 19, 20].map((hour) => (
                                <button
                                  key={hour}
                                  type="button"
                                  onClick={() => {
                                    // Usar la fecha de fin seleccionada, o la fecha de inicio, o la fecha actual
                                    const baseDate = selectedEndDate 
                                      ? new Date(selectedEndDate)
                                      : (formData.scheduledDate 
                                        ? new Date(formData.scheduledDate)
                                        : new Date());
                                    const endDate = new Date(baseDate);
                                    endDate.setHours(hour, 0, 0, 0);
                                    setSelectedEndDate(endDate);
                                    setFormData({ ...formData, scheduledEndTime: endDate.toISOString().slice(0, 16) });
                                  }}
                                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                                    formData.scheduledEndTime && new Date(formData.scheduledEndTime).getHours() === hour
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700'
                                  }`}
                                >
                                  {hour}:00
                                </button>
                              ))}
                            </div>
                            <input
                              type="time"
                              value={formData.scheduledEndTime 
                                ? new Date(formData.scheduledEndTime).toTimeString().slice(0, 5) 
                                : ''}
                              onChange={(e) => {
                                const time = e.target.value;
                                if (time) {
                                  const [hours, minutes] = time.split(':');
                                  // Usar la fecha seleccionada o la fecha de inicio o la fecha actual
                                  const baseDate = selectedEndDate 
                                    ? new Date(selectedEndDate)
                                    : (formData.scheduledDate 
                                      ? new Date(formData.scheduledDate)
                                      : new Date());
                                  const endDate = new Date(baseDate);
                                  endDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                  setSelectedEndDate(endDate);
                                  setFormData({ ...formData, scheduledEndTime: endDate.toISOString().slice(0, 16) });
                                }
                              }}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                            />
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, scheduledEndTime: undefined });
                                setSelectedEndDate(null);
                                setShowEndCalendar(false);
                              }}
                              className="flex-1 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Limpiar
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowEndCalendar(false)}
                              className="flex-1 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Cerrar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">4</span>
                    Notas Adicionales
                  </h4>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Observaciones adicionales sobre la visita..."
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 bg-white"
              />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-4 border-t border-slate-200">
              <Button onClick={() => setStep('search')} variant="outline" className="flex-1 py-3">
                ← Volver
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-[2] py-3 text-lg font-semibold">
                {loading ? 'Creando visita...' : '✓ Crear Visita'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
