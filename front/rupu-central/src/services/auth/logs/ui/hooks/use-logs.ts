'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { StreamLogsUseCase } from '../../application';
import { LogsRepository } from '../../infrastructure';
import { LogEntry, LogFilter } from '../../domain/entities';

interface UseLogsParams {
  token: string;
  filter?: LogFilter;
  enabled?: boolean;
}

interface UseLogsReturn {
  logs: LogEntry[];
  isConnected: boolean;
  error: string | null;
  clearLogs: () => void;
  reconnect: () => void;
}

export function useLogs({
  token,
  filter,
  enabled = true,
}: UseLogsParams): UseLogsReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeConnectionRef = useRef<(() => void) | null>(null);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !token) {
      return;
    }

    // Cerrar conexión anterior si existe
    if (closeConnectionRef.current) {
      closeConnectionRef.current();
      closeConnectionRef.current = null;
    }

    setError(null);
    setIsConnected(false);

    try {
      const logsRepository = new LogsRepository();
      const streamLogsUseCase = new StreamLogsUseCase(logsRepository);

      const closeConnection = streamLogsUseCase.execute(
        token,
        filter,
        (log: LogEntry) => {
          // Cuando recibimos un log, ya estamos conectados
          setIsConnected(true);
          setLogs((prevLogs) => [...prevLogs, log]);
        },
        (err: Error) => {
          setIsConnected(false);
          setError(err.message);
          console.error('Error en stream de logs:', err);
        },
        () => {
          // Callback cuando se establece la conexión
          console.log('✅ Conexión establecida al stream de logs');
          setIsConnected(true);
        }
      );

      closeConnectionRef.current = closeConnection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setIsConnected(false);
    }
  }, [token, filter, enabled]);

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (enabled && token) {
      connect();
    }

    return () => {
      if (closeConnectionRef.current) {
        closeConnectionRef.current();
        closeConnectionRef.current = null;
      }
    };
  }, [enabled, token, connect]);

  return {
    logs,
    isConnected,
    error,
    clearLogs,
    reconnect,
  };
}
