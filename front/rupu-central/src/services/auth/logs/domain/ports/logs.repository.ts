/**
 * Puerto de dominio: Repositorio de Logs
 */

import { LogEntry, LogFilter } from '../entities';

export interface ILogsRepository {
  /**
   * Stream de logs en tiempo real usando Server-Sent Events
   * @param token Token de autenticación
   * @param filter Filtros opcionales para los logs
   * @param onMessage Callback cuando se recibe un nuevo log
   * @param onError Callback cuando ocurre un error
   * @param onConnected Callback opcional cuando se establece la conexión
   * @returns Función para cerrar la conexión
   */
  streamLogs(
    token: string,
    filter: LogFilter | undefined,
    onMessage: (log: LogEntry) => void,
    onError: (error: Error) => void,
    onConnected?: () => void
  ): () => void;
}
