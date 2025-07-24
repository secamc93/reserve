import { useState, useEffect, useCallback } from 'react';
import { GetRoomsUseCase } from '../../application/use-cases/GetRoomsUseCase.js';
import { GetRoomsByBusinessUseCase } from '../../application/use-cases/GetRoomsByBusinessUseCase.js';
import { CreateRoomUseCase } from '../../application/use-cases/CreateRoomUseCase.js';
import { UpdateRoomUseCase } from '../../application/use-cases/UpdateRoomUseCase.js';
import { DeleteRoomUseCase } from '../../application/use-cases/DeleteRoomUseCase.js';
import { ApiRoomRepository } from '../../infrastructure/adapters/ApiRoomRepository.js';

export const useRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Inicializar repositorio y use cases
    const roomRepository = new ApiRoomRepository();
    const getRoomsUseCase = new GetRoomsUseCase(roomRepository);
    const getRoomsByBusinessUseCase = new GetRoomsByBusinessUseCase(roomRepository);
    const createRoomUseCase = new CreateRoomUseCase(roomRepository);
    const updateRoomUseCase = new UpdateRoomUseCase(roomRepository);
    const deleteRoomUseCase = new DeleteRoomUseCase(roomRepository);

    // Obtener todas las salas
    const fetchRooms = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useRooms: Obteniendo salas con parámetros:', params);
            const result = await getRoomsUseCase.execute(params);
            
            console.log('useRooms: Resultado del use case:', result);
            setRooms(result.data);
            console.log('useRooms: Salas obtenidas:', result.data.length);
        } catch (err) {
            console.error('useRooms: Error obteniendo salas:', err);
            setError(err.message || 'Error obteniendo salas');
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener salas por negocio
    const fetchRoomsByBusiness = useCallback(async (businessId) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useRooms: Obteniendo salas del negocio:', businessId);
            const result = await getRoomsByBusinessUseCase.execute(businessId);
            
            setRooms(result.data);
            console.log('useRooms: Salas del negocio obtenidas:', result.data.length);
        } catch (err) {
            console.error('useRooms: Error obteniendo salas del negocio:', err);
            setError(err.message || 'Error obteniendo salas del negocio');
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear nueva sala
    const createRoom = useCallback(async (roomData) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useRooms: Creando sala:', roomData);
            const result = await createRoomUseCase.execute(roomData);
            
            // Agregar la nueva sala a la lista
            setRooms(prev => [...prev, result.data]);
            
            console.log('useRooms: Sala creada exitosamente:', result.data.id);
            return result;
        } catch (err) {
            console.error('useRooms: Error creando sala:', err);
            setError(err.message || 'Error creando sala');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar sala existente
    const updateRoom = useCallback(async (id, roomData) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useRooms: Actualizando sala ID:', id, 'Datos:', roomData);
            const result = await updateRoomUseCase.execute(id, roomData);
            
            // Actualizar la sala en la lista
            setRooms(prev => 
                prev.map(room => 
                    room.id === id ? result.data : room
                )
            );
            
            console.log('useRooms: Sala actualizada exitosamente:', result.data.id);
            return result;
        } catch (err) {
            console.error('useRooms: Error actualizando sala:', err);
            setError(err.message || 'Error actualizando sala');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar sala
    const deleteRoom = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useRooms: Eliminando sala ID:', id);
            const result = await deleteRoomUseCase.execute(id);
            
            // Remover la sala de la lista
            setRooms(prev => prev.filter(room => room.id !== id));
            
            console.log('useRooms: Sala eliminada exitosamente:', id);
            return result;
        } catch (err) {
            console.error('useRooms: Error eliminando sala:', err);
            setError(err.message || 'Error eliminando sala');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Seleccionar sala
    const selectRoom = useCallback((room) => {
        setSelectedRoom(room);
    }, []);

    // Limpiar selección
    const clearSelection = useCallback(() => {
        setSelectedRoom(null);
    }, []);

    // Limpiar error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Cargar salas al montar el componente
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    return {
        // Estado
        rooms,
        loading,
        error,
        selectedRoom,
        
        // Acciones
        fetchRooms,
        fetchRoomsByBusiness,
        createRoom,
        updateRoom,
        deleteRoom,
        selectRoom,
        clearSelection,
        clearError
    };
}; 