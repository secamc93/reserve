/**
 * Entidad de dominio: LogEntry (Entrada de log)
 */

export interface LogEntry {
  timestamp: string;
  level: string;
  service?: string;
  module?: string;
  function?: string;
  message: string;
  fields?: Record<string, unknown>;
  business_id?: number;
  user_id?: number;
}

export interface LogFilter {
  level?: string;
  service?: string;
  module?: string;
  function?: string;
  business_id?: number;
  user_id?: number;
  search?: string;
}

export interface StreamLogsParams {
  token: string;
  filter?: LogFilter;
}
