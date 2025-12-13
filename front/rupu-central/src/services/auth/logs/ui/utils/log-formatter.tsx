import React from 'react';
import { LogEntry } from '../../domain/entities';
import { renderAnsiText, getLevelColor } from './ansi-parser';

/**
 * Convierte el nivel de log a formato abreviado (como en terminal)
 */
function getLevelAbbreviation(level?: string): string {
  if (!level) return 'INF';
  const levelLower = level.toLowerCase();
  
  const abbreviations: Record<string, string> = {
    error: 'ERR',
    err: 'ERR',
    warn: 'WRN',
    warning: 'WRN',
    wrn: 'WRN',
    info: 'INF',
    inf: 'INF',
    debug: 'DBG',
    dbg: 'DBG',
    trace: 'TRC',
  };
  
  return abbreviations[levelLower] || 'INF';
}

/**
 * Formatea un timestamp a formato MM-DD HH:MM:SS
 */
function formatTimestamp(timestamp: string): string {
  if (!timestamp) {
    // Si no hay timestamp, usar la hora actual
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  try {
    // Intentar parsear como ISO string o timestamp
    let date: Date;
    
    // Si ya está en formato MM-DD HH:MM:SS, retornarlo
    if (/^\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(timestamp)) {
      return timestamp.substring(0, 17);
    }
    
    // Intentar parsear como ISO string
    date = new Date(timestamp);
    
    // Verificar que la fecha es válida
    if (isNaN(date.getTime())) {
      // Intentar otros formatos
      const match = timestamp.match(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        return `${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
      }
      // Si no se puede parsear, retornar timestamp truncado
      return timestamp.substring(0, 17);
    }
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    // Si falla todo, retornar el timestamp original truncado
    return timestamp.substring(0, 17);
  }
}

/**
 * Construye la estructura completa del log como en la terminal
 */
function buildLogStructure(log: LogEntry): string {
  const parts: string[] = [];
  
  // Agregar campos estructurados si existen
  if (log.service) parts.push(`service=${log.service}`);
  if (log.module) parts.push(`module=${log.module}`);
  if (log.function) parts.push(`function=${log.function}`);
  if (log.business_id) parts.push(`business_id=${log.business_id}`);
  if (log.user_id) parts.push(`user_id=${log.user_id}`);
  
  // Agregar campos adicionales del objeto fields
  if (log.fields) {
    Object.entries(log.fields).forEach(([key, value]) => {
      // Excluir campos que ya están en el nivel superior
      if (key !== 'service' && key !== 'module' && key !== 'function' && 
          key !== 'business_id' && key !== 'user_id' && key !== 'level' && 
          key !== 'message' && key !== 'timestamp' && key !== 'time') {
        const valueStr = typeof value === 'string' 
          ? (value.includes(' ') ? `"${value}"` : value)
          : String(value);
        parts.push(`${key}=${valueStr}`);
      }
    });
  }
  
  return parts.join(' ');
}

/**
 * Formatea un log con el mismo formato que en la terminal
 * Formato: MM-DD HH:MM:SS LEVEL [Type] key=value key=value ... message
 */
export function formatLogEntry(log: LogEntry): React.ReactNode {
  const timestamp = formatTimestamp(log.timestamp);
  const levelAbbr = getLevelAbbreviation(log.level);
  const levelColor = getLevelColor(log.level);
  const structure = buildLogStructure(log);
  
  // Construir el log completo
  let logLine = `${timestamp} ${levelAbbr} `;
  
  // Si hay estructura, agregarla antes del mensaje
  if (structure) {
    logLine += `${structure} `;
  }
  
  // El mensaje puede venir con códigos ANSI o sin ellos
  const hasAnsi = /(?:\x1b\[|\033\[|\[)([0-9;]+)m/.test(log.message);
  
  // Si el mensaje ya tiene formato completo (como logs GIN), usarlo directamente
  // Si no, construir el formato completo
  const messageToRender = log.message;
  
  return (
    <span className="whitespace-pre-wrap break-words">
      <span className="text-gray-500">{timestamp}</span>{' '}
      <span className={levelColor}>{levelAbbr}</span>{' '}
      {structure && (
        <span className="text-gray-400">{structure} </span>
      )}
      {hasAnsi ? (
        renderAnsiText(messageToRender, levelColor)
      ) : (
        <span className={levelColor}>{messageToRender}</span>
      )}
    </span>
  );
}

/**
 * Formatea un log de forma simple (solo timestamp, nivel y mensaje)
 * Útil cuando el mensaje ya viene formateado (como logs GIN)
 */
export function formatLogEntrySimple(log: LogEntry): React.ReactNode {
  const timestamp = formatTimestamp(log.timestamp);
  const levelAbbr = getLevelAbbreviation(log.level);
  const levelColor = getLevelColor(log.level);
  const hasAnsi = /(?:\x1b\[|\033\[|\[)([0-9;]+)m/.test(log.message);
  
  // Si el mensaje ya tiene formato completo (como [GIN] logs), no agregar timestamp duplicado
  const messageStartsWithTimestamp = /^\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(log.message);
  const messageStartsWithGin = log.message.startsWith('[GIN]');
  
  // Construir estructura completa del log
  const structure = buildLogStructure(log);
  
  if (messageStartsWithGin || messageStartsWithTimestamp) {
    // El mensaje ya está formateado, solo renderizarlo con colores
    return (
      <span className="whitespace-pre-wrap break-words">
        {hasAnsi ? (
          renderAnsiText(log.message, levelColor)
        ) : (
          <span className={levelColor}>{log.message}</span>
        )}
      </span>
    );
  }
  
  // Formato completo con timestamp, nivel y estructura (como en terminal)
  return (
    <span className="whitespace-pre-wrap break-words">
      <span className="text-gray-500">{timestamp}</span>{' '}
      <span className={levelColor}>{levelAbbr}</span>
      {structure && (
        <>
          {' '}
          <span className="text-gray-400">{structure}</span>
        </>
      )}
      {' '}
      {hasAnsi ? (
        renderAnsiText(log.message, levelColor)
      ) : (
        <span className={levelColor}>{log.message}</span>
      )}
    </span>
  );
}
