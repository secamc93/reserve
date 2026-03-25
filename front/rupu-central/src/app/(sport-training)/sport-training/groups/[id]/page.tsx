'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGroupByIdAction, getGroupPlayersAction } from '@/services/modules/sport-training/groups/infrastructure/actions/get-groups.action';
import { addPlayerToGroupAction, removePlayerFromGroupAction } from '@/services/modules/sport-training/groups/infrastructure/actions';
import { TokenStorage } from '@shared/config';
import { Spinner, Button, Badge, FormModal, Input, ConfirmModal } from '@shared/ui';
import { EditGroupModal } from '@/services/modules/sport-training/groups/ui/edit-group-modal';
import type { TrainingGroup, GroupPlayer } from '@/services/modules/sport-training/groups/domain';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = parseInt(params.id as string);
  const [group, setGroup] = useState<TrainingGroup | null>(null);
  const [players, setPlayers] = useState<GroupPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [addPlayerId, setAddPlayerId] = useState('');
  const [removeModal, setRemoveModal] = useState<{ show: boolean; player?: GroupPlayer }>({ show: false });

  useEffect(() => {
    const load = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();
      if (!token || businessId === null || isNaN(groupId)) { setError('Datos invalidos'); setLoading(false); return; }
      try {
        const [gRes, pRes] = await Promise.all([
          getGroupByIdAction({ businessId, groupId, token }),
          getGroupPlayersAction({ groupId, businessId, token }),
        ]);
        if (gRes.success) setGroup(gRes.data); else setError(gRes.error);
        if (pRes.success) setPlayers(pRes.data);
      } catch (err) { setError(err instanceof Error ? err.message : 'Error desconocido'); }
      finally { setLoading(false); }
    }; load();
  }, [groupId]);

  const handleAddPlayer = async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token || !addPlayerId) return;
    const result = await addPlayerToGroupAction({ groupId, playerId: parseInt(addPlayerId), token });
    if (result.success) { setShowAddPlayerModal(false); setAddPlayerId(''); window.location.reload(); }
    else { alert(result.message || 'Error'); }
  };
  const handleRemovePlayer = async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token || !removeModal.player) return;
    const result = await removePlayerFromGroupAction({ groupId, playerId: removeModal.player.playerId, token });
    if (result.success) { setRemoveModal({ show: false }); window.location.reload(); }
    else { alert(result.message || 'Error'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" text="Cargando grupo..." /></div>;
  if (error || !group) return (<div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"><p>{error || 'No encontrado'}</p></div><Button onClick={() => router.back()} className="mt-4">Volver</Button></div>);

  return (
    <div className="p-8"><div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>&#8592; Volver</Button>
        <div className="flex gap-2 items-center"><Button onClick={() => setShowEditModal(true)}>Editar</Button><Badge type={group.isActive ? 'success' : 'danger'}>{group.isActive ? 'Activo' : 'Inactivo'}</Badge></div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="border-b pb-4"><h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>{group.category && <p className="text-gray-500">Categoria: {group.category}</p>}</div>
        <div className="grid grid-cols-2 gap-4">
          <div><h4 className="text-sm font-medium text-gray-500">Entrenador</h4><p className="mt-1">{group.coachName}</p></div>
          <div><h4 className="text-sm font-medium text-gray-500">Capacidad</h4><p className="mt-1">{group.currentCapacity}/{group.maxCapacity}</p></div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold">Jugadores ({players.length})</h3><Button size="sm" onClick={() => setShowAddPlayerModal(true)}>Agregar Jugador</Button></div>
          {players.length > 0 ? (<div className="space-y-2">{players.map((p) => (<div key={p.playerId} className="flex items-center justify-between p-3 bg-gray-50 border rounded"><span className="font-medium">{p.firstName} {p.lastName}</span><Button size="sm" variant="danger" onClick={() => setRemoveModal({ show: true, player: p })}>Remover</Button></div>))}</div>) : (<div className="bg-gray-50 border rounded p-4 text-center text-gray-500">Sin jugadores</div>)}
        </div>
      </div>
      {showEditModal && <EditGroupModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} group={group} />}
      {showAddPlayerModal && (<FormModal isOpen={showAddPlayerModal} onClose={() => setShowAddPlayerModal(false)} title="Agregar Jugador" size="sm"><div className="space-y-4"><Input label="ID Jugador *" type="number" value={addPlayerId} onChange={(e) => setAddPlayerId(e.target.value)} required /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowAddPlayerModal(false)}>Cancelar</Button><Button onClick={handleAddPlayer} disabled={!addPlayerId}>Agregar</Button></div></div></FormModal>)}
      {removeModal.show && removeModal.player && (<ConfirmModal isOpen={removeModal.show} onClose={() => setRemoveModal({ show: false })} title="Remover Jugador" message={'Remover a ' + removeModal.player.firstName + ' ' + removeModal.player.lastName + '?'} confirmText="Remover" cancelText="Cancelar" type="danger" onConfirm={handleRemovePlayer} />)}
    </div></div>
  );
}
