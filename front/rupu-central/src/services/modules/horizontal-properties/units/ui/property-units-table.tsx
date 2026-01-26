'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, ConfirmModal } from '@shared/ui';
import { getPropertyUnitsAction, deletePropertyUnitAction } from '../infrastructure/actions';
import { PropertyUnit } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { CreatePropertyUnitModal } from './create-property-unit-modal';
import { EditPropertyUnitModal } from './edit-property-unit-modal';
import { ImportUnitsModal } from './import-units-modal';
import { PropertyUnitsDataTable, PropertyUnitFilter, FilterOption } from './property-units-data-table';

export function PropertyUnitsTable({ businessId }: { businessId: number }) {
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
  const isFirstLoadRef = useRef(true);

  // Estados para alertas y confirmación
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<number | null>(null);

  // Filtros usando el mismo sistema que users
  const [filters, setFilters] = useState<{
    number?: string;
    unitType?: string;
    floor?: number;
    block?: string;
    isActive?: boolean;
  }>({});

  const getBusinessToken = useCallback(async (): Promise<string> => {
    let businessToken = TokenStorage.getBusinessToken();
    if (businessToken) return businessToken;

    const sessionToken = TokenStorage.getSessionToken();
    if (!sessionToken) throw new Error('No session token available');

    const user = TokenStorage.getUser();
    const isSuperAdmin = user?.is_super_admin;
    const business_id = isSuperAdmin ? 0 : businessId;

    const result = await generateBusinessTokenAction({
      business_id,
      session_token: sessionToken,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'No se pudo generar business token');
    }

    TokenStorage.setBusinessToken(result.data.token);
    TokenStorage.setActiveBusiness(business_id);
    return result.data.token;
  }, [businessId]);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getBusinessToken();

      const data = await getPropertyUnitsAction({
        businessId,
        token,
        page: currentPage,
        pageSize: pageSize,
        ...filters,
      });

      setUnits(data.units);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      setAlert({ type: 'error', message: 'Error al cargar las unidades' });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [businessId, currentPage, pageSize, filters, getBusinessToken]);

  useEffect(() => {
    loadUnits();
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
    }
  }, [loadUnits]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleDeleteClick = (unitId: number) => {
    setUnitToDelete(unitId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;

    try {
      const token = await getBusinessToken();
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

  // Definir filtros disponibles (debe ir antes de la conversión de filtros)
  const availableFilters: FilterOption[] = [
    {
      key: 'number',
      label: 'Número',
      type: 'text',
      placeholder: 'Buscar por número (ej: 101, A-201)',
    },
    {
      key: 'unitType',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: 'apartment', label: 'Apartamento' },
        { value: 'house', label: 'Casa' },
        { value: 'office', label: 'Oficina' },
        { value: 'commercial', label: 'Local comercial' },
        { value: 'parking', label: 'Parqueadero' },
        { value: 'storage', label: 'Depósito' },
        { value: 'penthouse', label: 'Penthouse' },
      ],
    },
    {
      key: 'floor',
      label: 'Piso',
      type: 'text',
      placeholder: 'Buscar por piso',
    },
    {
      key: 'block',
      label: 'Bloque',
      type: 'text',
      placeholder: 'Buscar por bloque (A, B, 1, 2...)',
    },
    {
      key: 'isActive',
      label: 'Estado',
      type: 'boolean',
    },
  ];

  // Convertir filtros al formato del DataTable
  const dataTableFilters: PropertyUnitFilter[] = [];
  let filterIndex = 0;

  if (filters.number) {
    dataTableFilters.push({
      id: `filter-${filterIndex++}`,
      key: 'number',
      label: `Número: ${filters.number}`,
      value: filters.number,
      color: 'blue',
    });
  }
  if (filters.unitType) {
    const typeLabel = availableFilters
      .find(f => f.key === 'unitType')
      ?.options?.find(opt => opt.value === filters.unitType)?.label || filters.unitType;
    dataTableFilters.push({
      id: `filter-${filterIndex++}`,
      key: 'unitType',
      label: `Tipo: ${typeLabel}`,
      value: filters.unitType,
      color: 'green',
    });
  }
  if (filters.floor !== undefined) {
    dataTableFilters.push({
      id: `filter-${filterIndex++}`,
      key: 'floor',
      label: `Piso: ${filters.floor}`,
      value: filters.floor.toString(),
      color: 'orange',
    });
  }
  if (filters.block) {
    dataTableFilters.push({
      id: `filter-${filterIndex++}`,
      key: 'block',
      label: `Bloque: ${filters.block}`,
      value: filters.block,
      color: 'blue',
    });
  }
  if (filters.isActive !== undefined) {
    dataTableFilters.push({
      id: `filter-${filterIndex++}`,
      key: 'isActive',
      label: `Estado: ${filters.isActive ? 'Activa' : 'Inactiva'}`,
      value: filters.isActive.toString(),
      color: filters.isActive ? 'green' : 'orange',
    });
  }

  // Manejar agregar filtro
  const handleAddFilter = (filterKey: string, value: any) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'isActive') {
      newFilters.isActive = value === true;
    } else if (filterKey === 'floor') {
      newFilters.floor = value ? Number(value) : undefined;
    } else {
      (newFilters as any)[filterKey] = value;
    }
    
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Manejar remover filtro
  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    delete (newFilters as any)[filterKey];
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Handler para limpiar todos los filtros
  const handleClearAllFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </div>
      )}

      {/* Tabla de unidades con diseño de Pencil */}
      <PropertyUnitsDataTable
        data={units}
        filters={dataTableFilters}
        availableFilters={availableFilters}
        onAdd={() => setShowCreateModal(true)}
        onImport={() => setShowImportModal(true)}
        onEdit={handleEdit}
        onDelete={(unit) => handleDeleteClick(unit.id)}
        onFilterRemove={handleRemoveFilter}
        onClearAllFilters={handleClearAllFilters}
        onAddFilter={handleAddFilter}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        loading={loading}
      />

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
