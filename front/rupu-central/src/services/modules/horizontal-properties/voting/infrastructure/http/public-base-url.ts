/**
 * Origen público del front (protocolo + host) a partir de los encabezados de la petición.
 * Lo usan las Server Actions que arman el enlace del QR (`<origen>/public/vote?token=…`).
 *
 * - Detrás de un proxy (nginx con HTTPS en producción) manda `x-forwarded-proto` /
 *   `x-forwarded-host`.
 * - Sin esos encabezados: `http` si el host es localhost, una IP (v4/v6) o trae puerto
 *   explícito (servidor de desarrollo abierto en la red local, p. ej. 192.168.3.11:3000);
 *   `https` en cualquier otro caso (dominio sin puerto).
 *
 * Lógica pura: sin dependencias de Next (recibe cualquier objeto con `get`).
 */

export interface HeaderReader {
  get(name: string): string | null | undefined;
}

/** Primer valor de un encabezado que puede venir repetido por varios proxies ("https, http"). */
const firstValue = (value: string | null | undefined): string => (value || '').split(',')[0].trim();

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

/** Separa host y puerto; soporta IPv6 entre corchetes ("[::1]:3000"). */
function splitHost(host: string): { hostname: string; port: string | null } {
  if (host.startsWith('[')) {
    const end = host.indexOf(']');
    const hostname = host.slice(1, end === -1 ? undefined : end);
    const rest = end === -1 ? '' : host.slice(end + 1);
    return { hostname, port: rest.startsWith(':') ? rest.slice(1) : null };
  }
  // IPv6 sin corchetes (varios ":"): no hay puerto que separar.
  if ((host.match(/:/g) || []).length > 1) return { hostname: host, port: null };
  const [hostname, port] = host.split(':');
  return { hostname, port: port ?? null };
}

/** true si el host es de desarrollo / red local: localhost, IP o puerto explícito. */
export function isLocalOrDirectHost(host: string): boolean {
  const { hostname, port } = splitHost(host.trim().toLowerCase());
  if (port) return true;
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return true;
  if (IPV4.test(hostname)) return true;
  return hostname.includes(':'); // IPv6
}

export function resolvePublicBaseUrl(headers: HeaderReader): string {
  const forwardedHost = firstValue(headers.get('x-forwarded-host'));
  const host = forwardedHost || firstValue(headers.get('host')) || 'localhost:3000';

  const forwardedProto = firstValue(headers.get('x-forwarded-proto')).toLowerCase();
  const protocol =
    forwardedProto === 'http' || forwardedProto === 'https'
      ? forwardedProto
      : isLocalOrDirectHost(host)
        ? 'http'
        : 'https';

  return `${protocol}://${host}`;
}
