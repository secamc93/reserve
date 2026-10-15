import { describe, expect, it } from 'vitest';
import { isLocalOrDirectHost, resolvePublicBaseUrl } from './public-base-url';

const h = (values: Record<string, string>) => new Headers(values);

describe('resolvePublicBaseUrl', () => {
  it('localhost sin proxy -> http', () => {
    expect(resolvePublicBaseUrl(h({ host: 'localhost' }))).toBe('http://localhost');
    expect(resolvePublicBaseUrl(h({ host: 'localhost:3000' }))).toBe('http://localhost:3000');
  });

  it('127.0.0.1:3000 -> http', () => {
    expect(resolvePublicBaseUrl(h({ host: '127.0.0.1:3000' }))).toBe('http://127.0.0.1:3000');
  });

  it('IP de la red local con puerto (192.168.3.11:3000) -> http, no https', () => {
    expect(resolvePublicBaseUrl(h({ host: '192.168.3.11:3000' }))).toBe('http://192.168.3.11:3000');
  });

  it('IPv6 -> http', () => {
    expect(resolvePublicBaseUrl(h({ host: '[::1]:3000' }))).toBe('http://[::1]:3000');
    expect(resolvePublicBaseUrl(h({ host: '[fe80::1]' }))).toBe('http://[fe80::1]');
  });

  it('rupü.com detrás de nginx con HTTPS usa los x-forwarded-*', () => {
    expect(
      resolvePublicBaseUrl(h({ host: 'frontend:3000', 'x-forwarded-host': 'xn--rup-joa.com', 'x-forwarded-proto': 'https' }))
    ).toBe('https://xn--rup-joa.com');
    // nginx de producción manda Host del dominio + X-Forwarded-Proto
    expect(resolvePublicBaseUrl(h({ host: 'xn--rup-joa.com', 'x-forwarded-proto': 'https' }))).toBe('https://xn--rup-joa.com');
  });

  it('x-forwarded-proto con varios valores toma el primero', () => {
    expect(resolvePublicBaseUrl(h({ host: 'xn--rup-joa.com', 'x-forwarded-proto': 'https, http' }))).toBe('https://xn--rup-joa.com');
  });

  it('el x-forwarded-proto manda aunque el host sea una IP (Next lo pone en http en la red local)', () => {
    expect(resolvePublicBaseUrl(h({ host: '192.168.3.11:3020', 'x-forwarded-proto': 'http' }))).toBe('http://192.168.3.11:3020');
  });

  it('dominio sin puerto y sin encabezados de proxy -> https', () => {
    expect(resolvePublicBaseUrl(h({ host: 'xn--rup-joa.com' }))).toBe('https://xn--rup-joa.com');
  });

  it('sin host usa localhost:3000', () => {
    expect(resolvePublicBaseUrl(h({}))).toBe('http://localhost:3000');
  });
});

describe('isLocalOrDirectHost', () => {
  it('distingue dominios de hosts locales', () => {
    expect(isLocalOrDirectHost('app.localhost')).toBe(true);
    expect(isLocalOrDirectHost('ejemplo.com:8443')).toBe(true);
    expect(isLocalOrDirectHost('ejemplo.com')).toBe(false);
  });
});
