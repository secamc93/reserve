/**
 * Sistema visual del módulo de votaciones (rediseño "Votaciones - Rediseño").
 *
 * Papel neutro + tinta, un único acento terracota reservado para el quórum y
 * las acciones, y colores saturados solo para las opciones de voto.
 * Lo legal es el % por coeficiente; el conteo de unidades es secundario.
 */

import { DS as VT } from '@/shared/ui/ds/tokens';

export { VT };

/**
 * Quórum por defecto cuando la votación no trae `requiredPercentage`
 * (o viene en 0). Valor documentado en el diseño: 51% del coeficiente.
 */
export const DEFAULT_QUORUM_PERCENTAGE = 51;

/** Colores de respaldo para opciones que no son Sí / No / Abstención. */
const FALLBACK_OPTION_COLORS = ['#2f6690', '#b07d2b', '#6d4c91', '#2a7f7a', '#9a4f6b', '#55606e'];

const normalize = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase();

export type OptionKind = 'yes' | 'no' | 'abstain' | 'other';

/** Clasifica una opción por su texto o código (Sí/No/Abstención o "otra"). */
export function getOptionKind(text?: string | null, code?: string | null): OptionKind {
  const candidates = [normalize(text), normalize(code)];
  if (candidates.some((c) => c === 'SI' || c === 'YES' || c === 'A FAVOR' || c === 'APRUEBO' || c === 'S')) return 'yes';
  if (candidates.some((c) => c === 'NO' || c === 'EN CONTRA' || c === 'NO APRUEBO' || c === 'N')) return 'no';
  if (candidates.some((c) => c.startsWith('ABST') || c === 'ABS' || c === 'EN BLANCO' || c === 'BLANCO')) return 'abstain';
  return 'other';
}

const isValidColor = (color?: string | null): color is string =>
  !!color && color !== 'undefined' && color !== 'null' && color.trim() !== '';

/**
 * Color de una opción: Sí/No/Abstención usan la paleta del diseño; las demás
 * usan el color configurado en la opción y, si no existe, uno de respaldo.
 */
export function resolveOptionColor(
  text?: string | null,
  code?: string | null,
  configuredColor?: string | null,
  fallbackIndex = 0
): string {
  const kind = getOptionKind(text, code);
  if (kind === 'yes') return VT.yes;
  if (kind === 'no') return VT.no;
  if (kind === 'abstain') return VT.abstain;
  if (isValidColor(configuredColor)) return configuredColor;
  return FALLBACK_OPTION_COLORS[Math.abs(fallbackIndex) % FALLBACK_OPTION_COLORS.length];
}

/** Opción mínima necesaria para construir la paleta. */
export interface PaletteOption {
  id: number;
  text: string;
  code?: string | null;
  color?: string | null;
}

/** Mapa texto-de-opción -> color, coherente en todas las piezas de una pantalla. */
export function buildOptionPalette(options: PaletteOption[]) {
  const byText = new Map<string, string>();
  const byId = new Map<number, string>();
  let otherIndex = 0;
  options.forEach((option) => {
    const kind = getOptionKind(option.text, option.code);
    const color = resolveOptionColor(option.text, option.code, option.color, kind === 'other' ? otherIndex++ : 0);
    byText.set(normalize(option.text), color);
    byId.set(option.id, color);
  });

  return {
    byId: (id?: number | null) => (id != null ? byId.get(id) : undefined),
    /** Resuelve el color por texto de opción (con respaldo si no está en la paleta). */
    forText: (text?: string | null, fallbackColor?: string | null) =>
      byText.get(normalize(text)) ?? resolveOptionColor(text, null, fallbackColor),
  };
}

export type OptionPalette = ReturnType<typeof buildOptionPalette>;

/** Quórum efectivo de la votación (usa el valor por defecto si no viene). */
export function resolveQuorum(requiredPercentage?: number | null): number {
  return typeof requiredPercentage === 'number' && Number.isFinite(requiredPercentage) && requiredPercentage > 0
    ? Math.min(requiredPercentage, 100)
    : DEFAULT_QUORUM_PERCENTAGE;
}

const pctFormatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const coefFormatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Porcentaje con 1 decimal (formato es-CO). */
export const formatPct = (value: number) => pctFormatter.format(Number.isFinite(value) ? value : 0);
/** Coeficiente con 2 decimales (formato es-CO). */
export const formatCoef = (value: number) => coefFormatter.format(Number.isFinite(value) ? value : 0);
/** Número de orden con dos dígitos (01, 02...). */
export const formatOrder = (value?: number | null) => String(value ?? 0).padStart(2, '0');

export interface QuorumStatus {
  reached: boolean;
  missing: number;
  bg: string;
  fg: string;
  label: string;
  short: string;
}

/** Estado del quórum: participación (por coeficiente) frente al umbral. */
export function getQuorumStatus(participation: number, quorum: number): QuorumStatus {
  const reached = participation >= quorum;
  const missing = Math.max(0, quorum - participation);
  return {
    reached,
    missing,
    bg: reached ? VT.reachedBg : VT.missingBg,
    fg: reached ? VT.reachedFg : VT.missingFg,
    label: reached ? 'Quórum alcanzado' : `Faltan ${formatPct(missing)} pts para quórum`,
    short: reached ? 'Sí' : `−${formatPct(missing)}`,
  };
}

/** Segmento de la barra apilada / dona (porcentaje por coeficiente sobre 100). */
export interface ResultSegment {
  key: string;
  label: string;
  color: string;
  /** % por coeficiente (0–100). */
  pct: number;
  /** Unidades que votaron por la opción. */
  votes: number;
  /** Suma de coeficientes. */
  coef: number;
}

/** Devuelve el segmento ganador (mayor % por coeficiente con votos), si existe. */
export function getWinner(segments: ResultSegment[]): ResultSegment | null {
  const voted = segments.filter((s) => s.votes > 0);
  if (voted.length === 0) return null;
  return voted.reduce((best, s) => (s.pct > best.pct ? s : best), voted[0]);
}

/**
 * Agrupación por torre a partir del número de unidad.
 * Los datos de unidad no traen torre: se infiere del prefijo
 * ("T2-804" -> "Torre 2", "Torre A - 101" -> "Torre A", "B-12" -> "B").
 * Si no hay prefijo reconocible, todas quedan en un único grupo.
 */
export function getTowerName(unitNumber: string): string | null {
  const value = (unitNumber || '').trim();
  const match = value.match(/^(.+?)\s*[-_/·.]\s*([^-_/·.]+)$/) || value.match(/^(.+?)\s+(\S+)$/);
  if (!match) return null;
  const prefix = match[1].trim();
  if (!prefix) return null;
  const towerShort = prefix.match(/^T(?:orre)?\s*([A-Za-z0-9]+)$/i);
  if (towerShort) return `Torre ${towerShort[1].toUpperCase()}`;
  return prefix;
}

/** Etiqueta corta de la unidad dentro de su torre (sin el prefijo de torre). */
export function getUnitShortLabel(unitNumber: string, tower: string | null): string {
  if (!tower) return unitNumber;
  const match = unitNumber.trim().match(/^(.+?)\s*[-_/·.\s]\s*([^-_/·.\s]+)$/);
  return match ? match[2] : unitNumber;
}
