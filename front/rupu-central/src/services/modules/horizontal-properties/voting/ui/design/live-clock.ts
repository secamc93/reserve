/**
 * Reloj de la pantalla de asistencia en vivo: hora local del equipo que proyecta,
 * en formato de 12 horas como se lee en Colombia ("08:05:09 p. m.").
 */

const pad = (n: number) => String(n).padStart(2, '0');

export interface ClockParts {
  /** "08:05:09" */
  time: string;
  /** "a. m." | "p. m." */
  period: string;
}

export function formatClock(date: Date): ClockParts {
  const hours = date.getHours();
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return {
    time: `${pad(h12)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    period: hours < 12 ? 'a. m.' : 'p. m.',
  };
}

const dateFormatter = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** "jueves, 16 de octubre de 2026" */
export const formatClockDate = (date: Date) => dateFormatter.format(date);
