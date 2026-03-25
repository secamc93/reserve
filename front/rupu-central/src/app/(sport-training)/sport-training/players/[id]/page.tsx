'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPlayerByIdAction } from '@/services/modules/sport-training/players/infrastructure/actions/get-players.action';
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
    const load = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();
      if (!token || businessId === null || isNaN(playerId)) { setError('Datos invalidos'); setLoading(false); return; }
      try {
        const result = await getPlayerByIdAction({ businessId, playerId, token });
        if (result.success) setPlayer(result.data);
        else setError(result.error);
      } catch (err) { setError(err instanceof Error ? err.message : 'Error desconocido'); }
      finally { setLoading(false); }
    };
    load();
  }, [playerId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" text="Cargando jugador..." /></div>;
  if (error || !player) return (<div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"><p>{error || 'No encontrado'}</p></div><Button onClick={() => router.back()} className="mt-4">Volver</Button></div>);

  return (
    <div className="p-8"><div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>&#8592; Volver</Button>
        <div className="flex gap-2 items-center"><Button onClick={() => setShowEditModal(true)}>Editar</Button><Badge type={player.isActive ? 'success' : 'danger'}>{player.isActive ? 'Activo' : 'Inactivo'}</Badge></div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="border-b pb-4"><h1 className="text-3xl font-bold text-gray-900">{player.firstName} {player.lastName}</h1><p className="text-gray-600 mt-1">Documento: {player.documentNumber}</p></div>
        <div className="border-t pt-4 text-sm text-gray-600"><span className="font-medium">Creado:</span> {new Date(player.createdAt).toLocaleString()}</div>
      </div>
      {showEditModal && <EditPlayerModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} player={player} />}
    </div></div>
  );
}
