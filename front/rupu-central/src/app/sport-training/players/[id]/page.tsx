/**
 * Player Detail Page
 * Página de detalle de un jugador
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlayersRepository } from '@/services/modules/sport-training/players/infrastructure/repositories/players.repository';
import { TokenStorage } from '@shared/config';
import { Spinner, Button, Badge } from '@shared/ui';
import { EditPlayerModal } from '@/services/modules/sport-training/players/ui/edit-player-modal';
import type { Player } from '@/services/modules/sport-training/players/domain';

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = parseInt(params.id as string);

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadPlayer = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();

      if (!token || !businessId) {
        setError('No se encontró token o business activo');
        setLoading(false);
        return;
      }

      if (isNaN(playerId)) {
        setError('ID de jugador inválido');
        setLoading(false);
        return;
      }

      try {
        const repo = new PlayersRepository();
        const result = await repo.getPlayerById({
          businessId,
          playerId,
          token,
        });

        setPlayer(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando jugador..." />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error al cargar jugador</p>
          <p className="text-sm mt-1">{error || 'Jugador no encontrado'}</p>
        </div>
        <Button onClick={() => router.back()} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

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
            <Badge type={player.isActive ? 'success' : 'danger'}>
              {player.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        {/* Player Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {player.firstName} {player.lastName}
            </h1>
            <p className="text-gray-600 mt-1">Documento: {player.documentNumber}</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Edad</h3>
              <p className="mt-1 text-lg text-gray-900">{calculateAge(player.birthDate)} años</p>
              <p className="text-sm text-gray-500">Nacimiento: {new Date(player.birthDate).toLocaleDateString()}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Nivel de Habilidad</h3>
              <p className="mt-1">
                <Badge type="info" size="lg">{player.skillLevelName}</Badge>
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Contacto</h3>
            <div className="grid grid-cols-2 gap-4">
              {player.email && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="mt-1 text-gray-900">{player.email}</p>
                </div>
              )}
              {player.phone && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Teléfono</h4>
                  <p className="mt-1 text-gray-900">{player.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {player.emergencyContact && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contacto de Emergencia</h3>
              <p className="text-gray-900">{player.emergencyContact}</p>
            </div>
          )}

          {/* Medical Notes */}
          {player.medicalNotes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas Médicas</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-gray-900">{player.medicalNotes}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Información del Sistema</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creado:</span>{' '}
                {new Date(player.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Actualizado:</span>{' '}
                {new Date(player.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <EditPlayerModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            player={player}
          />
        )}
      </div>
    </div>
  );
}
