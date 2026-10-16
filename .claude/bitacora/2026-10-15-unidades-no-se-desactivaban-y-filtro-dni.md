# Unidades que no se podían desactivar y filtro por documento de residentes ignorado

**Fecha:** 2026-10-15 · **Área:** back (unit, resident) · **Rama:** wt/ph-unidades (rediseño de Unidades y Residentes)

## Síntoma

- Editar una unidad y desmarcar "activa" respondía 200 pero la unidad seguía activa.
- Filtrar residentes por DNI (`?dni=`) devolvía todos los residentes.
- Crear/editar una unidad desde el front nunca guardaba el coeficiente (el formulario no lo tenía
  y el repositorio del front no enviaba `participation_coefficient`).

## Causa

- `PropertyUnitRepository.UpdatePropertyUnit` usaba `Updates(&models.PropertyUnit{...})`: GORM omite
  los valores cero de un struct, así que `is_active=false` (y un coeficiente 0) no se escribían.
- `ResidentFiltersRequest` recibía `dni` y el mapper lo pasaba al DTO, pero
  `ResidentRepository.ListResidents` no aplicaba ningún `WHERE` con él.

## Hipótesis descartadas

- Que el caso de uso no copiara `IsActive`: sí lo copia (`existing.IsActive = *dto.IsActive`).

## Arreglo

- `UpdatePropertyUnit` con `Select(...)` explícito de las columnas editables (commit del back en
  wt/ph-unidades). Prueba de integración que falla sin el arreglo:
  `unit/internal/app/test/summary_and_occupancy_integration_test.go` ("desactivar una unidad se guarda").
- `ListResidents` filtra `residents.dni ILIKE ?` en conteo y consulta (prueba de integración
  `resident/internal/app/test/summary_and_list_integration_test.go`).
- El formulario de unidad tiene "Coeficiente de copropiedad" y el repositorio lo envía.

## Cómo verificar

```bash
cd back/central-reserve && set -a && . ./.env && set +a
go test -tags=integration -count=1 ./services/horizontalproperty/unit/... ./services/horizontalproperty/resident/...
```

## Prevención

- En repositorios GORM, `Updates` con struct solo para cambios parciales donde el cero no importe;
  si un campo puede volver a cero/false, usar `Select` o un `map`.
