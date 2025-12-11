/**
 * Caso de uso: Stream de logs en tiempo real
 */

import { ILogsRepository } from '../domain/ports';
import { LogFilter, LogEntry } from '../domain/entities';

export class StreamLogsUseCase {
  constructor(private readonly logsRepository: ILogsRepository) {}

  execute(
    token: string,
    filter: LogFilter | undefined,
    onMessage: (log: LogEntry) => void,
    onError: (error: Error) => void,
    onConnected?: () => void
  ): () => void {
    return this.logsRepository.streamLogs(token, filter, onMessage, onError, onConnected);
  }
}
