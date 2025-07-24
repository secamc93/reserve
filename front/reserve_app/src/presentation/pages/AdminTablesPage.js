import React, { useState, useEffect } from 'react';
import { useTables } from '../hooks/useTables.js';
import { useBusinesses } from '../hooks/useBusinesses.js';
import TableModal from '../components/TableModal.js';
import './AdminTablesPage.css';

const AdminTablesPage = () => {
    const {
        tables,
        loading,
        error,
        selectedTable,
        fetchTables,
        createTable,
        updateTable,
        deleteTable,
        selectTable,
        clearSelection,
        clearError
    } = useTables();

    const { businesses } = useBusinesses();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBusiness, setFilterBusiness] = useState('all');

    const handleCreateTable = async (tableData) => {
        try {
            await createTable(tableData);
            setIsModalOpen(false);
            clearSelection();
        } catch (error) {
            console.error('Error creando mesa:', error);
        }
    };

    const handleUpdateTable = async (tableData) => {
        try {
            await updateTable(selectedTable.id, tableData);
            setIsModalOpen(false);
            clearSelection();
            setIsEditing(false);
        } catch (error) {
            console.error('Error actualizando mesa:', error);
        }
    };

    const handleDeleteTable = async (table) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la mesa ${table.number} del negocio "${table.getBusinessName()}"?`)) {
            try {
                await deleteTable(table.id);
            } catch (error) {
                console.error('Error eliminando mesa:', error);
            }
        }
    };

    const handleEditTable = (table) => {
        selectTable(table);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        clearSelection();
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        clearSelection();
        setIsEditing(false);
    };

    // Filtrar mesas
    const filteredTables = tables.filter(table => {
        const matchesSearch = table.number.toString().includes(searchTerm) ||
                             table.getBusinessName().toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesBusiness = filterBusiness === 'all' || 
                               table.businessId.toString() === filterBusiness;
        
        return matchesSearch && matchesBusiness;
    });

    const getStatusBadge = (isActive) => (
        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Activa' : 'Inactiva'}
        </span>
    );

    const getCapacityBadge = (capacity) => {
        let color = '#10b981'; // Verde para capacidad normal
        if (capacity > 8) color = '#f59e0b'; // Amarillo para capacidad alta
        if (capacity > 12) color = '#ef4444'; // Rojo para capacidad muy alta
        
        return (
            <span className="capacity-badge" style={{ backgroundColor: color }}>
                {capacity} {capacity === 1 ? 'persona' : 'personas'}
            </span>
        );
    };

    if (loading && tables.length === 0) {
        return (
            <div className="admin-tables-page">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Cargando mesas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-tables-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>🪑 Administrar Mesas</h1>
                        <p>Gestiona todas las mesas registradas en el sistema</p>
                    </div>
                    <div className="header-actions">
                        <button 
                            className="btn-primary" 
                            onClick={handleCreateNew}
                            disabled={loading}
                        >
                            ✨ Crear Mesa
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <span>{error}</span>
                </div>
            )}

            <div className="filters-section">
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Buscar mesas</label>
                        <input
                            type="text"
                            placeholder="Buscar por número de mesa o negocio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label>Filtrar por negocio</label>
                        <select 
                            value={filterBusiness} 
                            onChange={(e) => setFilterBusiness(e.target.value)}
                        >
                            <option value="all">Todos los negocios</option>
                            {businesses.map(business => (
                                <option key={business.id} value={business.id.toString()}>
                                    {business.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="tables-table-container">
                {filteredTables.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            {searchTerm || filterBusiness !== 'all' 
                                ? 'No se encontraron mesas con los filtros aplicados'
                                : 'Aún no hay mesas registradas en el sistema'
                            }
                        </p>
                        {!searchTerm && filterBusiness === 'all' && (
                            <button className="btn-primary" onClick={handleCreateNew}>
                                Crear la primera mesa
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="tables-table">
                        <thead>
                            <tr>
                                <th>Mesa</th>
                                <th>Negocio</th>
                                <th>Capacidad</th>
                                <th>Estado</th>
                                <th>Creada</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTables.map(table => (
                                <tr key={table.id}>
                                    <td>
                                        <strong>Mesa {table.number}</strong>
                                    </td>
                                    <td>
                                        <span className="business-badge">
                                            {(() => {
                                                const business = businesses.find(b => b.id === table.businessId);
                                                return business ? business.name : `Negocio ID: ${table.businessId}`;
                                            })()}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{table.capacity} {table.capacity === 1 ? 'persona' : 'personas'}</strong>
                                    </td>
                                    <td>
                                        {getStatusBadge(table.isActive)}
                                    </td>
                                    <td>
                                        {table.createdAt ? table.createdAt.toLocaleDateString() : '-'}
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEditTable(table)}
                                                disabled={loading}
                                                title="Editar mesa"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDeleteTable(table)}
                                                disabled={loading}
                                                title="Eliminar mesa"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <TableModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={isEditing ? handleUpdateTable : handleCreateTable}
                table={selectedTable}
                businesses={businesses}
                loading={loading}
            />
        </div>
    );
};

export default AdminTablesPage; 