'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAttendanceListSummaryAction } from '../infrastructure/actions/get-attendance-list-summary.action';

interface AttendanceSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceListId: number;
  token: string;
}

interface SummaryData {
  total_units: number;
  attended_units: number;
  absent_units: number;
  attended_as_owner: number;
  attended_as_proxy: number;
  attendance_rate: number;
  absence_rate: number;
  attendance_rate_by_coef: number;
  absence_rate_by_coef: number;
}

// SVG Donut/Pie chart component
function DonutChart({
  segments,
  size = 200,
  strokeWidth = 32,
  centerLabel,
  centerValue,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let accumulated = 0;
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const offset = circumference * (1 - accumulated) + circumference * 0.25;
    accumulated += pct;
    return {
      ...seg,
      pct,
      dashArray: `${circumference * pct} ${circumference * (1 - pct)}`,
      dashOffset: offset,
    };
  });

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="butt"
            className="transition-all duration-700 ease-out"
          />
        ))}
      </svg>
      {/* Center text */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-2xl font-bold text-gray-900">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-gray-500">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

function Legend({ items }: { items: { color: string; label: string; value: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-gray-600 flex-1">{item.label}</span>
          <span className="text-sm font-semibold text-gray-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function AttendanceSummaryModal({ isOpen, onClose, attendanceListId, token }: AttendanceSummaryModalProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadSummary = useCallback(async () => {
    if (!token || !attendanceListId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getAttendanceListSummaryAction({
        token,
        id: attendanceListId
      });

      if (result.success && result.data) {
        setSummary(result.data as unknown as SummaryData);
        setLastUpdated(new Date());
      } else {
        setError('Error al cargar el resumen');
      }
    } catch (err) {
      setError('Error inesperado al cargar el resumen');
      console.error('Error loading summary:', err);
    } finally {
      setLoading(false);
    }
  }, [token, attendanceListId]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen && attendanceListId && token) {
      loadSummary();
    }
  }, [isOpen, attendanceListId, token, loadSummary]);

  // Auto-refresh cada minuto
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      loadSummary();
    }, 60000);

    return () => clearInterval(interval);
  }, [isOpen, loadSummary]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[700px] max-w-[95vw] max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Resumen de Asistencia</h2>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-5 overflow-y-auto">
          {loading && !summary && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Cargando resumen...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-red-500 mb-3">{error}</p>
                <button
                  onClick={loadSummary}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {summary && (
            <div className="space-y-6">
              {/* Row 1: Two pie charts side by side */}
              <div className="grid grid-cols-2 gap-6">
                {/* Pie: Asistencia por Cantidad */}
                <div className="bg-gray-50 rounded-xl p-5 flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Asistencia por Cantidad</h3>
                  <DonutChart
                    size={180}
                    strokeWidth={28}
                    centerValue={`${summary.attended_units}`}
                    centerLabel={`de ${summary.total_units}`}
                    segments={[
                      { value: summary.attended_as_owner, color: '#22c55e', label: 'Propietario' },
                      { value: summary.attended_as_proxy, color: '#3b82f6', label: 'Apoderado' },
                      { value: summary.absent_units, color: '#ef4444', label: 'Ausentes' },
                    ]}
                  />
                  <div className="mt-4 w-full">
                    <Legend
                      items={[
                        { color: '#22c55e', label: 'Propietario', value: `${summary.attended_as_owner}` },
                        { color: '#3b82f6', label: 'Apoderado', value: `${summary.attended_as_proxy}` },
                        { color: '#ef4444', label: 'Ausentes', value: `${summary.absent_units}` },
                      ]}
                    />
                  </div>
                </div>

                {/* Pie: Asistencia por Coeficiente */}
                <div className="bg-gray-50 rounded-xl p-5 flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Asistencia por Coeficiente</h3>
                  <DonutChart
                    size={180}
                    strokeWidth={28}
                    centerValue={`${summary.attendance_rate_by_coef.toFixed(1)}%`}
                    centerLabel="asistencia"
                    segments={[
                      { value: summary.attendance_rate_by_coef, color: '#22c55e', label: 'Asistencia' },
                      { value: summary.absence_rate_by_coef, color: '#ef4444', label: 'Ausencia' },
                    ]}
                  />
                  <div className="mt-4 w-full">
                    <Legend
                      items={[
                        { color: '#22c55e', label: 'Asistencia (Coef)', value: `${summary.attendance_rate_by_coef.toFixed(1)}%` },
                        { color: '#ef4444', label: 'Ausencia (Coef)', value: `${summary.absence_rate_by_coef.toFixed(1)}%` },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Summary stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{summary.total_units}</p>
                  <p className="text-xs text-blue-600 mt-1">Total Unidades</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{summary.attended_units}</p>
                  <p className="text-xs text-green-600 mt-1">Asistieron</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">{summary.absent_units}</p>
                  <p className="text-xs text-red-600 mt-1">Ausentes</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-700">{summary.attendance_rate.toFixed(1)}%</p>
                  <p className="text-xs text-purple-600 mt-1">Tasa Asistencia</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={loadSummary}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
