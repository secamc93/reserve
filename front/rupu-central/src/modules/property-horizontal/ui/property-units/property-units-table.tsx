'use client';

import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Alert, ConfirmModal } from '@shared/ui';
import { getPropertyUnitsAction, deletePropertyUnitAction } from '../../infrastructure/actions';
import { PropertyUnit, UNIT_TYPE_LABELS } from '../../domain';
import { TokenStorage } from '@/modules/auth/infrastructure/storage';
import { CreatePropertyUnitModal } from './create-property-unit-modal';
import { EditPropertyUnitModal } from './edit-property-unit-modal';
import { ImportUnitsModal } from './import-units-modal';

export function PropertyUnitsTable({ businessId }: { businessId: number }) {
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
  
  // Estados para alertas y confirmación
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<number | null>(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    number: undefined as string | undefined,
    unitType: undefined as string | undefined,
    floor: undefined as number | undefined,
    block: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
  });
  const [filterInputs, setFilterInputs] = useState({
    number: '',
    unitType: '',
    floor: '',
    block: '',
    isActive: '',
  });

  const loadUnits = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No token found');

      const data = await getPropertyUnitsAction({
        businessId,
        token,
        page: currentPage,
        pageSize: 10,
        ...filters, // Aplicar filtros activos
      });

      setUnits(data.units);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      setAlert({ type: 'error', message: 'Error al cargar las unidades' });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, [currentPage, filters]);

  const handleApplyFilters = () => {
    setFilters({
      number: filterInputs.number.trim() || undefined,
      unitType: filterInputs.unitType || undefined,
      floor: filterInputs.floor ? Number(filterInputs.floor) : undefined,
      block: filterInputs.block.trim() || undefined,
      isActive: filterInputs.isActive ? filterInputs.isActive === 'true' : undefined,
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterInputs({
      number: '',
      unitType: '',
      floor: '',
      block: '',
      isActive: '',
    });
    setFilters({
      number: undefined,
      unitType: undefined,
      floor: undefined,
      block: undefined,
      isActive: undefined,
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(f => f !== undefined);

  const handleDeleteClick = (unitId: number) => {
    setUnitToDelete(unitId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;

    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No token found');

      await deletePropertyUnitAction({ businessId, unitId: unitToDelete, token });
      await loadUnits();
      
      setAlert({ type: 'success', message: 'Unidad eliminada correctamente' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error al eliminar unidad:', error);
      setAlert({ type: 'error', message: 'Error al eliminar la unidad' });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setShowDeleteConfirm(false);
      setUnitToDelete(null);
    }
  };

  const handleEdit = (unit: PropertyUnit) => {
    setSelectedUnit(unit);
    setShowEditModal(true);
  };

  const columns = [
    { key: 'number', label: 'Número' },
    { key: 'unitType', label: 'Tipo' },
    { key: 'floor', label: 'Piso' },
    { key: 'block', label: 'Bloque' },
    { key: 'area', label: 'Área (m²)' },
    { key: 'bedrooms', label: 'Habitaciones' },
    { key: 'coefficient', label: 'Coeficiente' },
    { key: 'isActive', label: 'Estado' },
    { key: 'actions', label: 'Acciones' },
  ];

  const data = units.map(unit => ({
    number: unit.number,
    unitType: UNIT_TYPE_LABELS[unit.unitType] || unit.unitType,
    floor: unit.floor || '-',
    block: unit.block || '-',
    area: unit.area ? `${unit.area} m²` : '-',
    bedrooms: unit.bedrooms || '-',
    coefficient: unit.coefficient ? unit.coefficient.toFixed(6) : '-',
    isActive: (
      <Badge type={unit.isActive ? 'success' : 'error'}>
        {unit.isActive ? 'Activa' : 'Inactiva'}
      </Badge>
    ),
    actions: (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(unit)} className="btn btn-sm btn-outline">
          ✏️ Editar
        </button>
        <button onClick={() => handleDeleteClick(unit.id)} className="btn btn-sm btn-error">
          🗑️
        </button>
      </div>
    ),
  }));

  if (loading) {
    return <div className="flex justify-center p-8"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Unidades de Propiedad</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowImportModal(true)} 
            className="btn btn-secondary"
          >
            📊 Importar Excel
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            ➕ Agregar Unidad
          </button>
        </div>
      </div>

      {/* Alertas */}
      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Filtros de Búsqueda</h3>
        <div className="grid grid-cols-5 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Número</label>
            <input
              type="text"
              placeholder="Ej: 101, A-201..."
              value={filterInputs.number}
              onChange={(e) => setFilterInputs({ ...filterInputs, number: e.target.value })}
              className="input input-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select
              value={filterInputs.unitType}
              onChange={(e) => setFilterInputs({ ...filterInputs, unitType: e.target.value })}
              className="input input-sm w-full"
            >
              <option value="">Todos</option>
              <option value="apartment">Apartamento</option>
              <option value="house">Casa</option>
              <option value="office">Oficina</option>
              <option value="commercial">Local comercial</option>
              <option value="parking">Parqueadero</option>
              <option value="storage">Depósito</option>
              <option value="penthouse">Penthouse</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Piso</label>
            <input
              type="number"
              placeholder="Número"
              value={filterInputs.floor}
              onChange={(e) => setFilterInputs({ ...filterInputs, floor: e.target.value })}
              className="input input-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bloque</label>
            <input
              type="text"
              placeholder="A, B, 1, 2..."
              value={filterInputs.block}
              onChange={(e) => setFilterInputs({ ...filterInputs, block: e.target.value })}
              className="input input-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select
              value={filterInputs.isActive}
              onChange={(e) => setFilterInputs({ ...filterInputs, isActive: e.target.value })}
              className="input input-sm w-full"
            >
              <option value="">Todos</option>
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="btn btn-primary btn-sm"
          >
            🔍 Aplicar Filtros
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="btn btn-secondary btn-sm"
            >
              ✖️ Limpiar Filtros
            </button>
          )}
          {hasActiveFilters && (
            <span className="text-xs text-gray-600 flex items-center ml-2">
              ℹ️ Filtros activos
            </span>
          )}
        </div>
      </div>

      <Table columns={columns} data={data} />

      {totalPages > 1 && (
        <div className="pagination-alt">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            ← Anterior
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Siguiente →
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreatePropertyUnitModal
          businessId={businessId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadUnits();
          }}
        />
      )}

      {showEditModal && selectedUnit && (
        <EditPropertyUnitModal
          businessId={businessId}
          unit={selectedUnit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUnit(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUnit(null);
            loadUnits();
          }}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUnitToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar esta unidad? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de importación */}
      <ImportUnitsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={loadUnits}
        businessId={businessId}
      />
    </div>
  );
}
