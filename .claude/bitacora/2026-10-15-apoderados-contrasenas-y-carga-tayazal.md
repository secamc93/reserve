# Apoderados en asistencia, contraseñas de voto por unidad y carga real de Tayazal

**Fecha:** 2026-10-15 · **Área:** back / front / votaciones / datos

## Síntoma / pedido

1. "La lista de asistencia no permite agregar apoderados".
2. Cada unidad necesita una contraseña de voto por grupo, entregada impresa (PDF con QR, unidad,
   propietario y contraseña) al tomar asistencia.
3. Reemplazar los datos de prueba de Tayazal de Suba por el listado real (`listado.pdf` de Sisco,
   194 unidades con coeficientes que suman 100).

## Causa (apoderados)

El apoderado sí se creaba (`POST /attendance/proxies`) y `CreateProxy` le ponía `proxy_id` a los
registros de la unidad, pero:

- **no marcaba la asistencia**: `attended_as_proxy` quedaba en false → la unidad no contaba como
  presente, "Como apoderado" siempre 0 y la unidad no podía votar (el voto exige asistencia);
- `UpdateAttendanceRecordsByPropertyUnit` escribe el apoderado en **todas** las listas de la
  unidad (también las de asambleas pasadas);
- no se guardaba el documento del apoderado.

## Hipótesis descartadas

- "El back no vincula el apoderado al registro": falso, el nombre sí aparecía en `records`
  (`LEFT JOIN proxies ON ar.proxy_id`). Lo que faltaba era la asistencia.

## Arreglo

- `PUT/DELETE /attendance/records/:id/proxy`: apoderado solo de ese registro; al asignarlo la unidad
  queda presente como apoderado, al quitarlo queda sin asistencia. Aislamiento: la lista debe ser de
  la propiedad del token (404 si no). `MarkAttendanceSimple` marca como apoderado si el registro
  tiene uno.
- Tabla `horizontal_property.voting_credentials` (grupo, unidad, contraseña de 6 caracteres sin
  0/O/1/I/L, `crypto/rand`, en claro para poder reimprimir). `POST .../voting-groups/:id/credentials/generate`
  (solo a las que faltan; `regenerate` reemplaza todas) y `GET .../credentials` paginado.
- Si el grupo tiene contraseñas, `POST /public/validate-resident` exige `password` (400 "Contraseña
  requerida", 403 "Contraseña incorrecta"; 403 y no 401 porque el front usa 401 para "enlace vencido")
  y `voting-context` devuelve `require_password`.
- Front: botones "Generar contraseñas" y "Credenciales PDF" (jsPDF, 8 por hoja) en la lista de
  asistencia; campo de contraseña en la pantalla R1 del voto público.

## Datos

- Generador del SQL: `listado.pdf` → `pdftotext -layout` → regex por línea (código, propietario,
  bloque DUPL/CASA/LOCA/JARDI INFAN, coeficiente). Número de unidad = código (1–167, 1001–1025,
  2001, 2002); `block` = "Dúplex", "Casa", "Local", "Jardín" (es lo que imprime la credencial:
  "Casa 126"). Coeficientes tal cual (suman 100; los porcentajes se calculan relativos al total).
- Propietarios repetidos (p. ej. casas 18 y 19) = un residente con dos unidades → 189 residentes.
  Sin documento ni correo (columnas nulas). La columna "Arrendatario" del listado es texto libre
  (teléfonos, notas) y no se cargó.
- Se borraron de raíz (hard delete) votos, votaciones, grupos, listas, apoderados, residentes y
  unidades del business 1, en local y en producción.

## Descubierto

- **Producción no corre el migrador**: el deploy solo cambia imágenes. Faltaba el catálogo
  `resident_types` (se sembró a mano el 2026-10-15) y las columnas/tablas nuevas hay que crearlas
  corriendo `back/dbpostgres` contra la BD de prod (túnel SSH).

## Verificación

```bash
cd back/central-reserve && go test ./services/horizontalproperty/vote/... ./services/horizontalproperty/attendance/...
cd front/rupu-central && pnpm test
```
