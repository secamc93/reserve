/**
 * Componente: Modal de Votación Masiva
 */

'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Modal, Spinner, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getUnvotedUnitsAction, createBulkVotesAction, getPreviousVotedUnitsAction } from '../infrastructure/actions';
import type { BulkVoteResult } from '../domain/entities/vote.entity';

interface VotingOption {
  id: number;
  votingId: number;
  optionText: string;
  optionCode: string;
  displayOrder: number;
  isActive: boolean;
  color?: string;
}

interface UnvotedUnit {
  unit_id: number;
  unit_number: string;
  resident_id: number | null;
  resident_name: string | null;
}

interface BulkVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  groupId: number;
  votingId: number;
  options: VotingOption[];
  currentVotes: Array<{ property_unit_id: number }>;
  /** Set de unit IDs que ya tienen asistencia marcada */
  unitsWithAttendance: Set<number>;
  /** Total de votos del SSE en tiempo real (para barra de progreso) */
  sseTotalVotes: number;
}

export function BulkVoteModal({
  isOpen,
  onClose,
  businessId,
  groupId,
  votingId,
  options,
  currentVotes,
  unitsWithAttendance,
  sseTotalVotes,
}: BulkVoteModalProps) {
  const [units, setUnits] = useState<UnvotedUnit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<number>>(new Set());
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [autoMarkAttendance, setAutoMarkAttendance] = useState(true);
  const [onlyWithAttendance, setOnlyWithAttendance] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkVoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-votación desde votación anterior (interno)
  const [loadingPreviousVotes, setLoadingPreviousVotes] = useState(false);
  const [previousVotingTitle, setPreviousVotingTitle] = useState<string | null>(null);

  // Progreso via SSE: cuando enviamos N votos, esperamos N eventos new_vote
  const [bulkProgress, setBulkProgress] = useState<{
    totalExpected: number;
    baselineVotes: number;
  } | null>(null);

  // Calcular progreso basado en SSE
  const sseReceived = bulkProgress ? sseTotalVotes - bulkProgress.baselineVotes : 0;
  const progressPercent = bulkProgress
    ? Math.min(100, Math.round((sseReceived / bulkProgress.totalExpected) * 100))
    : 0;
  const progressComplete = bulkProgress ? sseReceived >= bulkProgress.totalExpected : false;

  // Cuando el progreso llega al 100%, limpiar después de un momento
  const progressCompleteHandled = useRef(false);
  useEffect(() => {
    if (progressComplete && !progressCompleteHandled.current) {
      progressCompleteHandled.current = true;
      const timer = setTimeout(() => {
        setBulkProgress(null);
        progressCompleteHandled.current = false;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [progressComplete]);

  // Cargar unidades sin votar cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadUnvotedUnits();
      // Reset state
      setSelectedUnitIds(new Set());
      setSelectedOptionId(null);
      setAutoMarkAttendance(true);
      setOnlyWithAttendance(true);
      setSearchQuery('');
      setResult(null);
      setError(null);
      setPreviousVotingTitle(null);
      setBulkProgress(null);
      progressCompleteHandled.current = false;
    }
  }, [isOpen]);

  // Al desactivar el filtro de asistencia, limpiar selección para evitar confusión
  useEffect(() => {
    setSelectedUnitIds(new Set());
  }, [onlyWithAttendance]);

  const loadUnvotedUnits = async () => {
    setLoadingUnits(true);
    setError(null);

    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const response = await getUnvotedUnitsAction({
        businessId,
        groupId,
        votingId,
        token,
      });

      if (!response.success || !response.data) {
        setError(response.error || 'Error al cargar unidades');
        return;
      }

      // Filtrar unidades que ya votaron según SSE
      const votedUnitIds = new Set(currentVotes.map(v => v.property_unit_id));
      const filtered = response.data.filter(u => !votedUnitIds.has(u.unit_id));
      setUnits(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoadingUnits(false);
    }
  };

  // Cargar unidades de la votación anterior y pre-seleccionarlas
  const handleLoadPreviousVotes = async () => {
    setLoadingPreviousVotes(true);
    setError(null);

    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const response = await getPreviousVotedUnitsAction({
        token,
        businessId,
        groupId,
        votingId,
      });

      if (!response.success || !response.data) {
        setError(response.error || 'No se encontró votación anterior');
        return;
      }

      const { votedUnitIds, previousVotingTitle: title } = response.data;

      if (votedUnitIds.length === 0) {
        setError('La votación anterior no tiene votos registrados');
        return;
      }

      // Desactivar filtro de asistencia para ver todas las unidades
      setOnlyWithAttendance(false);

      // Intersectar con unidades disponibles (sin votar)
      const availableUnitIds = new Set(units.map(u => u.unit_id));
      const intersection = votedUnitIds.filter((id: number) => availableUnitIds.has(id));
      setSelectedUnitIds(new Set(intersection));
      setPreviousVotingTitle(title);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando votación anterior');
    } finally {
      setLoadingPreviousVotes(false);
    }
  };

  // Filtrar unidades por búsqueda y asistencia
  const filteredUnits = useMemo(() => {
    let result = units;

    // Filtro de asistencia
    if (onlyWithAttendance) {
      result = result.filter(u => unitsWithAttendance.has(u.unit_id));
    }

    // Filtro de búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.unit_number.toLowerCase().includes(q) ||
        (u.resident_name && u.resident_name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [units, searchQuery, onlyWithAttendance, unitsWithAttendance]);

  // Contadores para el badge del filtro
  const withAttendanceCount = useMemo(
    () => units.filter(u => unitsWithAttendance.has(u.unit_id)).length,
    [units, unitsWithAttendance]
  );
  const withoutAttendanceCount = units.length - withAttendanceCount;

  const toggleUnit = (unitId: number) => {
    setSelectedUnitIds(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedUnitIds(new Set(filteredUnits.map(u => u.unit_id)));
  };

  const deselectAll = () => {
    setSelectedUnitIds(new Set());
  };

  const handleSubmit = async () => {
    if (selectedUnitIds.size === 0 || !selectedOptionId) return;

    const totalExpected = selectedUnitIds.size;

    setSubmitting(true);
    setError(null);

    // Capturar baseline de votos SSE antes de enviar
    setBulkProgress({ totalExpected, baselineVotes: sseTotalVotes });
    progressCompleteHandled.current = false;

    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        setBulkProgress(null);
        return;
      }

      const response = await createBulkVotesAction({
        token,
        businessId,
        groupId,
        votingId,
        data: {
          propertyUnitIds: Array.from(selectedUnitIds),
          votingOptionId: selectedOptionId,
          autoMarkAttendance,
          ipAddress: 'bulk-vote',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        },
      });

      if (response.success && response.data) {
        setResult(response.data);
        // Quitar las unidades que se votaron exitosamente de la lista
        const succeededIds = new Set(
          response.data.results.filter(r => r.success).map(r => r.propertyUnitId)
        );
        setUnits(prev => prev.filter(u => !succeededIds.has(u.unit_id)));
        setSelectedUnitIds(new Set());
      } else {
        setError(response.error || 'Error en votación masiva');
        setBulkProgress(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
      setBulkProgress(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const sortedOptions = [...options].sort((a, b) => a.displayOrder - b.displayOrder);
  const selectedOption = options.find(o => o.id === selectedOptionId);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Votación Masiva" size="lg">
      <div className="space-y-5">
        {/* Resultado de operación previa */}
        {result && (
          <div className={`rounded-lg p-4 border ${result.failed > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{result.failed > 0 ? '⚠️' : '✅'}</span>
              <h4 className="font-semibold text-gray-900">
                {result.succeeded} exitosos{result.failed > 0 ? `, ${result.failed} fallidos` : ''}
              </h4>
            </div>
            {result.failed > 0 && (
              <details className="mt-2">
                <summary className="text-sm text-yellow-800 cursor-pointer hover:underline">
                  Ver errores ({result.failed})
                </summary>
                <ul className="mt-2 space-y-1">
                  {result.results
                    .filter(r => !r.success)
                    .map(r => (
                      <li key={r.propertyUnitId} className="text-sm text-red-700">
                        Unidad #{r.propertyUnitId}: {r.error}
                      </li>
                    ))}
                </ul>
              </details>
            )}
            <button
              onClick={() => setResult(null)}
              className="mt-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Cerrar resultado
            </button>
          </div>
        )}

        {/* Barra de progreso SSE */}
        {bulkProgress && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                {progressComplete ? 'Votación masiva completada' : 'Procesando votos...'}
              </span>
              <span className="text-sm font-bold text-blue-700">
                {Math.min(sseReceived, bulkProgress.totalExpected)}/{bulkProgress.totalExpected}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  progressComplete ? 'bg-green-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-blue-700 mt-1.5">
              {progressComplete
                ? 'Todos los votos fueron registrados via SSE'
                : `Recibiendo confirmaciones en tiempo real... ${progressPercent}%`}
            </p>
          </div>
        )}

        {/* Banner de auto-votación */}
        {previousVotingTitle && selectedUnitIds.size > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-purple-800">
              <span className="text-lg">🔄</span>
              <div>
                <span className="font-semibold">Auto-votación:</span>{' '}
                Pre-seleccionadas <span className="font-bold">{selectedUnitIds.size}</span> unidades
                de la votación anterior: &quot;{previousVotingTitle}&quot;
              </div>
            </div>
          </div>
        )}

        {/* Selección de opción de voto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opción de voto para todas las unidades *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {sortedOptions.map(option => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedOptionId === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="bulk-vote-option"
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                  disabled={submitting}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex items-center gap-2 min-w-0">
                  {option.color && (
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                  <span className="font-medium text-gray-900 text-sm truncate">{option.optionText}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Opciones de asistencia */}
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={autoMarkAttendance}
              onChange={e => setAutoMarkAttendance(e.target.checked)}
              disabled={submitting}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Marcar asistencia automáticamente</span>
              <p className="text-xs text-gray-500">Si la unidad no tiene asistencia, se marcará antes de votar</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={onlyWithAttendance}
              onChange={e => setOnlyWithAttendance(e.target.checked)}
              disabled={submitting}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Solo unidades con asistencia</span>
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                {withAttendanceCount}
              </span>
              {withoutAttendanceCount > 0 && !onlyWithAttendance && (
                <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                  +{withoutAttendanceCount} sin asistencia
                </span>
              )}
            </div>
          </label>
        </div>

        {/* Selección de unidades */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Seleccionar unidades *
            </label>
            <div className="flex gap-2 flex-wrap justify-end">
              <button
                type="button"
                onClick={handleLoadPreviousVotes}
                disabled={submitting || loadingPreviousVotes || loadingUnits || units.length === 0}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
              >
                {loadingPreviousVotes ? 'Cargando...' : 'Cargar de votación anterior'}
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={selectAll}
                disabled={submitting || filteredUnits.length === 0}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              >
                Seleccionar todos ({filteredUnits.length})
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={deselectAll}
                disabled={submitting || selectedUnitIds.size === 0}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
              >
                Deseleccionar
              </button>
            </div>
          </div>

          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar por unidad o residente..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            disabled={submitting}
            className="input w-full mb-2 text-sm"
          />

          {/* Lista de unidades */}
          {loadingUnits ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
              <span className="ml-2 text-gray-600 text-sm">Cargando unidades...</span>
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              {units.length === 0
                ? 'No hay unidades disponibles para votar'
                : onlyWithAttendance && withAttendanceCount === 0
                  ? 'Ninguna unidad sin votar tiene asistencia marcada. Desactiva el filtro o marca asistencia primero.'
                  : 'No se encontraron unidades con ese criterio'}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {filteredUnits.map(unit => {
                const hasAttendance = unitsWithAttendance.has(unit.unit_id);
                return (
                  <label
                    key={unit.unit_id}
                    className={`flex items-center gap-3 px-3 py-2 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedUnitIds.has(unit.unit_id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUnitIds.has(unit.unit_id)}
                      onChange={() => toggleUnit(unit.unit_id)}
                      disabled={submitting}
                      className="w-4 h-4 text-blue-600 rounded flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{unit.unit_number}</span>
                      <span className="text-xs text-gray-500 truncate">
                        {unit.resident_name || 'Sin residente'}
                      </span>
                    </div>
                    {!hasAttendance && (
                      <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        Sin asistencia
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Barra resumen */}
        {selectedUnitIds.size > 0 && selectedOption && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <span className="font-semibold">{selectedUnitIds.size} unidades</span>
              <span>votarán por</span>
              <span className="font-semibold flex items-center gap-1">
                {selectedOption.color && (
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedOption.color }}
                  />
                )}
                &quot;{selectedOption.optionText}&quot;
              </span>
              {autoMarkAttendance && (
                <span className="text-blue-600 text-xs">(con asistencia automática)</span>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="btn btn-outline"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || selectedUnitIds.size === 0 || !selectedOptionId}
            className={`btn min-w-[160px] ${
              submitting || selectedUnitIds.size === 0 || !selectedOptionId
                ? 'btn-disabled opacity-50 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                {bulkProgress
                  ? `${Math.min(sseReceived, bulkProgress.totalExpected)}/${bulkProgress.totalExpected} votos...`
                  : 'Procesando...'}
              </span>
            ) : (
              `Registrar ${selectedUnitIds.size} Voto${selectedUnitIds.size !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
