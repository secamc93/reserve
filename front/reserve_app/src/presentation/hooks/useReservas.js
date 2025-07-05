// Presentation - Custom Hook
import { useState, useEffect, useCallback, useMemo } from 'react';
import { GetReservasUseCase, CreateReservaUseCase, CancelReservaUseCase, UpdateReservaStatusUseCase } from '../../application/use-cases/GetReservasUseCase.js';
import { ApiReservaRepository } from '../../infrastructure/adapters/ApiReservaRepository.js';

export const useReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});

  // Initialize use cases with repository (memoized to prevent re-creation)
  const { getReservasUseCase, createReservaUseCase, cancelReservaUseCase, updateReservaStatusUseCase } = useMemo(() => {
    const reservaRepository = new ApiReservaRepository();
    return {
      getReservasUseCase: new GetReservasUseCase(reservaRepository),
      createReservaUseCase: new CreateReservaUseCase(reservaRepository),
      cancelReservaUseCase: new CancelReservaUseCase(reservaRepository),
      updateReservaStatusUseCase: new UpdateReservaStatusUseCase(reservaRepository)
    };
  }, []);

  // Fetch reservas
  const fetchReservas = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getReservasUseCase.execute(filterParams);
      
      if (result.success) {
        // Ensure data is always an array
        const reservasArray = Array.isArray(result.data) ? result.data : [];
        setReservas(reservasArray);
        setTotal(result.total || 0);
        setFilters(result.filters || {});
      } else {
        setError(result.error || 'Error desconocido al cargar reservas');
        setReservas([]); // Always set as empty array
        setTotal(0);
      }
    } catch (err) {
      console.error('Error in fetchReservas:', err);
      setError(err.message || 'Error de conexión con el servidor');
      setReservas([]); // Always set as empty array
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [getReservasUseCase]);

  // Create new reserva
  const createReserva = useCallback(async (reservaData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createReservaUseCase.execute(reservaData);
      
      if (result.success) {
        // Add the new reserva to the local state
        setReservas(prevReservas => {
          if (!Array.isArray(prevReservas)) {
            console.warn('prevReservas is not an array:', prevReservas);
            return [result.data];
          }
          return [result.data, ...prevReservas];
        });
        
        // Update total count
        setTotal(prevTotal => prevTotal + 1);
        
        return { success: true, message: result.message };
      } else {
        setError(result.error || 'Error al crear reserva');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error in createReserva:', err);
      setError(err.message || 'Error de conexión al crear reserva');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [createReservaUseCase]);

  // Cancel reserva
  const cancelReserva = useCallback(async (id) => {
    console.log('🚀 HOOK: Iniciando cancelación de reserva con ID:', id);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 HOOK: Llamando cancelReservaUseCase.execute');
      
      const result = await cancelReservaUseCase.execute(id);
      
      console.log('🚀 HOOK: Resultado del use case:', result);
      console.log('🚀 HOOK: result.success:', result.success);
      console.log('🚀 HOOK: result.data:', result.data);
      
      if (result.success) {
        console.log('🚀 HOOK: Cancelación exitosa, actualizando estado local');
        console.log('🚀 HOOK: ID a buscar:', id);
        
        // Update local state - mark reserva as canceled
        setReservas(prevReservas => {
          console.log('🚀 HOOK: prevReservas:', prevReservas);
          console.log('🚀 HOOK: prevReservas es array:', Array.isArray(prevReservas));
          console.log('🚀 HOOK: Cantidad de reservas:', prevReservas.length);
          
          if (!Array.isArray(prevReservas)) {
            console.warn('🚀 HOOK: prevReservas no es array:', prevReservas);
            return [];
          }
          
          console.log('🚀 HOOK: Mapeando reservas...');
          const updatedReservas = prevReservas.map((reserva, index) => {
            console.log(`🚀 HOOK: Reserva ${index}:`, reserva);
            console.log(`🚀 HOOK: reserva.reserva_id:`, reserva?.reserva_id);
            console.log(`🚀 HOOK: Comparando ${reserva?.reserva_id} === ${id}`);
            
            if (!reserva) {
              console.warn(`🚀 HOOK: Reserva ${index} es undefined/null`);
              return reserva;
            }
            
            const shouldUpdate = reserva.reserva_id === id;
            console.log(`🚀 HOOK: Debe actualizar reserva ${index}:`, shouldUpdate);
            
            return shouldUpdate
              ? { ...reserva, estado_codigo: 'cancelado', estado_nombre: 'Cancelado' }
              : reserva;
          });
          
          console.log('🚀 HOOK: Estado actualizado:', updatedReservas);
          return updatedReservas;
        });
        
        console.log('🚀 HOOK: Retornando éxito');
        return { success: true, message: result.message };
      } else {
        console.log('🚀 HOOK: Cancelación falló:', result.error);
        setError(result.error || 'Error al cancelar reserva');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('🚀 HOOK: Error en cancelReserva:', err);
      console.error('🚀 HOOK: Mensaje de error:', err.message);
      console.error('🚀 HOOK: Stack trace:', err.stack);
      
      setError(err.message || 'Error de conexión al cancelar reserva');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [cancelReservaUseCase]);

  // Update reservation status
  const updateReservaStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateReservaStatusUseCase.execute(id, status);
      
      if (result.success) {
        // Update local state - ensure reservas is array before mapping
        setReservas(prevReservas => {
          if (!Array.isArray(prevReservas)) {
            console.warn('prevReservas is not an array:', prevReservas);
            return [];
          }
          
          return prevReservas.map(reserva => 
            reserva.reserva_id === id 
              ? { ...reserva, estado_codigo: status, estado_nombre: getStatusName(status) }
              : reserva
          );
        });
        return { success: true, message: result.message };
      } else {
        setError(result.error || 'Error al actualizar estado');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error in updateReservaStatus:', err);
      setError(err.message || 'Error de conexión al actualizar estado');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [updateReservaStatusUseCase]);

  // Helper function to get status name
  const getStatusName = (status) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'asignado':
        return 'Asignado';
      case 'confirmado':
        return 'Confirmado';
      case 'cancelado':
        return 'Cancelado';
      case 'completado':
        return 'Completado';
      default:
        return status;
    }
  };

  // Apply filters
  const applyFilters = useCallback((newFilters) => {
    fetchReservas(newFilters);
  }, [fetchReservas]);

  // Clear filters
  const clearFilters = useCallback(() => {
    fetchReservas({});
  }, [fetchReservas]);

  // Initial load
  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  return {
    reservas: Array.isArray(reservas) ? reservas : [], // Always ensure array
    loading,
    error,
    total,
    filters,
    fetchReservas,
    createReserva,
    cancelReserva,
    updateReservaStatus,
    applyFilters,
    clearFilters
  };
}; 