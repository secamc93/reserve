# Plan — Días de votación, membresías y plan de administradora

**Estado:** implementado y verificado en local (2026-10-23); falta producción. Rama `feat/membresias-y-dias`.

## Decisiones del usuario (2026-10-23)

- Se cobra por **días de votación comprados** de la propiedad, no por el rango de fechas del grupo.
- Productos:

| Producto | Qué cubre | Precio |
|----------|-----------|--------|
| Días sueltos | Las fechas que el administrador elige en un calendario | $50.000 por día |
| Mes (1 conjunto) | 30 días seguidos desde el pago, votaciones ilimitadas | $200.000 |
| Administradora hasta 3 conjuntos | 30 días, ilimitado en los conjuntos que elija | $300.000 |
| Administradora hasta 5 | ídem | $450.000 |
| Administradora hasta 10 | ídem | $800.000 |
| Administradora hasta 20 | ídem | $1.400.000 |
| Más de 20 | a convenir (lo registra el super admin como pago manual) | — |

- Sin renovación automática. El mes son 30 días desde el pago (hora de Colombia).
- Si la membresía vence antes de una asamblea, se compran los días que falten sueltos.

## Regla de "¿puede votar?"

Un voto (o activar una votación) se permite si **la fecha de hoy en Colombia está cubierta** para la
propiedad del grupo:

1. la propiedad está exenta, o su administradora está exenta (usuario vinculado a la propiedad en
   `business_staff`), o
2. hay una membresía activa que incluye la propiedad y la fecha, o
3. la propiedad compró ese día.

La decisión vive en el **dominio/caso de uso** del módulo de votaciones; el repositorio solo trae los
hechos (exenta, membresías vigentes, días comprados). Esto corrige los dos problemas de arquitectura
encontrados en `votingbilling` (regla de negocio en el repositorio y conteo de días duplicado: ya no
hay conteo de rangos).

## Diseño (hexagonal, módulos independientes)

### Esquema (migrador `back/dbpostgres`, espejo en `back/models`)

- `horizontal_property.voting_days` (módulo `votingbilling`): `business_id`, `voting_date` (DATE),
  `payment_id`, único `(business_id, voting_date)`.
- `horizontal_property.voting_day_payments` (`votingbilling`): pago de N fechas (referencia `DIA-…`,
  fechas en JSON/texto, monto, estado Wompi, medio, `paid_at`). Al aprobarse crea las filas de
  `voting_days`.
- `horizontal_property.memberships` (módulo `membership`): `plan_code`, `owner_user_id` (quien compra),
  `starts_at`, `ends_at`, `status`, `payment_id`.
- `horizontal_property.membership_properties` (`membership`): `membership_id`, `business_id`.
- `horizontal_property.membership_payments` (`membership`): pago de una membresía (referencia `MEMB-…`).
- `voting_billing_settings` se mantiene (exención). `voting_group_payments` queda **en desuso**
  (solo tiene pagos de prueba del 2026-10-22); no se borra.

### Módulos

- `services/horizontalproperty/votingbilling` (se ajusta): estado de cobertura de la propiedad
  (exención, membresía vigente, días comprados, próximas fechas de asambleas sin cubrir), checkout de
  días (`POST .../voting-billing/days/checkout` con `{dates:[...]}`), sync, pago manual de días,
  exención.
- `services/horizontalproperty/membership` (nuevo): catálogo de planes, checkout de membresía
  (`{plan_code, business_ids:[...]}`; valida tope del plan y que el usuario administre esas
  propiedades vía `business_staff`), sync, membresía manual (super admin), listado de membresías.
- `shared/payments/wompi` (nuevo, extraído de `votingbilling`): firma de integridad, URL de checkout,
  verificación de eventos y consulta de transacciones. Cada módulo lo envuelve con su propio puerto.
- **Webhook único** `POST /api/v1/payments/wompi/events`: verifica la firma una vez y despacha por
  prefijo de referencia (`DIA-` → `votingbilling`, `MEMB-` → `membership`; `RUPU-` legado →
  `votingbilling`). Se arma en `horizontalproperty/bundle.go` con los casos de uso de cada módulo
  detrás de una interfaz (sin compartir repositorios).
- `vote`: puerto `GetVotingCoverageFacts` (consulta replicada a exención, membresías y días) y regla
  `IsDateCovered` en el dominio; `CreateVote`, `CreateBulkVotes` y `ActivateVoting` la usan
  (`ErrVotingDayNotPaid` → 402). Se conserva el parche de tablas sin migrar (SQLSTATE 42P01).

### Front (`front/rupu-central`, módulo de votaciones)

- Aviso por propiedad arriba de los grupos: "Membresía activa hasta …" / "Hoy no tienes día de
  votación" / días comprados próximos.
- En cada grupo: fechas de la asamblea cubiertas o no, botón **Comprar días** (calendario con las
  fechas del grupo preseleccionadas, total en vivo) y **Mes $200.000**.
- Página **Planes** (administradora): elegir plan por tope y marcar los conjuntos a cubrir.
- Super admin: pago manual de días/membresía y exención.
- Super admin (pantalla "Cobro" en el panel de plataforma): exentar **propiedades** y
  **administradoras** (usuario: cubre todos sus conjuntos, también los que agregue después), dar
  **cortesías** (días o membresías sin cobro, con nota del motivo) y ver/quitar exenciones y
  cortesías con quién y cuándo. Esquema: `voting_billing_settings` suma `owner_user_id` opcional
  (exención por usuario) y los días/membresías llevan `source` (`wompi`, `manual`, `cortesia`) y `notes`.

## Pruebas

- Unitarias: regla de cobertura (exenta, membresía vigente/vencida, día comprado, día no comprado,
  zona horaria), checkout de días (fechas pasadas, ya cubiertas, duplicadas), membresía (tope del
  plan, propiedades que no administra), despacho del webhook por prefijo, adaptador Wompi.
- Integración: consultas de cobertura y de membresías contra la BD.
- Front: vista de cobertura, calendario de días, planes; typecheck, tests y build (Node 22).
- Prueba punta a punta en local con Wompi sandbox (`rupu.localhost`).

## Producción

- Antes del deploy: `pg_dump -Fc` y migrador por túnel SSM (producción no migra en el deploy).
- Tayazal sigue exenta/no exenta según lo decida el usuario.

## Pendientes

- [x] GO del usuario (2026-10-23).
- [x] Back + migración + pruebas (unitarias e integración).
- [x] Front + pruebas (634) + build.
- [x] Prueba punta a punta sandbox en local (ver bitácora 2026-10-23).
- [ ] PR, migración en producción y deploy (con autorización).
