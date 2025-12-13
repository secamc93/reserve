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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualReconnectRef = useRef(false);
  const lastLogTimeRef = useRef<number>(Date.now());
  const isConnectedRef = useRef(false);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !token) {
      return;
    }

    // Limpiar timeout de reconexión si existe
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
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
          isConnectedRef.current = true;
          setIsConnected(true);
          lastLogTimeRef.current = Date.now();
          reconnectAttemptsRef.current = 0; // Resetear intentos en reconexión exitosa
          setLogs((prevLogs) => [...prevLogs, log]);
        },
        (err: Error) => {
          isConnectedRef.current = false;
          setIsConnected(false);
          setError(err.message);
          console.error('Error en stream de logs:', err);

          // Solo reconectar automáticamente si no fue una desconexión manual
          if (!isManualReconnectRef.current && enabled) {
            scheduleReconnect();
          }
        },
        () => {
          // Callback cuando se establece la conexión
          console.log('✅ Conexión establecida al stream de logs');
          isConnectedRef.current = true;
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
          lastLogTimeRef.current = Date.now();
        }
      );

      closeConnectionRef.current = closeConnection;

      // Monitorear si la conexión se cierra inesperadamente
      // Si no recibimos logs por más de 2 minutos, considerar desconectado
      const healthCheckInterval = setInterval(() => {
        const timeSinceLastLog = Date.now() - lastLogTimeRef.current;
        const twoMinutes = 2 * 60 * 1000;

        if (timeSinceLastLog > twoMinutes && isConnectedRef.current) {
          console.warn('⚠️ No se han recibido logs en 2 minutos, reconectando...');
          isConnectedRef.current = false;
          setIsConnected(false);
          if (closeConnectionRef.current) {
            closeConnectionRef.current();
            closeConnectionRef.current = null;
          }
          clearInterval(healthCheckInterval);
          scheduleReconnect();
        }
      }, 30000); // Verificar cada 30 segundos

      // Limpiar el health check cuando se cierre la conexión
      const originalClose = closeConnection;
      closeConnectionRef.current = () => {
        clearInterval(healthCheckInterval);
        originalClose();
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setIsConnected(false);

      // Intentar reconectar en caso de error
      if (enabled) {
        scheduleReconnect();
      }
    }
  }, [token, filter, enabled]);

  const scheduleReconnect = useCallback(() => {
    // Limpiar timeout anterior si existe
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Backoff exponencial: 1s, 2s, 4s, 8s, 16s, máximo 30s
    const maxDelay = 30000;
    const baseDelay = 1000;
    const delay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current), maxDelay);
    
    reconnectAttemptsRef.current += 1;

    console.log(`🔄 Programando reconexión en ${delay}ms (intento ${reconnectAttemptsRef.current})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Reconectando...');
      connect();
    }, delay);
  }, [connect]);

  const reconnect = useCallback(() => {
    isManualReconnectRef.current = true;
    reconnectAttemptsRef.current = 0; // Resetear intentos en reconexión manual
    connect();
    // Resetear flag después de un momento
    setTimeout(() => {
      isManualReconnectRef.current = false;
    }, 1000);
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
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
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
