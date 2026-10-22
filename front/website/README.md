# Sitio público de Rupü

Landing de venta de Rupü: **software de votaciones para asambleas de propiedad horizontal**.
Astro 5 estático + Tailwind 4 + GSAP/ScrollTrigger + Lenis. Una sola página larga con
animaciones de scroll, simulador de votación y calculadora de ahorro frente a controles.

```bash
npm install
npm run dev        # http://localhost:4321
npm run check      # tipos (astro check)
npm run build      # genera dist/
npm run preview    # sirve dist/
```

## Estructura

| Ruta | Qué hay |
|------|---------|
| `src/config/site.ts` | Nombre, URL, textos SEO, precios, contacto (**editar aquí**) |
| `src/config/faq.ts` | Preguntas frecuentes (página + JSON-LD `FAQPage`) |
| `src/layouts/Layout.astro` | `<head>`: SEO, Open Graph, JSON-LD (`Organization`, `WebSite`, `SoftwareApplication`, `FAQPage`) |
| `src/components/` | Una sección por archivo, en el orden de `src/pages/index.astro` |
| `src/scripts/motion.ts` | Todas las animaciones de scroll (secciones ancladas, carrusel horizontal) |
| `public/` | Favicons, `og.jpg` (1200×630), manifest |

Marca: degradado del logo `#2CD8CC → #25C5C0 → #18A0AE` (tokens `turq-*` en `src/styles/global.css`);
terracota (`clay-*`) solo para "lo de antes" (controles, conteos a mano).

## Animaciones y accesibilidad

- Las animaciones solo corren si el visitante no pidió reducir movimiento (clase `.motion` en `<html>`).
  Sin JS o con movimiento reducido, todo el contenido es visible.
- Secciones ancladas y carrusel horizontal solo en escritorio (≥1024 px); en móvil se apilan.

## Pendientes antes de publicar

- [ ] `SITE.whatsapp` y/o `SITE.email` en `src/config/site.ts`: sin ellos, "Pide una demo" baja al cierre
      de la página y el botón final lleva al panel.
- [ ] Confirmar el precio ($50.000 COP por día de votación) y la referencia de controles ($8.000/unidad).
- [ ] Decidir dónde vive: hoy `rupü.com/` es el panel (Next.js). Opciones: sitio en la raíz y panel en
      `app.rupü.com` (o en una ruta), y actualizar `SITE.appUrl`. Falta el servicio en
      `infra/compose-prod`, la ruta en `infra/nginx/nginx.conf` y el workflow de CI.
- [ ] Alta en Google Search Console y envío de `sitemap-index.xml`.
