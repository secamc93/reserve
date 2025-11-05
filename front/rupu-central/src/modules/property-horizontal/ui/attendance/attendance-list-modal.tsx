/**
 * Modal: Attendance List Management
 */

'use client';

import { useState, useEffect, useRef } from 'react';
// Using CSS classes for buttons instead of Button component
import { markAttendanceSimpleAction, unmarkAttendanceSimpleAction } from '../../infrastructure/actions/attendance';
import { getAttendanceListRecordsAction, getAttendanceListSummaryAction, createProxyAction, updateProxyAction, deleteProxyAction } from '../../infrastructure/actions/attendance';
import { envPublic } from '@shared/config';
import { getPropertyUnitsAction } from '../../infrastructure/actions/property-units';
import { AttendanceList } from '../../domain/entities/attendance';

interface AttendanceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceList: AttendanceList;
  token: string;
  businessId: number;
}

interface PropertyUnit {
  id: number;
  unitNumber: string;
  residentName: string | null;
  hasAttended: boolean;
  attendedAsOwner: boolean;
  attendedAsProxy: boolean;
  attendanceRecordId?: number;
  businessId?: number;
  ownerName?: string | null;
  proxyName?: string | null;
}

export function AttendanceListModal({
  isOpen,
  onClose,
  attendanceList,
  token,
  businessId,
}: AttendanceListModalProps) {
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [attendedFilter, setAttendedFilter] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);
  const [summary, setSummary] = useState<{ 
    total_units: number; 
    attended_units: number; 
    attendance_rate: number; 
    absence_rate: number;
    attended_as_owner: number;
    attended_as_proxy: number;
  } | null>(null);
  const [editingProxyUnitId, setEditingProxyUnitId] = useState<number | null>(null);
  const [proxyInput, setProxyInput] = useState<string>('');
  const [proxyIdsByUnit, setProxyIdsByUnit] = useState<Map<number, number>>(new Map());
  const proxyInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingProxyUnitId !== null) {
      // Foco al input cuando se entra en modo edición
      setTimeout(() => proxyInputRef.current?.focus(), 0);
    }
  }, [editingProxyUnitId]);

  const handleExportExcel = async () => {
    try {
      const url = `${envPublic.API_BASE_URL}/attendance/lists/${attendanceList.id}/export-excel`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Error exportando: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const link = document.createElement('a');
      const objectUrl = window.URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `lista-asistencia-${attendanceList.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error('Error exportando Excel de asistencia:', e);
      setError('No se pudo descargar el Excel de asistencia');
    }
  };

  const handleExportDetailedExcel = async () => {
    try {
      const url = `${envPublic.API_BASE_URL}/attendance/lists/${attendanceList.id}/export-detailed-excel`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Error exportando resumen detallado: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const link = document.createElement('a');
      const objectUrl = window.URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `resumen-asistencia-${attendanceList.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error('Error exportando Excel detallado:', e);
      setError('No se pudo descargar el Excel detallado');
    }
  };

  // Cargar unidades reales desde el backend para usar IDs válidos
  useEffect(() => {
    const loadData = async (searchText = '') => {
      setLoading(true);
      setError(null);
      try {
        const [unitsRes, recordsRes, summaryRes] = await Promise.all([
          getPropertyUnitsAction({
          businessId: businessId,
          page: 1,
          pageSize: 1000,
            token,
            number: searchText || undefined,
          }),
          getAttendanceListRecordsAction({ token, id: attendanceList.id, page, pageSize, unitNumber: searchText || undefined, attended: attendedFilter === 'all' ? undefined : attendedFilter === 'true' }),
          getAttendanceListSummaryAction({ token, id: attendanceList.id }),
        ]);

        // Los registros ya vienen paginados del backend
        const records = (recordsRes.success && recordsRes.data) ? recordsRes.data : [];
        
        // Usar los datos de paginación del response
        if (recordsRes.success) {
          // Actualizar estado de paginación
          if (recordsRes.total !== undefined && recordsRes.total !== null) {
            setTotal(recordsRes.total);
          }
        }
        
        // Mapear proxy_ids para edición
        for (const r of records) {
          const record = r as unknown as Record<string, unknown>;
          const unitId = record?.propertyUnitId ?? record?.property_unit_id;
          if (typeof unitId === 'number' && (record?.proxyId || record?.proxy_id)) {
            proxyIdsByUnit.set(unitId, Number(record?.proxyId ?? record?.proxy_id));
          }
        }

        if (summaryRes.success && summaryRes.data) {
          const summaryData = summaryRes.data as unknown as Record<string, unknown>;
          setSummary({
            total_units: Number(summaryData.total_units) || 0,
            attended_units: Number(summaryData.attended_units) || 0,
            attendance_rate: Number(summaryData.attendance_rate_by_coef) || 0, // Por coeficiente
            absence_rate: Number(summaryData.absence_rate_by_coef) || 0, // Por coeficiente
            attended_as_owner: Number(summaryData.attended_as_owner) || 0,
            attended_as_proxy: Number(summaryData.attended_as_proxy) || 0,
          });
        } else {
          setSummary(null);
        }

        // Solo mapear las unidades que vienen en los registros paginados
        const mapped = records.map((r) => {
          const record = r as unknown as Record<string, unknown>;
          const unitId = record?.property_unit_id;
          const unit = unitsRes.units.find(u => u.id === unitId);
          if (!unit) return null;
          
          return {
            id: unit.id,
            unitNumber: record?.unit_number || unit.number || `${unit.block || ''} ${unit.floor || ''} ${unit.number || ''}`.trim(),
            residentName: record?.resident_name ?? null,
            hasAttended: Boolean(record?.attended_as_owner) || Boolean(record?.attended_as_proxy),
            attendedAsOwner: Boolean(record?.attended_as_owner),
            attendedAsProxy: Boolean(record?.attended_as_proxy),
            businessId: unit.businessId,
            ownerName: record?.resident_name ?? null,
            proxyName: record?.proxy_name ?? null,
            attendanceRecordId: record?.id, // Agregar el ID del registro para los nuevos endpoints
          };
        }).filter(Boolean) as PropertyUnit[];

        setUnits(mapped);
      } catch (err) {
        console.error('Error cargando unidades:', err);
        setError('No se pudieron cargar las unidades.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) loadData(search);
  }, [isOpen, businessId, token, search, attendedFilter, page, pageSize, attendanceList.id]);

  const submitCreateProxy = async (unit: PropertyUnit) => {
    if (!proxyInput.trim()) return;
    try {
      const res = await createProxyAction({
        token,
        data: {
          businessId,
          propertyUnitId: unit.id,
          proxyName: proxyInput.trim(),
          proxyDni: '',
          proxyType: 'external' as const,
          startDate: new Date().toISOString(),
        },
      });
      if (res.success && res.data) {
        // La respuesta ahora es: { business_id, property_unit_id, proxy_name }
        const proxyName = String((res.data as unknown as Record<string, unknown>).proxy_name) || proxyInput.trim();
        setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, proxyName } : u));
        setEditingProxyUnitId(null);
        setProxyInput('');
      }
    } catch {}
  };

  const submitUpdateProxy = async (unit: PropertyUnit) => {
    const proxyId = proxyIdsByUnit.get(unit.id);
    if (!proxyId || !proxyInput.trim()) return submitCreateProxy(unit);
    try {
      const res = await updateProxyAction({ token, id: proxyId, data: { proxyName: proxyInput.trim() } as Record<string, unknown> });
      if (res.success && res.data) {
        setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, proxyName: res.data!.proxyName || proxyInput.trim() } : u));
        setEditingProxyUnitId(null);
        setProxyInput('');
      }
    } catch {}
  };

  const submitDeleteProxy = async (unit: PropertyUnit) => {
    const proxyId = proxyIdsByUnit.get(unit.id);
    if (!proxyId) { setEditingProxyUnitId(null); setProxyInput(''); return; }
    try {
      const res = await deleteProxyAction({ token, id: proxyId });
      if (res.success) {
        setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, proxyName: null } : u));
        const mapCopy = new Map(proxyIdsByUnit);
        mapCopy.delete(unit.id);
        setProxyIdsByUnit(mapCopy);
        setEditingProxyUnitId(null);
        setProxyInput('');
      }
    } catch {}
  };

  const handleToggleAttendance = async (unit: PropertyUnit) => {
    setLoading(true);
    setError(null);

    try {
      // Validación de negocio: la unidad debe pertenecer al mismo business
      if (unit.businessId && unit.businessId !== businessId) {
        setError('La unidad seleccionada no pertenece a esta propiedad.');
        setLoading(false);
        return;
      }

      // Buscar el record_id del registro de asistencia para esta unidad
      const record = units.find(u => u.id === unit.id);
      console.log('🔍 Unidad seleccionada:', unit);
      console.log('🔍 Record encontrado:', record);
      console.log('🔍 attendanceRecordId:', record?.attendanceRecordId);
      
      if (!record?.attendanceRecordId) {
        setError('No se encontró el registro de asistencia para esta unidad.');
        setLoading(false);
        return;
      }

      // Usar las Server Actions para los endpoints simples
      const result = unit.hasAttended 
        ? await unmarkAttendanceSimpleAction({ token, recordId: record.attendanceRecordId })
        : await markAttendanceSimpleAction({ token, recordId: record.attendanceRecordId });

      if (!result.success) {
        throw new Error(result.error || 'Error al marcar/desmarcar asistencia');
      }

      // Actualizar el estado local inmediatamente para reflejar el cambio
      setUnits(prev => prev.map(u => 
        u.id === unit.id 
          ? { 
              ...u, 
              hasAttended: !unit.hasAttended,
              attendedAsOwner: !unit.hasAttended,
              attendedAsProxy: false,
            }
          : u
      ));

      // Recargar datos para actualizar el resumen
      const searchText = search.trim();
      const currentPage = page;
      const currentPageSize = pageSize;
      const currentFilter = attendedFilter;
      
      // Recargar datos incluyendo el resumen
      const [recordsRes, summaryRes] = await Promise.all([
        getAttendanceListRecordsAction({ 
          token, 
          id: attendanceList.id, 
          page: currentPage, 
          pageSize: currentPageSize, 
          unitNumber: searchText || undefined, 
          attended: currentFilter === 'all' ? undefined : currentFilter === 'true' 
        }),
        getAttendanceListSummaryAction({ token, id: attendanceList.id }),
      ]);

      if (recordsRes.success && recordsRes.data) {
        const records = recordsRes.data;
        const mapped = records.map((r) => {
          const record = r as unknown as Record<string, unknown>;
          const unitId = record?.property_unit_id;
          const unit = units.find(u => u.id === unitId);
          if (!unit) return null;
          
          return {
            id: unit.id,
            unitNumber: record?.unit_number || unit.unitNumber,
            residentName: record?.resident_name ?? null,
            hasAttended: Boolean(record?.attended_as_owner) || Boolean(record?.attended_as_proxy),
            attendedAsOwner: Boolean(record?.attended_as_owner),
            attendedAsProxy: Boolean(record?.attended_as_proxy),
            businessId: unit.businessId,
            ownerName: record?.resident_name ?? null,
            proxyName: record?.proxy_name ?? null,
            attendanceRecordId: record?.id,
          };
        }).filter(Boolean) as PropertyUnit[];

        setUnits(mapped);
      }

      // Actualizar el resumen con los nuevos datos
      if (summaryRes.success && summaryRes.data) {
        const summaryData = summaryRes.data as unknown as Record<string, unknown>;
        setSummary({
          total_units: Number(summaryData.total_units) || 0,
          attended_units: Number(summaryData.attended_units) || 0,
          attendance_rate: Number(summaryData.attendance_rate_by_coef) || 0, // Por coeficiente
          absence_rate: Number(summaryData.absence_rate_by_coef) || 0, // Por coeficiente
          attended_as_owner: Number(summaryData.attended_as_owner) || 0,
          attended_as_proxy: Number(summaryData.attended_as_proxy) || 0,
        });
      }

    } catch (error) {
      setError('Error inesperado al marcar la asistencia');
      console.error('Error toggling attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Usar datos del resumen del backend (más preciso con coeficientes)
  const attendedUnits = summary?.attended_units ?? 0;
  const totalUnits = summary?.total_units ?? 0;
  const attendanceRate = summary?.attendance_rate ?? 0; // Por coeficiente (más importante)
  const absenceRate = summary?.absence_rate ?? 0; // Por coeficiente

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[60vw] max-w-[60vw] h-[90vh] mx-4 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {attendanceList.title}
              </h2>
              {attendanceList.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {attendanceList.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportExcel}
                className="btn btn-outline btn-sm"
                title="Descargar Excel para tomar asistencia"
              >
                ⬇️ Excel
              </button>
              <button
                onClick={handleExportDetailedExcel}
                className="btn btn-secondary btn-sm"
                title="Descargar Excel detallado del resumen"
              >
                📊 Resumen Excel
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4 flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número de unidad (ej: 101)"
              className="input w-full"
            />
            <select
              className="input"
              value={attendedFilter}
              onChange={(e) => { setPage(1); setAttendedFilter(e.target.value as 'all' | 'true' | 'false'); }}
              title="Filtrar asistencia"
              style={{ color: '#111827', backgroundColor: 'white' }}
            >
              <option value="all">Todos</option>
              <option value="true">Asistieron</option>
              <option value="false">No asistieron</option>
            </select>
            <button
              onClick={() => { setPage(1); setSearch(search.trim()); }}
              className="btn btn-primary"
              disabled={loading}
            >
              Buscar
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{totalUnits}</div>
              <div className="text-sm text-blue-800">Total Unidades</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{attendedUnits}</div>
              <div className="text-sm text-green-800">Asistieron</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {attendanceRate.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-800">Asistencia (Coef)</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">
                {absenceRate.toFixed(1)}%
              </div>
              <div className="text-sm text-red-800">Ausencia (Coef)</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{summary?.attended_as_owner ?? 0}</div>
              <div className="text-sm text-orange-800">Como Propietario</div>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-600">{summary?.attended_as_proxy ?? 0}</div>
              <div className="text-sm text-cyan-800">Como Apoderado</div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Units List (Table) */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Unidades de Propiedad</h3>
            <div className="overflow-x-auto">
              <table className="table w-3/5 mx-auto">
                <thead>
                  <tr>
                    <th className="w-20 text-center">Asistencia</th>
                    <th className="w-32">Unidad</th>
                    <th>Propietario</th>
                    <th>Apoderado</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id} className={`align-middle ${unit.hasAttended ? 'bg-green-50' : ''}`}>
                      <td className="text-center">
                        <button
                          onClick={() => handleToggleAttendance(unit)}
                          disabled={loading}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                            unit.hasAttended 
                              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                              : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
                          }`}
                          title={unit.hasAttended ? 'Desmarcar asistencia' : 'Marcar asistencia'}
                        >
                          {unit.hasAttended ? '✓' : '○'}
                        </button>
                      </td>
                      <td className="font-medium text-gray-900">{unit.unitNumber}</td>
                      <td className="text-gray-700">{unit.ownerName || '-'}</td>
                      <td className="text-gray-700">
                        {editingProxyUnitId === unit.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              ref={proxyInputRef}
                              value={proxyInput}
                              onChange={(e) => setProxyInput(e.target.value)}
                              placeholder="Nombre del apoderado"
                              className="input w-64 md:w-80 text-gray-900"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  submitUpdateProxy(unit);
                                } else if (e.key === 'Escape') {
                                  setEditingProxyUnitId(null);
                                  setProxyInput('');
                                }
                              }}
                            />
                            <button
                              onClick={() => submitUpdateProxy(unit)}
                              className="btn btn-primary btn-icon btn-sm"
                              title="Guardar"
                              disabled={loading || !proxyInput.trim()}
                            >
                              💾
                            </button>
                            <button
                              onClick={() => submitDeleteProxy(unit)}
                              className="btn btn-outline btn-icon btn-sm"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                            <button
                              onClick={() => { setEditingProxyUnitId(null); setProxyInput(''); }}
                              className="btn btn-secondary btn-icon btn-sm"
                              title="Cancelar"
                            >
                              ✖
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[16rem]">{unit.proxyName || '-'}</span>
                            {unit.proxyName ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => { setEditingProxyUnitId(unit.id); setProxyInput(unit.proxyName || ''); }}
                                  className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                                  title="Editar apoderado"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => submitDeleteProxy(unit)}
                                  className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                                  title="Eliminar apoderado"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingProxyUnitId(unit.id); setProxyInput(''); }}
                                className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
                                title="Agregar apoderado"
                              >
                                +
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paginación */}
            <div className="pagination-alt">
              <div className="flex items-center gap-2">
                <button
                  className="pagination-button"
                  disabled={loading || page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  ← Anterior
                </button>
                <div className="pagination-info">
                  Página {page} de {total !== null ? Math.ceil(total / pageSize) : '?'} ({total ?? 0} registros)
                </div>
                <button
                  className="pagination-button"
                  disabled={loading || (total !== null && page * pageSize >= total)}
                  onClick={() => setPage(p => p + 1)}
                >
                  Siguiente →
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">Por página</span>
                <select
                  className="input"
                  value={pageSize}
                  onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value, 10)); }}
                  style={{ color: '#111827', backgroundColor: 'white', width: '80px' }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                {total !== null && (
                  <span className="text-sm font-semibold text-gray-800">Total: {total}</span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

