// Datos de la marca y del negocio que usa todo el sitio (textos, SEO y enlaces).
// Lo que está marcado como PENDIENTE hay que confirmarlo antes de publicar.

export const SITE = {
  name: 'Rupü',
  url: 'https://xn--rup-joa.com',
  displayUrl: 'rupü.com',
  locale: 'es_CO',
  lang: 'es-CO',
  title: 'Rupü · Software de votaciones para asambleas de propiedad horizontal',
  description:
    'Votación electrónica para asambleas de propiedad horizontal: quórum en vivo, voto por coeficiente con QR desde el celular y resultados al instante. Desde $50.000.',
  keywords: [
    'software de votaciones para asambleas',
    'votación electrónica propiedad horizontal',
    'votaciones asamblea de copropietarios',
    'votación por coeficiente',
    'quórum asamblea en tiempo real',
    'votación con QR',
    'alquiler de controles de votación',
    'app votaciones conjunto residencial',
    'asamblea virtual propiedad horizontal',
    'Ley 675 de 2001',
  ],
  // Panel de administración (hoy vive en la raíz de rupü.com).
  appUrl: 'https://xn--rup-joa.com/login',
  // PENDIENTE: número de WhatsApp comercial en formato internacional sin "+", p. ej. 573001234567.
  whatsapp: '',
  // PENDIENTE: correo comercial.
  email: '',
} as const;

export const PRICING = {
  // Dato del dueño del producto (2026-10-19): precio por día de votación.
  rupuPerAssembly: 50000,
  // Referencia de mercado: tarifa publicada por un proveedor de Bogotá (sep-2026),
  // desde $8.000 por unidad por 5 horas; la hora extra se cobra aparte.
  remotesPerUnit: 8000,
  currency: 'COP',
} as const;

const demoMessage = 'Hola, quiero conocer Rupü para las votaciones de la asamblea de mi conjunto.';

/** Enlace del botón "Pide una demo": WhatsApp si hay número, si no correo, si no la sección de contacto. */
export function demoHref(): string {
  if (SITE.whatsapp) return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(demoMessage)}`;
  if (SITE.email) return `mailto:${SITE.email}?subject=${encodeURIComponent('Demo de Rupü')}&body=${encodeURIComponent(demoMessage)}`;
  return '#contacto';
}

export function formatCOP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CO');
}
