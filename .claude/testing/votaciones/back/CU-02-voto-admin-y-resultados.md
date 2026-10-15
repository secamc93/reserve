# CU-02 — Registrar votos desde el admin y leer resultados (API)

**Precondición:** CU-01 ejecutado (`GID`, `VID`, opciones). La propiedad tiene unidades.

## Pasos

1. `GET .../votings/$VID/unvoted-units?business_id=$BID` → todas las unidades pendientes.
2. `POST .../votings/$VID/votes?business_id=$BID` para una unidad con la opción `Sí`.
3. Repetir el mismo voto para la misma unidad.
4. `POST .../votings/$VID/votes/bulk?business_id=$BID` con dos unidades más (`No`, `Abstención`).
5. `GET .../votings/$VID/voting-details?business_id=$BID`.
6. `DELETE .../votings/$VID/votes/<vote_id>?business_id=$BID` del primer voto.

## Resultado esperado

- Paso 2: 201. Paso 3: rechazado (la unidad ya votó), sin duplicar el voto.
- Paso 5: porcentajes por **coeficiente** coherentes con los coeficientes de las unidades
  votantes; `unvoted-units` baja en 3.
- Paso 6: el voto desaparece de los detalles y la unidad vuelve a `unvoted-units`.
- Con el stream abierto (`GET .../votings/$VID/stream`), cada cambio llega como evento.
