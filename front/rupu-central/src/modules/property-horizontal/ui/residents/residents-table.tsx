'use client';

import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Alert, ConfirmModal } from '@shared/ui';
import { getResidentsAction, deleteResidentAction } from '../../infrastructure/actions';
import { Resident } from '../../domain';
import { TokenStorage } from '@/modules/auth/infrastructure/storage';
import { CreateResidentModal } from './create-resident-modal';
import { EditResidentModal } from './edit-resident-modal';

export function ResidentsTable({ hpId }: { hpId: number }) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  
  // Estados para alertas y confirmación
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<number | null>(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    propertyUnitId: undefined as number | undefined,
    residentTypeId: undefined as number | undefined,
    isActive: undefined as boolean | undefined,
    isMainResident: undefined as boolean | undefined,
  });
  const [filterInputs, setFilterInputs] = useState({
    propertyUnitId: '',
    residentTypeId: '',
    isActive: '',
    isMainResident: '',
  });
  const [units, setUnits] = useState<Array<{ id: number; number: string }>>([]);

  // Cargar unidades para el filtro
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const token = TokenStorage.getToken();
        if (!token) return;
        const { getPropertyUnitsAction } = await import('../../infrastructure/actions');
        const data = await getPropertyUnitsAction({ hpId, token, page: 1, pageSize: 100 });
        setUnits(data.units.map(u => ({ id: u.id, number: u.number })));
      } catch (error) {
        console.error('Error loading units:', error);
      }
    };
    loadUnits();
  }, [hpId]);

  const loadResidents = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No token found');

      const data = await getResidentsAction({
        hpId,
        token,
        page: currentPage,
        pageSize: 10,
        ...filters, // Aplicar filtros activos
      });

      setResidents(data.residents);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error al cargar residentes:', error);
      setAlert({ type: 'error', message: 'Error al cargar los residentes' });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, [currentPage, filters]);

  const handleApplyFilters = () => {
    setFilters({
      propertyUnitId: filterInputs.propertyUnitId ? Number(filterInputs.propertyUnitId) : undefined,
      residentTypeId: filterInputs.residentTypeId ? Number(filterInputs.residentTypeId) : undefined,
      isActive: filterInputs.isActive ? filterInputs.isActive === 'true' : undefined,
      isMainResident: filterInputs.isMainResident ? filterInputs.isMainResident === 'true' : undefined,
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterInputs({
      propertyUnitId: '',
      residentTypeId: '',
      isActive: '',
      isMainResident: '',
    });
    setFilters({
      propertyUnitId: undefined,
      residentTypeId: undefined,
      isActive: undefined,
      isMainResident: undefined,
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(f => f !== undefined);

  const handleDeleteClick = (residentId: number) => {
    setResidentToDelete(residentId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!residentToDelete) return;

    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No token found');

      await deleteResidentAction({ hpId, residentId: residentToDelete, token });
      await loadResidents();
      
      setAlert({ type: 'success', message: 'Residente eliminado correctamente' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error al eliminar residente:', error);
      setAlert({ type: 'error', message: 'Error al eliminar el residente' });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setShowDeleteConfirm(false);
      setResidentToDelete(null);
    }
  };

  const handleEdit = (resident: Resident) => {
    setSelectedResident(resident);
    setShowEditModal(true);
  };

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'unit', label: 'Unidad' },
    { key: 'type', label: 'Tipo' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'isMain', label: 'Principal' },
    { key: 'isActive', label: 'Estado' },
    { key: 'actions', label: 'Acciones' },
  ];

  const data = residents.map(resident => ({
    name: resident.name,
    unit: resident.propertyUnitNumber,
    type: resident.residentTypeName,
    email: resident.email,
    phone: resident.phone || '-',
    isMain: (
      <Badge type={resident.isMainResident ? 'success' : 'primary'}>
        {resident.isMainResident ? 'Sí' : 'No'}
      </Badge>
    ),
    isActive: (
      <Badge type={resident.isActive ? 'success' : 'error'}>
        {resident.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
    actions: (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(resident)} className="btn btn-sm btn-outline">
          ✏️ Editar
        </button>
        <button onClick={() => handleDeleteClick(resident.id)} className="btn btn-sm btn-error">
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
        <h2 className="text-2xl font-bold">Residentes</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          ➕ Agregar Residente
        </button>
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
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidad</label>
            <select
              value={filterInputs.propertyUnitId}
              onChange={(e) => setFilterInputs({ ...filterInputs, propertyUnitId: e.target.value })}
              className="input input-sm w-full"
            >
              <option value="">Todas</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select
              value={filterInputs.residentTypeId}
              onChange={(e) => setFilterInputs({ ...filterInputs, residentTypeId: e.target.value })}
              className="input input-sm w-full"
            >
              <option value="">Todos</option>
              <option value="1">Propietario</option>
              <option value="2">Arrendatario</option>
              <option value="3">Familiar</option>
              <option value="4">Invitado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select
              value={filterInputs.isActive}
              onChange={(e) => setFilterInputs({ ...filterInputs, isActive: e.target.value })}
              className="input input-sm w-full"
            >
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Principal</label>
            <select
              value={filterInputs.isMainResident}
              onChange={(e) => setFilterInputs({ ...filterInputs, isMainResident: e.target.value })}
              className="input input-sm w-full"
            >
              <option value="">Todos</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
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
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-sm"
          >
            Anterior
          </button>
          <span className="py-2 px-4">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-sm"
          >
            Siguiente
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateResidentModal
          hpId={hpId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadResidents();
          }}
        />
      )}

      {showEditModal && selectedResident && (
        <EditResidentModal
          hpId={hpId}
          resident={selectedResident}
          onClose={() => {
            setShowEditModal(false);
            setSelectedResident(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedResident(null);
            loadResidents();
          }}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setResidentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este residente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
