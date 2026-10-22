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

- [x] `SITE.whatsapp` en `src/config/site.ts` (2026-10-22: +57 302 660 0431). Todos los "Pide una demo"
      abren WhatsApp con un mensaje listo. `SITE.email` sigue vacío (opcional).
- [x] Precio confirmado por el usuario (2026-10-22): $50.000 COP por día de votación.
- [ ] Confirmar la referencia de controles ($8.000/unidad).
- [x] Dónde vive (2026-10-22): **dentro de la imagen del nginx de producción** (`infra/nginx/Dockerfile`
      la compila con `--build-context website=../../front/website`). nginx sirve `/`, `/_astro/`, el OG,
      robots, sitemap, manifest e íconos; el resto de rutas sigue siendo el panel. Sale con el workflow
      `nginx-ci-cd.yml` (también se dispara con cambios en `front/website/**`). Se apaga con la EC2 a las
      23:59; para tenerla 24/7 habría que pasarla a S3 + CloudFront.
- [ ] Alta en Google Search Console y envío de `sitemap-index.xml`.
