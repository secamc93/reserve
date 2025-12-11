/**
 * Repositorio de Logs
 * Maneja el stream de logs en tiempo real usando Server-Sent Events
 */

import { ILogsRepository } from '../../domain/ports';
import { LogEntry, LogFilter } from '../../domain/entities';
import { envPublic } from '@shared/config';

export class LogsRepository implements ILogsRepository {
  // Procesa un evento SSE recibido
  private processSSEEvent(
    eventType: string,
    data: string,
    onMessage: (log: LogEntry) => void,
    onConnected?: () => void
  ): void {
    if (data === '' || data === '[DONE]') {
      return;
    }

    try {
      if (eventType === 'connected' || (eventType === '' && data.includes('Stream de logs iniciado'))) {
        // Evento connected
        try {
          const parsed = JSON.parse(data);
          if (parsed.message) {
            console.log('✅ Conectado al stream de logs:', parsed.message);
          }
        } catch {
          console.log('✅ Conectado al stream de logs');
        }
        if (onConnected) {
          onConnected();
        }
        return;
      }

      if (eventType === 'closed') {
        console.log('🔌 Stream de logs cerrado');
        return;
      }

      if (eventType === 'log' || eventType === '' || eventType === 'message') {
        // Parsear el JSON del log
        // Si eventType está vacío o es "message", puede ser un log directo
        try {
          const logEntry: LogEntry = JSON.parse(data);
          onMessage(logEntry);
          return;
        } catch (parseError) {
          // Si falla el parseo, puede ser que el data no sea JSON válido
          console.warn('⚠️ Error parseando log como JSON:', parseError, 'Data:', data.substring(0, 200));
          // Intentar crear un log con el mensaje raw
          const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: data,
          };
          onMessage(logEntry);
          return;
        }
      }

      // Si no tiene tipo de evento específico, intentar parsear como log directamente
      try {
        const logEntry: LogEntry = JSON.parse(data);
        onMessage(logEntry);
      } catch {
        // Si no es JSON, crear log con mensaje raw
        const logEntry: LogEntry = {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: data,
        };
        onMessage(logEntry);
      }
    } catch (parseError) {
      // Si no es JSON válido, crear un log con el mensaje raw
      console.warn('⚠️ Error parseando log:', parseError, 'Data:', data.substring(0, 100));
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: data,
      };
      onMessage(logEntry);
    }
  }

  streamLogs(
    token: string,
    filter: LogFilter | undefined,
    onMessage: (log: LogEntry) => void,
    onError: (error: Error) => void,
    onConnected?: () => void
  ): () => void {
    // Construir query params
    const queryParams = new URLSearchParams();
    if (filter) {
      if (filter.level) queryParams.append('level', filter.level);
      if (filter.service) queryParams.append('service', filter.service);
      if (filter.module) queryParams.append('module', filter.module);
      if (filter.function) queryParams.append('function', filter.function);
      if (filter.business_id) queryParams.append('business_id', filter.business_id.toString());
      if (filter.user_id) queryParams.append('user_id', filter.user_id.toString());
      if (filter.search) queryParams.append('search', filter.search);
    }

    const url = `${envPublic.API_BASE_URL}/logs/stream${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    // Usar fetch con ReadableStream para SSE con headers personalizados
    let abortController: AbortController | null = null;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    const startStream = async () => {
      try {
        abortController = new AbortController();
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream',
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error conectando al stream: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No se pudo obtener el stream de respuesta');
        }

        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = '';
        let currentData = '';

        console.log('🔌 Iniciando lectura del stream SSE de logs');

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('🔌 Stream SSE cerrado');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Línea vacía indica fin de evento SSE
            if (trimmedLine === '') {
              if (currentEvent || currentData) {
                console.log('📦 Procesando evento SSE:', { event: currentEvent || 'message', dataLength: currentData.length });
                this.processSSEEvent(
                  currentEvent || 'message',
                  currentData,
                  onMessage,
                  onConnected
                );
                currentEvent = '';
                currentData = '';
              }
              continue;
            }

            if (line.startsWith('event:')) {
              // Sin espacio después de "event:"
              currentEvent = line.slice(6).trim();
              console.log('📌 Evento SSE detectado:', currentEvent);
            } else if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
              console.log('📌 Evento SSE detectado:', currentEvent);
            } else if (line.startsWith('data:')) {
              // Sin espacio después de "data:"
              const data = line.slice(5).trim();
              if (currentData) {
                currentData += '\n' + data;
              } else {
                currentData = data;
              }
            } else if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              // Acumular datos (pueden venir en múltiples líneas)
              if (currentData) {
                currentData += '\n' + data;
              } else {
                currentData = data;
              }
            } else if (line.startsWith('id: ')) {
              // Ignorar ID por ahora
              continue;
            } else if (line.startsWith('retry: ')) {
              // Ignorar retry por ahora
              continue;
            } else if (trimmedLine) {
              // Si no tiene prefijo, puede ser continuación de data o línea raw
              // Intentar parsear directamente como JSON (puede ser un log sin formato SSE)
              if (!currentEvent && !currentData) {
                try {
                  const logEntry: LogEntry = JSON.parse(trimmedLine);
                  console.log('📝 Log recibido (formato directo):', logEntry);
                  onMessage(logEntry);
                  if (onConnected) {
                    onConnected();
                  }
                  continue;
                } catch {
                  // No es JSON, tratar como continuación de data
                }
              }
              if (currentData) {
                currentData += '\n' + trimmedLine;
              }
            }
          }
        }

        // Procesar último evento si queda pendiente
        if (currentEvent || currentData) {
          console.log('📦 Procesando último evento SSE:', { event: currentEvent || 'message', dataLength: currentData.length });
          this.processSSEEvent(
            currentEvent || 'message',
            currentData,
            onMessage,
            onConnected
          );
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          onError(error);
        }
      }
    };

    startStream();

    // Retornar función para cerrar la conexión
    return () => {
      if (abortController) {
        abortController.abort();
      }
      if (reader) {
        reader.cancel();
      }
    };
  }
}
