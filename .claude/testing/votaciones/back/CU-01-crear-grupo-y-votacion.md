# CU-01 — Crear grupo de votación, votación y opciones (API)

**Precondición:** back arriba, `BT` de super admin, `BID` de la propiedad (ver `../shared/datos-prueba.md`).

## Pasos

1. `POST $API/horizontal-properties/voting-groups?business_id=$BID` con nombre de grupo propio de la corrida.
   Guardar `GID`.
2. `GET $API/horizontal-properties/voting-groups?business_id=$BID` → el grupo aparece en la lista.
3. `POST $API/horizontal-properties/voting-groups/$GID/votings?business_id=$BID` con título y
   porcentaje requerido (quórum). Guardar `VID`.
4. `POST .../votings/$VID/options?business_id=$BID` tres veces: `Sí`, `No`, `Abstención`.
5. `GET .../votings/$VID/options?business_id=$BID`.
6. `PATCH .../votings/$VID/activate?business_id=$BID`.

## Resultado esperado

- Todas las respuestas `success: true` (201/200).
- La lista de opciones tiene exactamente las 3 creadas, en orden.
- Tras activar, `GET .../votings?business_id=$BID` muestra la votación activa.
- Sin `?business_id` el super admin recibe 400 "business_id requerido".
