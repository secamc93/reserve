'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getReservationsAction } from '@/services/reservations/infrastructure/actions/reservations.actions';
import { Reservation, CreateReservationData, UpdateReservationStatusData, ReservationFilters } from '@/services/reservations/domain/entities/Reservation';
import { createReservationAction } from '@/services/reservations/infrastructure/actions/reservations.actions';
import { updateReservationStatusAction } from '@/services/reservations/infrastructure/actions/reservations.actions';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ReservationFilters>({});

  // Helper function para formatear fechas correctamente para el backend
  const formatDateForBackend = (date: Date): string => {
    // El backend espera formato: "2025-08-18T17:00:00Z"
    // Asegurarnos de que tenga segundos y zona horaria
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
  };

  // Fetch reservations using Server Action
  const fetchReservations = useCallback(async (filterParams: ReservationFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useReservations] Llamando a getReservationsAction...');
      const result = await getReservationsAction(filterParams);
      console.log('✅ [useReservations] Resultado recibido:', result);
      
      if (result.success) {
        // Convertir las fechas de string a Date
        const reservationsWithDates = (result.data || []).map((reservation: any) => ({
          ...reservation,
          start_at: new Date(reservation.start_at),
          end_at: new Date(reservation.end_at),
          reserva_creada: new Date(reservation.reserva_creada),
          reserva_actualizada: new Date(reservation.reserva_actualizada),
          status_history: reservation.status_history?.map((history: any) => ({
            ...history,
            changed_at: new Date(history.changed_at)
          })) || []
        }));

        setReservations(reservationsWithDates);
        setTotal(result.total || 0);
        setFilters(filterParams);
        console.log('✅ [useReservations] Reservas cargadas:', reservationsWithDates.length);
      } else {
        setError(result.message || 'Error desconocido al cargar reservas');
        setReservations([]);
        setTotal(0);
        console.log('❌ [useReservations] Error al cargar reservas:', result.message);
      }
    } catch (err) {
      console.error('❌ [useReservations] Error en fetchReservations:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
      setReservations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new reservation (placeholder - implementar cuando se necesite)
  const createReservation = useCallback(async (reservationData: CreateReservationData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useReservations] Llamando a createReservationAction...');
      console.log('📤 [useReservations] Datos a enviar:', reservationData);
      console.log('🔍 [useReservations] Tipos de datos:', {
        number_of_guests: { value: reservationData.number_of_guests, type: typeof reservationData.number_of_guests },
        mesa_id: { value: reservationData.mesa_id, type: typeof reservationData.mesa_id },
        restaurante_id: { value: reservationData.restaurante_id, type: typeof reservationData.restaurante_id },
        start_at: { value: reservationData.start_at, type: typeof reservationData.start_at },
        end_at: { value: reservationData.end_at, type: typeof reservationData.end_at }
      });
      
      // Convertir CreateReservationData a FormData para el Server Action
      const formData = new FormData();
      Object.entries(reservationData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            // Usar el formato correcto para el backend
            const formattedDate = formatDateForBackend(value);
            console.log(`📅 [useReservations] Fecha formateada para ${key}:`, {
              original: value,
              formatted: formattedDate
            });
            formData.append(key, formattedDate);
          } else if (typeof value === 'string' && (key === 'start_at' || key === 'end_at')) {
            // Si es un string de fecha, convertirlo al formato correcto
            try {
              const dateValue = new Date(value);
              if (!isNaN(dateValue.getTime())) {
                const formattedDate = formatDateForBackend(dateValue);
                console.log(`📅 [useReservations] Fecha string convertida para ${key}:`, {
                  original: value,
                  converted: dateValue,
                  formatted: formattedDate
                });
                formData.append(key, formattedDate);
              } else {
                console.log(`⚠️ [useReservations] Fecha inválida para ${key}:`, value);
                formData.append(key, value);
              }
            } catch (error) {
              console.log(`⚠️ [useReservations] Error convirtiendo fecha para ${key}:`, error);
              formData.append(key, value);
            }
          } else {
            // Los demás campos ya vienen con el tipo correcto
            formData.append(key, value.toString());
          }
        }
      });
      
      const result = await createReservationAction(formData);
      console.log('✅ [useReservations] Resultado de creación:', result);
      
      if (result.success && result.data) {
        const newReservation = result.data;
        // Convertir las fechas de string a Date
        const reservationWithDates = {
          ...newReservation,
          start_at: new Date(newReservation.start_at),
          end_at: new Date(newReservation.end_at),
          reserva_creada: new Date(newReservation.reserva_creada),
          reserva_actualizada: new Date(newReservation.reserva_actualizada),
          status_history: newReservation.status_history?.map((history: any) => ({
            ...history,
            changed_at: new Date(history.changed_at)
          })) || []
        };
        
        setReservations(prev => [reservationWithDates, ...prev]);
        setTotal(prev => prev + 1);
        console.log('✅ [useReservations] Reserva creada exitosamente');
        return { success: true, message: 'Reserva creada exitosamente', data: reservationWithDates };
      } else {
        const errorMsg = result.message || 'Error al crear reserva';
        setError(errorMsg);
        console.log('❌ [useReservations] Error al crear reserva:', errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('❌ [useReservations] Error en createReservation:', err);
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel reservation (placeholder - implementar cuando se necesite)
  const cancelReservation = useCallback(async (reservationId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useReservations] Llamando a updateReservationStatusAction...');
      console.log('📤 [useReservations] Cancelando reserva ID:', reservationId);
      
      // Por ahora usamos updateReservationStatusAction para cancelar
      // TODO: Implementar cancelReservationAction si existe en el backend
      const result = await updateReservationStatusAction(reservationId, 'cancelled');
      console.log('✅ [useReservations] Resultado de cancelación:', result);
      
      if (result.success && result.data) {
        const updatedReservation = result.data;
        // Convertir las fechas de string a Date
        const reservationWithDates = {
          ...updatedReservation,
          start_at: new Date(updatedReservation.start_at),
          end_at: new Date(updatedReservation.end_at),
          reserva_creada: new Date(updatedReservation.reserva_creada),
          reserva_actualizada: new Date(updatedReservation.reserva_actualizada),
          status_history: updatedReservation.status_history?.map((history: any) => ({
            ...history,
            changed_at: new Date(history.changed_at)
          })) || []
        };
        
        // Actualizar la reserva en el estado local
        setReservations(prev => prev.map(reservation => 
          reservation.reserva_id === reservationId ? reservationWithDates : reservation
        ));
        
        console.log('✅ [useReservations] Reserva cancelada exitosamente');
        return { success: true, message: 'Reserva cancelada exitosamente' };
      } else {
        const errorMsg = result.message || 'Error al cancelar reserva';
        setError(errorMsg);
        console.log('❌ [useReservations] Error al cancelar reserva:', errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('❌ [useReservations] Error en cancelReservation:', err);
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update reservation status (placeholder - implementar cuando se necesite)
  const updateReservationStatus = useCallback(async (data: UpdateReservationStatusData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useReservations] Llamando a updateReservationStatusAction...');
      console.log('📤 [useReservations] Actualizando estado de reserva:', data);
      
      const result = await updateReservationStatusAction(data.reserva_id, data.status);
      console.log('✅ [useReservations] Resultado de actualización de estado:', result);
      
      if (result.success && result.data) {
        const updatedReservation = result.data;
        // Convertir las fechas de string a Date
        const reservationWithDates = {
          ...updatedReservation,
          start_at: new Date(updatedReservation.start_at),
          end_at: new Date(updatedReservation.end_at),
          reserva_creada: new Date(updatedReservation.reserva_creada),
          reserva_actualizada: new Date(updatedReservation.reserva_actualizada),
          status_history: updatedReservation.status_history?.map((history: any) => ({
            ...history,
            changed_at: new Date(history.changed_at)
          })) || []
        };
        
        // Actualizar la reserva en el estado local
        setReservations(prev => prev.map(reservation => 
          reservation.reserva_id === data.reserva_id ? reservationWithDates : reservation
        ));
        
        console.log('✅ [useReservations] Estado de reserva actualizado exitosamente');
        return { success: true, message: 'Estado actualizado exitosamente' };
      } else {
        const errorMsg = result.message || 'Error al actualizar estado';
        setError(errorMsg);
        console.log('❌ [useReservations] Error al actualizar estado:', errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('❌ [useReservations] Error en updateReservationStatus:', err);
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback((newFilters: ReservationFilters) => {
    fetchReservations(newFilters);
  }, [fetchReservations]);

  // Clear filters
  const clearFilters = useCallback(() => {
    fetchReservations({});
  }, [fetchReservations]);

  // Get reservations for a specific date
  const getReservationsForDate = useCallback((date: Date): Reservation[] => {
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.start_at);
      return reservationDate.toDateString() === date.toDateString();
    });
  }, [reservations]);

  // Utility methods for status
  const getStatusName = useCallback((status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmada',
      'cancelled': 'Cancelada',
      'completed': 'Completada'
    };
    return statusMap[status] || status;
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    const colorMap: Record<string, string> = {
      'pending': 'text-yellow-600',
      'confirmed': 'text-green-600',
      'cancelled': 'text-red-600',
      'completed': 'text-blue-600'
    };
    return colorMap[status] || 'text-gray-600';
  }, []);

  const getStatusIcon = useCallback((status: string): string => {
    const iconMap: Record<string, string> = {
      'pending': '⏳',
      'confirmed': '✅',
      'cancelled': '❌',
      'completed': '🎉'
    };
    return iconMap[status] || '❓';
  }, []);

  // Initial load
  useEffect(() => {
    console.log('🚀 [useReservations] Hook montado, cargando reservas...');
    console.log('🔍 [useReservations] Estado inicial:', {
      loading,
      error,
      reservationsCount: reservations.length,
      total
    });
    fetchReservations();
  }, [fetchReservations]);

  return {
    reservations: Array.isArray(reservations) ? reservations : [], // Always ensure array
    loading,
    error,
    total,
    filters,
    fetchReservations,
    createReservation,
    cancelReservation,
    updateReservationStatus,
    applyFilters,
    clearFilters,
    getReservationsForDate,
    // Utility methods
    getStatusName,
    getStatusColor,
    getStatusIcon
  };
}; 