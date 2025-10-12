'use client';

import { useState, useEffect } from 'react';
import { Table, Badge, Spinner } from '@shared/ui';
import { getPropertyUnitsAction, deletePropertyUnitAction } from '../../infrastructure/actions';
import { PropertyUnit, UNIT_TYPE_LABELS } from '../../domain';
import { TokenStorage } from '@/modules/auth/infrastructure/storage';
import { CreatePropertyUnitModal } from './create-property-unit-modal';
import { EditPropertyUnitModal } from './edit-property-unit-modal';

export function PropertyUnitsTable({ hpId }: { hpId: number }) {
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No token found');

      const data = await getPropertyUnitsAction({
        hpId,
        token,
        page: currentPage,
        pageSize: 10,
      });

      setUnits(data.units);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, [currentPage]);

  const handleDelete = async (unitId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta unidad?')) return;

    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No token found');

      await deletePropertyUnitAction({ hpId, unitId, token });
      await loadUnits();
    } catch (error) {
      console.error('Error al eliminar unidad:', error);
      alert('Error al eliminar la unidad');
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
        <button onClick={() => handleDelete(unit.id)} className="btn btn-sm btn-error">
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
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          ➕ Agregar Unidad
        </button>
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
        <CreatePropertyUnitModal
          hpId={hpId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadUnits();
          }}
        />
      )}

      {showEditModal && selectedUnit && (
        <EditPropertyUnitModal
          hpId={hpId}
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
    </div>
  );
}
