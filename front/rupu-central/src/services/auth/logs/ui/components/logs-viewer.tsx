'use client';

import { useState, useMemo } from 'react';
import { useLogs } from '../hooks';
import { LogEntry, LogFilter } from '../../domain/entities';
import { Badge } from '@shared/ui';

interface LogsViewerProps {
  token: string;
  maxLogs?: number;
}

const levelColors: Record<string, string> = {
  error: 'bg-red-100 text-red-800 border-red-200',
  warn: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  debug: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function LogsViewer({ token, maxLogs = 1000 }: LogsViewerProps) {
  const [filter, setFilter] = useState<LogFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { logs, isConnected, error, clearLogs, reconnect } = useLogs({
    token,
    filter,
    enabled: true,
  });

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

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header con controles */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Logs en Tiempo Real</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isConnected ? 'Conectado' : 'Desconectado'}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select
            value={filter.level || ''}
            onChange={(e) =>
              setFilter({ ...filter, level: e.target.value || undefined })
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />

          <input
            type="text"
            placeholder="Módulo..."
            value={filter.module || ''}
            onChange={(e) =>
              setFilter({ ...filter, module: e.target.value || undefined })
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />

          <input
            type="text"
            placeholder="Buscar en mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            Limpiar Logs
          </button>
          <button
            onClick={reconnect}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Reconectar
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {filteredLogs.length} logs
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Lista de logs */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {isConnected ? 'No hay logs para mostrar' : 'Conectando...'}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <LogItem key={index} log={log} formatTimestamp={formatTimestamp} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function LogItem({
  log,
  formatTimestamp,
}: {
  log: LogEntry;
  formatTimestamp: (timestamp: string) => string;
}) {
  const levelColor = levelColors[log.level.toLowerCase()] || levelColors.info;

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <Badge className={levelColor}>{log.level.toUpperCase()}</Badge>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>{formatTimestamp(log.timestamp)}</span>
            {log.service && (
              <>
                <span>•</span>
                <span className="font-medium">{log.service}</span>
              </>
            )}
            {log.module && (
              <>
                <span>•</span>
                <span>{log.module}</span>
              </>
            )}
            {log.function && (
              <>
                <span>•</span>
                <span>{log.function}</span>
              </>
            )}
            {log.business_id && (
              <>
                <span>•</span>
                <span>Business: {log.business_id}</span>
              </>
            )}
            {log.user_id && (
              <>
                <span>•</span>
                <span>User: {log.user_id}</span>
              </>
            )}
          </div>
          <div className="text-sm text-gray-900 font-mono whitespace-pre-wrap break-words">
            {log.message}
          </div>
          {log.fields && Object.keys(log.fields).length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer">
                Campos adicionales ({Object.keys(log.fields).length})
              </summary>
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border overflow-auto">
                {JSON.stringify(log.fields, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
