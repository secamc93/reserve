/**
 * Modal: Attendance List Management
 */

'use client';

import { useState, useEffect, useRef } from 'react';
// Using CSS classes for buttons instead of Button component
import { markAttendanceAction } from '../../infrastructure/actions/attendance';
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
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [search, setSearch] = useState('');
  const [attendedUnitIds, setAttendedUnitIds] = useState<Set<number>>(new Set());
  const [summary, setSummary] = useState<{ total_units: number; attended_units: number; attendance_rate: number } | null>(null);
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

  // Cargar unidades reales desde el backend para usar IDs válidos
  useEffect(() => {
    const loadData = async (searchText = '') => {
      setLoading(true);
      setError(null);
      try {
        const [unitsRes, recordsRes, summaryRes] = await Promise.all([
          getPropertyUnitsAction({
          hpId: businessId,
          page: 1,
          pageSize: 1000,
            token,
            number: searchText || undefined,
          }),
          getAttendanceListRecordsAction({ token, id: attendanceList.id }),
          getAttendanceListSummaryAction({ token, id: attendanceList.id }),
        ]);

        // Construir índices desde los registros reales (incluye nombres y banderas)
        const records = (recordsRes.success && recordsRes.data) ? recordsRes.data : [];
        const attendedIdsLocal = new Set<number>();
        const recordInfoByUnit = new Map<number, {
          residentName: string | null;
          proxyName: string | null;
          attendedAsOwner: boolean;
          attendedAsProxy: boolean;
        }>();

        for (const r of records as any[]) {
          const unitId = r?.propertyUnitId ?? r?.property_unit_id;
          if (typeof unitId === 'number') {
            const attendedOwner = Boolean(r?.attendedAsOwner ?? r?.attended_as_owner);
            const attendedProxy = Boolean(r?.attendedAsProxy ?? r?.attended_as_proxy);
            if (attendedOwner || attendedProxy) {
              attendedIdsLocal.add(unitId);
            }
            recordInfoByUnit.set(unitId, {
              residentName: r?.residentName ?? r?.resident_name ?? null,
              proxyName: r?.proxyName ?? r?.proxy_name ?? null,
              attendedAsOwner: attendedOwner,
              attendedAsProxy: attendedProxy,
            });
            // Mapear proxy_id si viene para editar luego
            if (r?.proxyId || r?.proxy_id) {
              proxyIdsByUnit.set(unitId, Number(r?.proxyId ?? r?.proxy_id));
            }
          }
        }

        setAttendedUnitIds(attendedIdsLocal);

        if (summaryRes.success && summaryRes.data) {
          setSummary({
            total_units: (summaryRes.data as any).total_units ?? 0,
            attended_units: (summaryRes.data as any).attended_units ?? 0,
            attendance_rate: (summaryRes.data as any).attendance_rate ?? 0,
          });
        } else {
          setSummary(null);
        }

        // Los nombres ahora vienen en los registros; no necesitamos consultar proxies aquí

        const mapped = unitsRes.units.map((u) => {
          const info = recordInfoByUnit.get(u.id);
          return {
          id: u.id, // ID real de property_unit
          unitNumber: u.number || `${u.block || ''} ${u.floor || ''} ${u.number || ''}`.trim(),
          residentName: info?.residentName ?? null,
          hasAttended: attendedIdsLocal.has(u.id),
          attendedAsOwner: info?.attendedAsOwner ?? false,
          attendedAsProxy: info?.attendedAsProxy ?? false,
          businessId: u.businessId,
          ownerName: info?.residentName ?? null,
          proxyName: info?.proxyName ?? null,
        };
        });

        setUnits(mapped);
      } catch (err) {
        console.error('Error cargando unidades:', err);
        setError('No se pudieron cargar las unidades.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) loadData(search);
  }, [isOpen, businessId, token, search, attendanceList.id]);

  const submitCreateProxy = async (unit: PropertyUnit) => {
    if (!proxyInput.trim()) return;
    try {
      const res = await createProxyAction({
        token,
        data: {
          businessId,
          propertyUnitId: unit.id,
          proxyName: proxyInput.trim(),
          // DNI ya no requerido: se omite
          proxyEmail: '',
          proxyPhone: '',
          proxyAddress: '',
          proxyType: 'external',
          startDate: new Date().toISOString(),
          notes: '',
        },
      } as any);
      if (res.success && res.data) {
        setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, proxyName: res.data!.proxyName || proxyInput.trim() } : u));
        setProxyIdsByUnit(new Map(proxyIdsByUnit.set(unit.id, (res.data as any).id)));
        setEditingProxyUnitId(null);
        setProxyInput('');
      }
    } catch {}
  };

  const submitUpdateProxy = async (unit: PropertyUnit) => {
    const proxyId = proxyIdsByUnit.get(unit.id);
    if (!proxyId || !proxyInput.trim()) return submitCreateProxy(unit);
    try {
      const res = await updateProxyAction({ token, id: proxyId, data: { proxyName: proxyInput.trim() } as any });
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

  const handleMarkAttendance = async (unit: PropertyUnit, attendedAsOwner: boolean, attendedAsProxy: boolean) => {
    setLoading(true);
    setError(null);

    try {
      // Validación de negocio: la unidad debe pertenecer al mismo business
      if (unit.businessId && unit.businessId !== businessId) {
        setError('La unidad seleccionada no pertenece a esta propiedad.');
        setLoading(false);
        return;
      }

      const result = await markAttendanceAction({
        token,
        data: {
          attendanceListId: attendanceList.id,
          propertyUnitId: unit.id,
          residentId: unit.residentName ? 1 : undefined, // Mock resident ID
          attendedAsOwner,
          attendedAsProxy,
          signature: 'Firma digital', // En el futuro será una firma real
          signatureMethod: 'digital' as const,
          notes: `Asistencia marcada el ${new Date().toLocaleDateString()}`,
        },
      });

      if (result.success && result.data) {
        // Actualizar el estado local
        setUnits(prev => prev.map(u => 
          u.id === unit.id 
            ? { 
                ...u, 
                hasAttended: true, 
                attendedAsOwner, 
                attendedAsProxy,
                attendanceRecordId: result.data!.id
              }
            : u
        ));
        setShowMarkAttendance(false);
        setSelectedUnit(null);
      } else {
        setError(result.error || 'Error al marcar la asistencia');
      }
    } catch (error) {
      setError('Error inesperado al marcar la asistencia');
      console.error('Error marking attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendanceClick = (unit: PropertyUnit) => {
    setSelectedUnit(unit);
    setShowMarkAttendance(true);
  };

  const attendedUnits = summary?.attended_units ?? units.filter(unit => unit.hasAttended).length;
  const totalUnits = summary?.total_units ?? units.length;
  const attendanceRate = summary?.attendance_rate ?? (totalUnits > 0 ? (attendedUnits / totalUnits) * 100 : 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-[90vw] h-[90vh] mx-4 overflow-y-auto">
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
            <button
              onClick={() => setSearch(search.trim())}
              className="btn btn-primary"
              disabled={loading}
            >
              Buscar
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
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
              <div className="text-sm text-purple-800">Asistencia</div>
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
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="w-32">Unidad</th>
                    <th>Propietario</th>
                    <th>Apoderado</th>
                    <th className="w-32 text-center">Estado</th>
                    <th className="w-40 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id} className="align-middle">
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
                            <button
                              onClick={() => { setEditingProxyUnitId(unit.id); setProxyInput(unit.proxyName || ''); }}
                              className="btn btn-outline btn-xs"
                            >
                              {unit.proxyName ? 'Editar' : 'Agregar'}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        {unit.hasAttended ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            unit.attendedAsOwner 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {unit.attendedAsOwner ? 'Propietario' : 'Apoderado'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">Pendiente</span>
                        )}
                      </td>
                      <td className="text-right">
                        {unit.hasAttended ? (
                          <span className="text-green-600 text-sm font-medium">✅ Asistió</span>
                        ) : (
                          <button
                            onClick={() => handleMarkAttendanceClick(unit)}
                            disabled={loading}
                            className="btn btn-primary btn-sm"
                          >
                            Marcar Asistencia
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mark Attendance Modal */}
          {showMarkAttendance && selectedUnit && (
            <MarkAttendanceModal
              unit={selectedUnit}
              onClose={() => {
                setShowMarkAttendance(false);
                setSelectedUnit(null);
              }}
              onSubmit={handleMarkAttendance}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for marking attendance
interface MarkAttendanceModalProps {
  unit: PropertyUnit;
  onClose: () => void;
  onSubmit: (unit: PropertyUnit, attendedAsOwner: boolean, attendedAsProxy: boolean) => void;
  loading: boolean;
}

function MarkAttendanceModal({ unit, onClose, onSubmit, loading }: MarkAttendanceModalProps) {
  const [attendedAsOwner, setAttendedAsOwner] = useState(true);
  const [attendedAsProxy, setAttendedAsProxy] = useState(false);

  const handleSubmit = () => {
    onSubmit(unit, attendedAsOwner, attendedAsProxy);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Marcar Asistencia
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Unidad:</strong> {unit.unitNumber}
            </p>
            {unit.residentName && (
              <p className="text-sm text-blue-800">
                <strong>Residente:</strong> {unit.residentName}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={attendedAsOwner}
                  onChange={() => {
                    setAttendedAsOwner(true);
                    setAttendedAsProxy(false);
                  }}
                  className="form-radio"
                />
                <span className="text-gray-700">
                  Asistió como <strong>Propietario</strong>
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={attendedAsProxy}
                  onChange={() => {
                    setAttendedAsOwner(false);
                    setAttendedAsProxy(true);
                  }}
                  className="form-radio"
                />
                <span className="text-gray-700">
                  Asistió como <strong>Apoderado</strong>
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Marcando...' : 'Marcar Asistencia'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
