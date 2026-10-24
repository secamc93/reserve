# Filtros de usuarios por rol y propiedad siempre vacíos

## Síntoma

En el rediseño de Accesos, `/iam/roles` mostraba "0 usuarios con este rol" para Portería, aunque
dos usuarios lo tenían, y el filtro "Rol" de `/iam/users` dejaba la lista vacía. El filtro
"Propiedad" fallaba igual.

## Causa

`GET /api/v1/users?role_id=` y `?business_id=` filtraban con subconsultas sobre las tablas viejas
`user_roles` y `user_businesses`. Hoy el rol y la propiedad de un usuario viven en
`business_staff` (`user_id`, `business_id`, `role_id`). En una BD nueva `user_businesses` queda
vacía y `user_roles` solo tiene la fila del super admin.

```sql
select count(*) from user_roles;        -- 1
select count(*) from user_businesses;   -- 0
select count(*) from business_staff;    -- una fila por usuario y propiedad
```

## Hipótesis descartadas

- *El front no manda `role_id`*: sí lo manda; `curl "$API/users?role_id=3"` también devuelve
  `total: 0`.
- *Faltan datos de la semilla*: las asignaciones existían en `business_staff`
  (`POST /users/:id/assign-role` respondió `success`).

## Arreglo

`back/central-reserve/services/auth/users/internal/infra/secondary/repository/user_repository.go`:
las dos subconsultas leen `business_staff` con el modelo GORM, que además ignora las filas con
soft delete. Prueba: `get_users_filters_integration_test.go` (tag `integration`), que fallaba
antes del cambio. Rama `feat/rediseno-ui`.

## Cómo verificar

```bash
make test-integration   # o, desde back/central-reserve con su .env cargado:
go test -tags integration -run TestGetUsers_FiltraPorRol ./services/auth/users/internal/infra/secondary/repository/
```

## Prevención

`user_roles` y `user_businesses` ya no se escriben: cualquier consulta nueva sobre roles o
propiedades de un usuario va a `business_staff`.
