# Web pública de Rupü, puerto del front y prospección de administradoras en Facebook

**Fecha:** 2026-10-21 / 2026-10-22 · **Área:** website / entorno local / marketing

No es un soporte: se registra para retomar la venta sin repetir la investigación (cómo quedó la
web, por qué el front local cambió de puerto y cómo se sacaron los prospectos de Facebook).

## 1. Web pública (`front/website`)

- Se rehízo desde cero (antes era una plantilla de restaurante, nunca desplegada). Astro 5 estático
  + Tailwind v4 + GSAP/ScrollTrigger + Lenis. Rama `feat/website-rupu`, **sin push**.
  - `5948e345` web completa · `004a9b42` marco de iPhone real en el hero · `a0c6be08` WhatsApp.
- Enfoque: **solo votaciones de asamblea** y precio bajo ("Tu asamblea vota en minutos, no en horas").
  Secciones: hero con celular votando, timeline de la asamblea de 4h15, cómo funciona (scroll
  horizontal), simulador de 60 unidades por coeficiente, calculadora de controles vs. Rupü, FAQ.
- SEO: meta y Open Graph, JSON-LD (Organization, SoftwareApplication con oferta de $50.000, FAQPage),
  sitemap y robots. Lighthouse móvil: accesibilidad, buenas prácticas y SEO en 100.
- Contacto: `SITE.whatsapp = 573026600431` en `src/config/site.ts`; todos los "Pide una demo" abren
  WhatsApp con mensaje listo. Correo comercial vacío (opcional).
- Marco del celular: el PNG que dio el usuario traía el damero de "transparencia" **pintado**; se le
  quitó con ImageMagick (opacidad según oscuridad del píxel) y se recortó a `src/assets/phone-frame.png`
  (501×1030, pantalla con insets ~4% / 1,7% y radio 14%/6,6%).
- **Publicación (2026-10-22, decisión del usuario):** la web se compila dentro de la imagen
  `rupu-nginx` y nginx sirve la raíz de `rupü.com` (portada, `/_astro/`, OG, robots, sitemap, manifest e
  íconos); el panel conserva sus rutas. Probado en local con la imagen ARM64 y la configuración HTTPS de
  producción. Ojo: `entrypoint.sh` no exporta `SSL_CERT_PATH`/`SSL_KEY_PATH`; en producción llegan por el
  `.env` que arma `deploy.sh`. Para probar la imagen en local hay que pasarlas con `-e` (si no, `envsubst`
  deja vacío `ssl_certificate` y nginx no arranca). Wompi bloquea (403 de CloudFront) cualquier
  `redirect-url` con `localhost` o `127.0.0.1`; para probar pagos en local usar `http://rupu.localhost:3005`.
- **Pendiente previo (ya resuelto en parte):** confirmar precio ($50.000 por día de votación y referencia de
  $8.000/unidad en alquiler de controles) y decidir dónde vive (propuesta: web en la raíz de
  `rupü.com`, panel en `app.rupü.com`; toca nginx, compose-prod y CI). Detalle en `front/website/README.md`.

## 2. Entorno local: el front pasó al puerto 3005

- **Síntoma:** `dev-services.sh start all` reportó el front "sano" en el 3000, pero lo que respondía
  era el front de **otro proyecto** (`~/development/probabilityIA/front/central`, `next-server`).
  El health check solo mira que el puerto conteste, no de qué checkout es.
- **Arreglo:** `PORT=3005` en `front/rupu-central/.env.local` (ignorado) y
  `PLAYWRIGHT_BASE_URL=http://localhost:3005` en `.env.test`. El back acepta cualquier origen
  (`services/auth/middleware/cors.go`), así que no hubo que tocar CORS.
- **Verificar:** `lsof -a -p $(lsof -tiTCP:3005 -sTCP:LISTEN) -d cwd -Fn` debe mostrar
  `.../reserve/front/rupu-central`.

## 3. Prospección en Facebook (cuenta personal del usuario, Chrome)

Archivos (fuera del repo): `~/Documents/rupu-marketing/`
- `grupos-facebook-ph.csv`: 36 grupos públicos de propiedad horizontal (el mayor, *RED DE PROPIEDAD
  HORIZONTAL LEY 675 DE 2001*, 35 mil miembros y +90 publicaciones al día).
- `empresas-administracion-ph.csv`: 48 administradoras de PH en Colombia con prioridad por seguidores
  (A ≥300: 11, B 50–299: 16, C <50: 21), página, mensaje personalizado y columna `estado`.
- `gremios-ph.csv`: 10 gremios (Colegio de Administradores de PH de Cali, Consejo Distrital de PH de
  Bogotá, Liga de Consumidores PH Bogotá…), para alianzas o charlas.

Hallazgos:
- **Temporada:** las ordinarias se hacen en el primer trimestre (Ley 675). En octubre casi nadie pide
  votaciones en los grupos; las publicaciones "¿cuánto cuesta alquilar votación electrónica?" o
  "busco proveedor para asamblea de 225 propietarios" son de enero–marzo y de 2024. Hoy los grupos
  están llenos de **convocatorias** (consejos buscando administrador, CCTV, SG-SST), donde también
  publican las administradoras: ese es el contacto bueno fuera de temporada.
- Competencia visible en las búsquedas: Hatius Votación, Votaciones Inalámbricas, Asambli.com,
  "Software Administración Conjuntos Residenciales SAC".
- Lo más rendidor fue el buscador de **páginas** (`/search/pages/?q=administración propiedad
  horizontal <ciudad>`); trae ciudad, categoría y seguidores. Se filtraron a mano las de otros países,
  universidades e inmobiliarias sin relación (de 240 resultados quedaron 48 + 10 gremios).

Detalles técnicos de la extracción (para no tropezar de nuevo):
- Facebook **borra `localStorage`** al navegar entre búsquedas: lo acumulado se perdía. Funcionó
  guardar en `window.name`, que sobrevive a la navegación en la misma pestaña.
- La CSP de Facebook **bloquea `eval`**: el extractor hay que pegarlo completo en cada llamada.
- La salida de `javascript_exec` se trunca (~1.000 caracteres). Para volcar todo: poner el resultado
  en un `<pre>` dentro del `body` y leerlo con `get_page_text`.
- Las fechas de las publicaciones vienen ofuscadas en el DOM (no salen en `innerText`) y los enlaces
  del timestamp solo se llenan al pasar el mouse: para fechas y enlaces de publicaciones toca
  captura de pantalla o `hover` + `read_page`.
- El filtro "Más recientes" de la búsqueda dentro de un grupo va en el parámetro `filters` (base64);
  aun así el orden no es estrictamente cronológico.

Reglas acordadas con el usuario:
- Solo se busca y se lee automáticamente. **No** se automatiza seguir, unirse a grupos ni comentar en
  publicaciones ajenas (va contra las normas de Meta; riesgo de bloqueo de la cuenta) y Facebook cerró
  la API de grupos en 2024.
- Mensajes a administradoras: los envía el usuario, o el agente uno por uno con aprobación,
  máximo 5–10 al día.
- Plan de redes acordado: los 7 videos verticales (ver
  `2026-10-19-serie-videos-votaciones-asamblea.md`) en TikTok, Reels, Shorts y Facebook; aportar en
  grupos antes de vender; Google Business, Search Console y Ads en temporada cuando la web esté publicada.

## Siguiente frente

Pasarela de pagos para cobrar la asamblea automáticamente (persona natural, pagos a la cuenta del
usuario). Opciones en evaluación: Wompi, Mercado Pago, ePayco, Bold.
