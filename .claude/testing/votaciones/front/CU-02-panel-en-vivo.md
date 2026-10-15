# CU-02 — Panel en vivo: registrar y anular votos

**Precondición:** CU-01 front; una votación activa con opciones Sí/No/Abstención (CU-01 back).

## Pasos

1. Abrir la votación en vivo desde el grupo.
2. Registrar un voto `Sí` para una unidad pendiente (clic en su ficha o "Registrar voto").
3. Registrar un voto `No` con "Masiva" para dos unidades.
4. Anular el voto del paso 2 (clic en la ficha ya votada).
5. Abrir "Ver resultados" (dona).

## Resultado esperado

- La barra apilada y los porcentajes (por coeficiente) se actualizan sin recargar.
- La marca de quórum está en el porcentaje requerido de la votación (51 % si no tiene).
- Filtro "Pendientes" cuenta las unidades sin voto; la ficha anulada vuelve a pendiente.
- La dona muestra la opción ganadora y la marca de quórum.
- Consola sin errores; ninguna petición 4xx/5xx inesperada.
