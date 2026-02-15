/**
 * Settings Page - Sport Training Catalogs
 * Página de visualización de catálogos maestros
 */
'use client';

import { useEffect, useState } from 'react';
import { CatalogRepository } from '@/services/modules/sport-training/shared/infrastructure/repositories/catalog.repository';
import { TokenStorage } from '@shared/config';
import { Spinner, Badge } from '@shared/ui';
import type { SkillLevel, SessionType, BookingStatus, AttendanceStatus, CoachSpecialty } from '@/services/modules/sport-training/shared/domain/entities';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogs, setCatalogs] = useState<{
    skillLevels: SkillLevel[];
    sessionTypes: SessionType[];
    bookingStatuses: BookingStatus[];
    attendanceStatuses: AttendanceStatus[];
    coachSpecialties: CoachSpecialty[];
  } | null>(null);

  useEffect(() => {
    const loadCatalogs = async () => {
      const token = TokenStorage.getBusinessToken();

      if (!token) {
        setError('No se encontró token de autenticación');
        setLoading(false);
        return;
      }

      try {
        const repo = new CatalogRepository();

        const [skillLevels, sessionTypes, bookingStatuses, attendanceStatuses, coachSpecialties] = await Promise.all([
          repo.getSkillLevels(token),
          repo.getSessionTypes(token),
          repo.getBookingStatuses(token),
          repo.getAttendanceStatuses(token),
          repo.getCoachSpecialties(token),
        ]);

        setCatalogs({
          skillLevels,
          sessionTypes,
          bookingStatuses,
          attendanceStatuses,
          coachSpecialties,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadCatalogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando catálogos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error al cargar catálogos</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!catalogs) return null;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración - Sport Training</h1>
          <p className="text-gray-600 mt-2">Catálogos maestros del sistema</p>
        </div>

        {/* Skill Levels */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Niveles de Habilidad</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {catalogs.skillLevels.map((level) => (
              <div key={level.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{level.name}</span>
                  <Badge type={level.isActive ? 'success' : 'danger'} size="sm">
                    {level.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{level.description}</p>
                <p className="text-xs text-gray-400 mt-1">Orden: {level.sortOrder}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tipos de Sesión</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalogs.sessionTypes.map((type) => (
              <div key={type.id} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{type.name}</span>
                  <div className="flex gap-2">
                    {type.isGroup && <Badge type="primary" size="sm">Grupal</Badge>}
                    <Badge type={type.isActive ? 'success' : 'danger'} size="sm">
                      {type.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {type.maxParticipants && <span>Max: {type.maxParticipants} participantes</span>}
                  <span>Duración: {type.defaultDurationMinutes} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coach Specialties */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Especialidades de Entrenadores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {catalogs.coachSpecialties.map((specialty) => (
              <div key={specialty.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{specialty.name}</span>
                  <Badge type={specialty.isActive ? 'success' : 'danger'} size="sm">
                    {specialty.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{specialty.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Statuses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Estados de Reserva</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {catalogs.bookingStatuses.map((status) => (
              <div key={status.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{status.name}</span>
                  <Badge type={status.isActive ? 'success' : 'danger'} size="sm">
                    {status.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{status.description}</p>
                <p className="text-xs text-gray-400 mt-1">Code: {status.code}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Statuses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Estados de Asistencia</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {catalogs.attendanceStatuses.map((status) => (
              <div key={status.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{status.name}</span>
                  <Badge type={status.isActive ? 'success' : 'danger'} size="sm">
                    {status.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{status.description}</p>
                <p className="text-xs text-gray-400 mt-1">Code: {status.code}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
