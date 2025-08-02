'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReservationService } from '../../internal/application/services/ReservationService';
import { Reservation, CreateReservationData, UpdateReservationStatusData, ReservationFilters } from '../../internal/domain/entities/Reservation';
import { config } from '../../config/env';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ReservationFilters>({});

  // Initialize service (memoized to prevent re-creation)
  const reservationService = useMemo(() => {
    return new ReservationService(config.API_BASE_URL);
  }, []);

  // Fetch reservations
  const fetchReservations = useCallback(async (filterParams: ReservationFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reservationService.getReservations(filterParams);
      
      if (result.success) {
        setReservations(result.data || []);
        setTotal(result.total || 0);
        setFilters(filterParams);
      } else {
        setError(result.error || 'Error desconocido al cargar reservas');
        setReservations([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Error in fetchReservations:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
      setReservations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [reservationService]);

  // Create new reservation
  const createReservation = useCallback(async (reservationData: CreateReservationData) => {
    console.log('🎯 HOOK createReservation llamado con:', reservationData);
    setLoading(true);
    setError(null);
    
    try {
      const result = await reservationService.createReservation(reservationData);
      console.log('🎯 HOOK Resultado del service:', result);
      
      if (result.success && result.data) {
        // Update local state atomically
        setReservations(prevReservations => {
          if (!Array.isArray(prevReservations)) {
            console.warn('⚠️ WARNING: prevReservations no es un array, inicializando...');
            return [result.data!];
          }
          
          // Check if reservation already exists (avoid duplicates)
          const existingReservation = prevReservations.find(r => 
            r.reserva_id === result.data!.reserva_id ||
            (r.cliente_email === result.data!.cliente_email && 
             r.start_at.getTime() === result.data!.start_at.getTime())
          );
          
          if (existingReservation) {
            console.warn('⚠️ WARNING: Reserva ya existe en el estado, no duplicando');
            return prevReservations;
          }
          
          return [result.data!, ...prevReservations];
        });
        
        // Update total count
        setTotal(prevTotal => prevTotal + 1);
        
        console.log('✅ HOOK: Estado local actualizado correctamente');
        return { success: true, message: 'Reserva creada exitosamente', data: result.data };
      } else {
        setError(result.error || 'Error al crear reserva');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('❌ ERROR en createReservation:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión al crear reserva');
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    } finally {
      setLoading(false);
    }
  }, [reservationService]);

  // Cancel reservation
  const cancelReservation = useCallback(async (id: number) => {
    console.log('🚀 HOOK: Iniciando cancelación de reserva con ID:', id);
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await reservationService.cancelReservation(id);
      
      console.log('🚀 HOOK: Resultado del service:', result);
      
      if (result.success) {
        console.log('🚀 HOOK: Cancelación exitosa, actualizando estado local');
        
        // Update local state - mark reservation as canceled
        setReservations(prevReservations => {
          if (!Array.isArray(prevReservations)) {
            console.warn('🚀 HOOK: prevReservations no es array:', prevReservations);
            return [];
          }
          
          return prevReservations.map(reservation => 
            reservation.reserva_id === id 
              ? { ...reservation, estado_codigo: 'cancelado', estado_nombre: 'Cancelado' }
              : reservation
          );
        });
        
        console.log('🚀 HOOK: Retornando éxito');
        return { success: true, message: 'Reserva cancelada exitosamente' };
      } else {
        console.log('🚀 HOOK: Cancelación falló:', result.error);
        setError(result.error || 'Error al cancelar reserva');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('🚀 HOOK: Error en cancelReservation:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión al cancelar reserva');
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    } finally {
      setLoading(false);
    }
  }, [reservationService]);

  // Update reservation status
  const updateReservationStatus = useCallback(async (id: number, status: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reservationService.updateReservationStatus({ reserva_id: id, status });
      
      if (result.success) {
        // Update local state
        setReservations(prevReservations => {
          if (!Array.isArray(prevReservations)) {
            console.warn('prevReservations is not an array:', prevReservations);
            return [];
          }
          
          return prevReservations.map(reservation => 
            reservation.reserva_id === id 
              ? { 
                  ...reservation, 
                  estado_codigo: status, 
                  estado_nombre: reservationService.getStatusName(status) 
                }
              : reservation
          );
        });
        return { success: true, message: 'Estado actualizado exitosamente' };
      } else {
        setError(result.error || 'Error al actualizar estado');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error in updateReservationStatus:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión al actualizar estado');
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    } finally {
      setLoading(false);
    }
  }, [reservationService]);

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
    return reservationService.getReservationsForDate(reservations, date);
  }, [reservationService, reservations]);

  // Initial load
  useEffect(() => {
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
    // Utility methods from service
    getStatusName: reservationService.getStatusName.bind(reservationService),
    getStatusColor: reservationService.getStatusColor.bind(reservationService),
    getStatusIcon: reservationService.getStatusIcon.bind(reservationService)
  };
}; 