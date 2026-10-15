# CU-03 — Votar desde el celular por QR

**Precondición:** votación activa; QR del grupo generado (modal "QR del grupo").

## Pasos

1. Abrir la URL pública del QR en un viewport de celular (390×760).
2. Elegir unidad y validar residente.
3. Elegir `Sí` y confirmar.
4. Recargar la página con la misma unidad.

## Resultado esperado

- Botones grandes por opción; "Confirmar voto: Sí" fijo abajo; aviso de que el voto es definitivo.
- Tras confirmar: "Tu voto quedó registrado: Sí" y resultados en vivo.
- El voto aparece en el panel del admin (CU-02) sin recargar.
- Al volver, no permite votar de nuevo.
