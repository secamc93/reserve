'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useLogs } from '../hooks';
import { LogEntry, LogFilter } from '../../domain/entities';
import { formatLogEntrySimple } from '../utils/log-formatter';

interface LogsViewerProps {
  token: string;
  maxLogs?: number;
}

export function LogsViewer({ token, maxLogs = 1000 }: LogsViewerProps) {
  const [filter, setFilter] = useState<LogFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1); // Nivel de zoom inicial (1 = 100%)
  const { logs, isConnected, error, clearLogs, reconnect } = useLogs({
    token,
    filter,
    enabled: true,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Funciones para controlar el zoom
  const increaseZoom = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2)); // Máximo 200%
  };

  const decreaseZoom = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5)); // Mínimo 50%
  };

  const resetZoom = () => {
    setZoomLevel(1); // Resetear a 100%
  };

  // Filtrar logs por búsqueda
  const filteredLogs = useMemo(() => {
    let result = logs;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          log.service?.toLowerCase().includes(searchLower) ||
          log.module?.toLowerCase().includes(searchLower) ||
          log.function?.toLowerCase().includes(searchLower)
      );
    }

    // Limitar cantidad de logs mostrados
    if (result.length > maxLogs) {
      result = result.slice(-maxLogs);
    }

    return result;
  }, [logs, searchTerm, maxLogs]);

  // Auto-scroll al final cuando hay nuevos logs
  useEffect(() => {
    if (shouldAutoScroll.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs]);

  // Detectar scroll manual para desactivar auto-scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    shouldAutoScroll.current = isAtBottom;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header con controles */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select
            value={filter.level || ''}
            onChange={(e) =>
              setFilter({ ...filter, level: e.target.value || undefined })
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todos los niveles</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>

          <input
            type="text"
            placeholder="Servicio..."
            value={filter.service || ''}
            onChange={(e) =>
              setFilter({ ...filter, service: e.target.value || undefined })
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            placeholder="Módulo..."
            value={filter.module || ''}
            onChange={(e) =>
              setFilter({ ...filter, module: e.target.value || undefined })
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            placeholder="Buscar un mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Botones de acción y controles alineados */}
        <div className="flex items-center justify-between">
          {/* Botones de acción a la izquierda */}
          <div className="flex gap-2">
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 text-sm transition-colors"
            >
              Limpiar Logs
            </button>
            <button
              onClick={reconnect}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-colors"
            >
              Reconectar
            </button>
            <span className="px-4 py-2 text-sm text-gray-400">
              {filteredLogs.length} logs
            </span>
          </div>

          {/* Controles de zoom y estado de conexión a la derecha */}
          <div className="flex items-center gap-3">
            {/* Controles de Zoom */}
            <div className="flex items-center gap-1 border border-gray-600 rounded px-2 py-1">
              <button
                onClick={decreaseZoom}
                className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Disminuir zoom"
              >
                −
              </button>
              <span className="text-xs text-gray-400 min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={increaseZoom}
                className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Aumentar zoom"
              >
                +
              </button>
              <button
                onClick={resetZoom}
                className="px-2 py-1 text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors ml-1"
                title="Resetear zoom"
              >
                Reset
              </button>
            </div>
            {/* Estado de conexión */}
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={isConnected ? 'Conectado' : 'Desconectado'}
              />
              <span className="text-sm text-gray-300">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Terminal de logs */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto bg-black font-mono"
        style={{ 
          fontFamily: 'monospace',
          fontSize: `${zoomLevel * 0.875}rem` // Base: 0.875rem (14px), se escala según zoomLevel
        }}
      >
        <div className="p-4">
          {filteredLogs.length === 0 ? (
            <div className="text-green-400 text-center py-8">
              {isConnected ? 'No hay logs para mostrar' : 'Conectando...'}
            </div>
          ) : (
            <div className="space-y-0">
              {filteredLogs.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  {formatLogEntrySimple(log)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
