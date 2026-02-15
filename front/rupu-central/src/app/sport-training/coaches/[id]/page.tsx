/**
 * Coach Detail Page
 * Página de detalle de un entrenador
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CoachesRepository } from '@/services/modules/sport-training/coaches/infrastructure/repositories/coaches.repository';
import { TokenStorage } from '@shared/config';
import { Spinner, Button, Badge } from '@shared/ui';
import { EditCoachModal } from '@/services/modules/sport-training/coaches/ui/edit-coach-modal';
import type { Coach } from '@/services/modules/sport-training/coaches/domain';

export default function CoachDetailPage() {
  const params = useParams();
  const router = useRouter();
  const coachId = parseInt(params.id as string);

  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadCoach = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();

      if (!token || !businessId) {
        setError('No se encontró token o business activo');
        setLoading(false);
        return;
      }

      if (isNaN(coachId)) {
        setError('ID de entrenador inválido');
        setLoading(false);
        return;
      }

      try {
        const repo = new CoachesRepository();
        const result = await repo.getCoachById({
          businessId,
          coachId,
          token,
        });

        setCoach(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadCoach();
  }, [coachId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando entrenador..." />
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error al cargar entrenador</p>
          <p className="text-sm mt-1">{error || 'Entrenador no encontrado'}</p>
        </div>
        <Button onClick={() => router.back()} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            ← Volver
          </Button>
          <div className="flex gap-2 items-center">
            <Button onClick={() => setShowEditModal(true)}>
              Editar
            </Button>
            <Badge type={coach.isActive ? 'success' : 'danger'}>
              {coach.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        {/* Coach Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {coach.firstName} {coach.lastName}
            </h1>
            <p className="text-gray-600 mt-1">Documento: {coach.documentNumber}</p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Contacto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="mt-1 text-gray-900">{coach.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Teléfono</h4>
                <p className="mt-1 text-gray-900">{coach.phone}</p>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Especialidades</h3>
            {coach.specialties.length > 0 ? (
              <div className="space-y-3">
                {coach.specialties.map((specialty) => (
                  <div
                    key={specialty.id}
                    className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{specialty.specialtyName}</h4>
                      <p className="text-sm text-gray-600">Código: {specialty.specialtyCode}</p>
                    </div>
                    <div className="text-right">
                      <Badge type="primary">
                        {specialty.yearsExperience} años de experiencia
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center text-gray-500">
                Sin especialidades asignadas
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Información del Sistema</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creado:</span>{' '}
                {new Date(coach.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Actualizado:</span>{' '}
                {new Date(coach.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <EditCoachModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            coach={coach}
          />
        )}
      </div>
    </div>
  );
}
