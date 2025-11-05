'use client';

import { useState, useEffect } from 'react';
import { getAttendanceListSummaryAction } from '../../infrastructure/actions/attendance/get-attendance-list-summary.action';

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

export function AttendanceSummaryModal({ isOpen, onClose, attendanceListId, token }: AttendanceSummaryModalProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadSummary = async () => {
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
  };

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
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [isOpen, attendanceListId, token, loadSummary]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Resumen de Asistencia
          </h2>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Última actualización: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading && !summary && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando resumen...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadSummary}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {summary && (
            <div className="space-y-6">
              {/* Tarjetas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total de Unidades */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total de Unidades</p>
                      <p className="text-2xl font-bold text-blue-900">{summary.total_units}</p>
                    </div>
                  </div>
                </div>

                {/* Unidades Asistidas */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Asistidas</p>
                      <p className="text-2xl font-bold text-green-900">{summary.attended_units}</p>
                    </div>
                  </div>
                </div>

                {/* Unidades Ausentes */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-red-100 rounded-full">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-red-600">Ausentes</p>
                      <p className="text-2xl font-bold text-red-900">{summary.absent_units}</p>
                    </div>
                  </div>
                </div>

                {/* Asistencia por Coeficiente */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Asistencia (Coef)</p>
                      <p className="text-2xl font-bold text-purple-900">{summary.attendance_rate_by_coef.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Asistencia por Propietario */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Asistencia por Propietario</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Propietarios Asistidos</span>
                      <span className="font-bold text-gray-900">{summary.attended_as_owner}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Por Apoderado</span>
                      <span className="font-bold text-gray-900">{summary.attended_as_proxy}</span>
                    </div>
                  </div>
                </div>

                {/* Porcentajes Detallados */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Porcentajes Detallados</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Asistencia (Cantidad)</span>
                      <span className="font-bold text-green-600">{summary.attendance_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ausencia (Cantidad)</span>
                      <span className="font-bold text-red-600">{summary.absence_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ausencia (Coeficiente)</span>
                      <span className="font-bold text-red-600">{summary.absence_rate_by_coef.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso visual */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso de Asistencia</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Asistencia por Coeficiente</span>
                      <span>{summary.attendance_rate_by_coef.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${summary.attendance_rate_by_coef}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Ausencia por Coeficiente</span>
                      <span>{summary.absence_rate_by_coef.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-red-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${summary.absence_rate_by_coef}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={loadSummary}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Actualizando...' : 'Actualizar Ahora'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
