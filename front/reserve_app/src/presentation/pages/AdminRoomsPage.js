import React, { useState, useEffect } from 'react';
import { useRooms } from '../hooks/useRooms.js';
import { useBusinesses } from '../hooks/useBusinesses.js';
import { useAuth } from '../hooks/useAuth.js';
import RoomModal from '../components/Room/RoomModal.js';
import './AdminRoomsPage.css';

const AdminRoomsPage = () => {
    const { rooms, loading, error, selectedRoom, fetchRooms, createRoom, updateRoom, deleteRoom, selectRoom, clearSelection, clearError } = useRooms();
    const { businesses } = useBusinesses();
    const { isSuperAdmin, hasPermission } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        businessId: '',
        isActive: ''
    });

    // Verificar permisos
    const hasAccess = isSuperAdmin() || hasPermission('rooms:manage');

    useEffect(() => {
        if (hasAccess) {
            fetchRooms();
        }
    }, [hasAccess, fetchRooms]);

    // Proteger ruta
    if (!hasAccess) {
        return (
            <div className="admin-rooms-page">
                <div className="access-denied">
                    <h2>🚫 Acceso Denegado</h2>
                    <p>No tienes permisos para acceder a esta sección.</p>
                    <p>Se requiere rol de administrador o permisos de gestión de salas.</p>
                </div>
            </div>
        );
    }

    const handleCreateRoom = async (roomData) => {
        try {
            await createRoom(roomData);
            setIsModalOpen(false);
            clearSelection();
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    const handleUpdateRoom = async (roomData) => {
        try {
            await updateRoom(selectedRoom.id, roomData);
            setIsModalOpen(false);
            clearSelection();
        } catch (error) {
            console.error('Error updating room:', error);
        }
    };

    const handleDeleteRoom = async (id, name) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la sala "${name}"?`)) {
            try {
                await deleteRoom(id);
            } catch (error) {
                console.error('Error deleting room:', error);
            }
        }
    };

    const handleEditRoom = (room) => {
        selectRoom(room);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        clearSelection();
    };

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        // Aquí podrías implementar la lógica de filtrado
    };

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            room.code.toLowerCase().includes(filters.search.toLowerCase());
        const matchesBusiness = !filters.businessId || room.businessId === parseInt(filters.businessId);
        const matchesStatus = filters.isActive === '' || room.isActive === (filters.isActive === 'true');

        return matchesSearch && matchesBusiness && matchesStatus;
    });

    if (loading && rooms.length === 0) {
        return (
            <div className="admin-rooms-page">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Cargando salas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-rooms-page">
            <header className="page-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>🏠 Administración de Salas</h1>
                        <p>Gestiona las salas de los negocios</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="btn-primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            ➕ Nueva Sala
                        </button>
                    </div>
                </div>
            </header>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {/* Filtros */}
            <div className="filters-section">
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Buscar:</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Buscar por nombre o código..."
                        />
                    </div>
                    <div className="filter-group">
                        <label>Negocio:</label>
                        <select
                            value={filters.businessId}
                            onChange={(e) => handleFilterChange('businessId', e.target.value)}
                        >
                            <option value="">Todos los negocios</option>
                            {businesses.map(business => (
                                <option key={business.id} value={business.id}>
                                    {business.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Estado:</label>
                        <select
                            value={filters.isActive}
                            onChange={(e) => handleFilterChange('isActive', e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="true">Activas</option>
                            <option value="false">Inactivas</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla de salas */}
            <div className="rooms-table-container">
                <table className="rooms-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Código</th>
                            <th>Negocio</th>
                            <th>Capacidad</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRooms.map(room => (
                            <tr key={room.id}>
                                <td>{room.id}</td>
                                <td>{room.name}</td>
                                <td>
                                    <span className="business-badge">
                                        {room.code}
                                    </span>
                                </td>
                                <td>{room.getBusinessName()}</td>
                                <td>{room.getCapacityText()}</td>
                                <td>{room.description || '-'}</td>
                                <td>
                                    <span
                                        className={`status-badge ${room.isActive ? 'active' : 'inactive'}`}
                                    >
                                        {room.getStatusText()}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions">
                                        <button
                                            className="btn-edit"
                                            title="Editar"
                                            onClick={() => handleEditRoom(room)}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-delete"
                                            title="Eliminar"
                                            onClick={() => handleDeleteRoom(room.id, room.name)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredRooms.length === 0 && !loading && (
                    <div className="empty-state">
                        <p>No se encontraron salas con los filtros aplicados</p>
                    </div>
                )}
            </div>

            <RoomModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={isEditing ? handleUpdateRoom : handleCreateRoom}
                room={selectedRoom}
                businesses={businesses}
                loading={loading}
            />
        </div>
    );
};

export default AdminRoomsPage; 