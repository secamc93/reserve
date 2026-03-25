'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBookingByIdAction } from '@/services/modules/sport-training/bookings/infrastructure/actions/get-bookings.action';
import { approveBookingAction, rejectBookingAction, cancelBookingAction } from '@/services/modules/sport-training/bookings/infrastructure/actions';
import { TokenStorage } from '@shared/config';
import { Spinner, Button, Badge, FormModal } from '@shared/ui';
import type { BookingDetail } from '@/services/modules/sport-training/bookings/domain';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = parseInt(params.id as string);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject' | 'cancel'; show: boolean }>({ type: 'approve', show: false });
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();
      if (!token || businessId === null || isNaN(bookingId)) { setError('Datos invalidos'); setLoading(false); return; }
      try { const r = await getBookingByIdAction({ businessId, bookingId, token }); if (r.success) setBooking(r.data); else setError(r.error); }
      catch (err) { setError(err instanceof Error ? err.message : 'Error desconocido'); }
      finally { setLoading(false); }
    }; load();
  }, [bookingId]);

  const handleAction = async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    const input = { bookingId, token, notes: actionNotes, reason: actionNotes };
    let result;
    if (actionModal.type === 'approve') result = await approveBookingAction(input);
    else if (actionModal.type === 'reject') result = await rejectBookingAction(input);
    else result = await cancelBookingAction(input);
    if (result.success) { setActionModal({ ...actionModal, show: false }); window.location.reload(); }
    else { alert(result.message || 'Error'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" text="Cargando reserva..." /></div>;
  if (error || !booking) return (<div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"><p>{error || 'No encontrada'}</p></div><Button onClick={() => router.back()} className="mt-4">Volver</Button></div>);

  const isPending = booking.statusCode === 'pending';
  const labels: Record<string, string> = { approve: 'Aprobar', reject: 'Rechazar', cancel: 'Cancelar' };

  return (
    <div className="p-8"><div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>&#8592; Volver</Button>
        <div className="flex gap-2 items-center">
          {isPending && (<><Button onClick={() => { setActionNotes(''); setActionModal({ type: 'approve', show: true }); }}>Aprobar</Button><Button variant="danger" onClick={() => { setActionNotes(''); setActionModal({ type: 'reject', show: true }); }}>Rechazar</Button></>)}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: booking.statusColor }}>{booking.statusName}</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="border-b pb-4"><h1 className="text-3xl font-bold text-gray-900">Reserva #{booking.id}</h1><p className="text-gray-600 mt-1">Jugador: {booking.playerName}</p></div>
        <div className="grid grid-cols-2 gap-4">
          <div><h4 className="text-sm font-medium text-gray-500">Fecha Reserva</h4><p className="mt-1">{new Date(booking.bookingDate).toLocaleString()}</p></div>
          {booking.price && <div><h4 className="text-sm font-medium text-gray-500">Precio</h4><p className="mt-1">${booking.price}</p></div>}
          <div><h4 className="text-sm font-medium text-gray-500">Pago</h4><Badge type={booking.isPaid ? 'success' : 'warning'}>{booking.isPaid ? 'Pagado' : 'Pendiente'}</Badge></div>
        </div>
        {booking.requestNotes && <div><h3 className="font-semibold mb-2">Notas</h3><p className="bg-gray-50 p-3 rounded">{booking.requestNotes}</p></div>}
        {booking.cancellationReason && <div className="bg-red-50 border border-red-200 rounded p-4"><p className="text-red-600">{booking.cancellationReason}</p></div>}
      </div>
      {actionModal.show && (<FormModal isOpen={actionModal.show} onClose={() => setActionModal({ ...actionModal, show: false })} title={labels[actionModal.type] + ' Reserva'} size="sm"><div className="space-y-4"><textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={3} placeholder="Notas (opcional)" /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setActionModal({ ...actionModal, show: false })}>Cancelar</Button><Button variant={actionModal.type === 'approve' ? 'primary' : 'danger'} onClick={handleAction}>{labels[actionModal.type]}</Button></div></div></FormModal>)}
    </div></div>
  );
}
