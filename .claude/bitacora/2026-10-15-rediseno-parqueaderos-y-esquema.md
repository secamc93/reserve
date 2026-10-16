# Rediseño de parqueaderos: bugs de esquema, catálogos y propiedad del super admin

**Fecha:** 2026-10-15 · **Área:** back / migrador / parqueaderos / zonas comunes / visitas

## Síntoma

Al probar el rediseño de parqueaderos (diseño "PH - Parqueaderos") por API, casi nada funcionaba
de punta a punta: no se podían crear cupos, ni reservas, ni listar reservas; el super admin veía
listas vacías o de todas las propiedades.

## Causas (todas confirmadas en local y en producción)

1. **Catálogos sin sembrar**: `parking_types`, `parking_reservation_statuses`, `visit_types`,
   `visit_statuses`, `common_area_types` y `common_area_reservation_statuses` vacíos. El migrador
   solo sembraba `resident_types` y estados de paquete; los de visitas estaban en
   `migrations/002_visits_tables.sql`, que no se aplica.
2. **Columnas `time` creadas como `timestamptz`**: `start_time` / `end_time` de
   `common_area_schedules`, `common_area_restrictions`, `recurring_reservation_patterns`,
   `common_area_reservations` y `parking_reservations`. El modelo dice `type:time` pero AutoMigrate
   no cambia el tipo de una columna existente → `invalid input syntax for type timestamp: "09:00"`.
3. **Estado de reserva con id fijo 1** (TODO en `create-parking-reservation.use-case.go`).
4. **Listar reservas** ordenaba por un alias `pr` inexistente (fallaba siempre) y el binding de
   `start_date` / `end_date` exigía RFC3339.
5. **Índice único `(parking_slot_id, is_active)`**: solo permitía UNA asignación liberada por cupo
   en toda su historia (la segunda liberación chocaba con la primera).
6. **Propiedad del super admin**: su business token SIEMPRE trae `business_id = 0` (aunque se pida
   para otra propiedad). Varios handlers solo miraban el token → filtraban por la propiedad 0, y
   listar cupos sin `?business_id` devolvía los de todas las propiedades. Además las tablas viejas
   del front regeneraban un token con business_id 0 y dejaban la propiedad activa en 0.
7. `common_areas` tenía índice único (business_id, name) que contaba las borradas.

## Hipótesis descartadas

- "El token del super admin pedido con business_id=X trae X": falso, trae 0. La propiedad del
  super admin siempre viaja por `?business_id`.

## Arreglo

- Migrador: siembra los seis catálogos (idempotente por código), convierte las columnas de hora si
  siguen en `timestamptz`, índices parciales (`idx_slot_one_active_assignment`,
  `idx_business_area_name_active`) y borra los viejos.
- Parqueaderos: estado por código, ORDER BY y fechas `YYYY-MM-DD`, 409 en traslape, helper
  `businessScope` (token para usuarios normales, `?business_id` obligatorio para super admin).
- Prueba de integración `parking_flow_integration_test.go` (flujo completo).

## Verificación

```bash
make run-migrations
cd back/central-reserve && set -a && . ./.env && set +a && \
  go test -tags integration ./services/horizontalproperty/parking/internal/infra/secondary/repository/ -run TestParkingFlow -count=1
```

## Prevención

- Producción no corre el migrador en el deploy: correrlo a mano tras cada cambio de esquema
  (ver memoria / alerta de producción temporal).
- Catálogos: sembrarlos en `migration_usecase.go`, nunca en SQL suelto.
