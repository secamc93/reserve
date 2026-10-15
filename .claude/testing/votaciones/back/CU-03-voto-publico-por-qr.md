# CU-03 — Voto público por QR (API pública)

**Precondición:** CU-01 ejecutado y votación activa.

## Pasos

1. `POST $API/horizontal-properties/voting-groups/$GID/generate-public-url?business_id=$BID` → URL
   con token público. Extraer el token (`TOKEN`).
2. `GET $API/public/voting-context` y `GET $API/public/voting-group/votings` con el token.
3. `GET $API/public/units-with-residents` con el token; elegir una unidad sin voto.
4. `POST $API/public/validate-resident` con la unidad.
5. `GET $API/public/voting-info` → título, opciones y porcentaje requerido.
6. `POST $API/public/vote` con la opción `Sí`.
7. Repetir el paso 6 con la misma unidad.

## Resultado esperado

- Los pasos 1–6 responden `success: true`; las rutas públicas no aceptan el JWT del admin como
  sustituto del token público.
- Paso 7 rechazado: el voto es definitivo.
- El voto aparece en `GET .../votings/$VID/voting-details` del admin y en `GET $API/public/votes`.
- Un token de otro grupo no da acceso a esta votación.
