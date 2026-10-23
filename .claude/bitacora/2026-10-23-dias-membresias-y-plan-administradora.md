# Días de votación comprados, membresías y plan de administradora

**Fecha:** 2026-10-23 · **Área:** back (votingbilling, membership, paymentevents, vote) / migrador / front
Plan: `.claude/plan/membresias-y-dias-de-votacion.md`. Rama `feat/membresias-y-dias`.

## Qué cambió

- **Se cobra por días comprados, no por el rango del grupo.** El administrador elige fechas
  ($50.000 c/u). Resuelve el caso "asamblea abierta 13 días = $650.000".
- **Membresías (30 días desde el pago, sin renovación):** `MONTH_1` $200.000 (1 conjunto),
  `ADMIN_3` $300.000, `ADMIN_5` $450.000, `ADMIN_10` $800.000, `ADMIN_20` $1.400.000; `CUSTOM` solo
  por el super admin. Valida tope y que el usuario administre los conjuntos (`business_staff`).
- **Regla del voto (dominio de `vote`):** `VotingCoverage.Covered()` = propiedad exenta, administrador
  exento, membresía vigente o día comprado (día calendario de Colombia). El repositorio solo trae
  hechos; se corrigió la regla que vivía en infra y el conteo de días duplicado.
- **Super admin:** exentar propiedad o administrador (cubre todos sus conjuntos, también los
  futuros), otorgar días o membresías como `manual` o `cortesia` (con notas).
- **Wompi:** cliente compartido `shared/payments/wompi`; **webhook único** en `paymentevents`
  (`/api/v1/payments/wompi/events`) que verifica la firma y despacha por prefijo: `DIA-` →
  votingbilling, `MEMB-` → membership.
- Tablas nuevas: `voting_days`, `voting_day_payments`, `memberships`, `membership_properties`,
  `membership_payments`, `voting_billing_user_exemptions`. `voting_group_payments` queda en desuso
  (solo pagos de prueba del 22-oct).
- Front: aviso de cobertura arriba de los grupos (comprar días con calendario, mes, enlace a
  planes; herramientas de super admin) y página `/properties/[id]/voting-groups/plans`.

## Hallazgos

- GORM creó dos FK entre `memberships` y `membership_properties`; la del has-many **no** borra en
  cascada. Para limpiar hay que borrar primero `membership_properties` (lo hace el testkit). Una
  corrida fallida dejó la propiedad de prueba "IT PH …" en la BD local; se borró a mano.
- `Activate` y `ApproveDayPayment` son idempotentes: la condición `status <> 'APPROVED'` va en el
  mismo UPDATE; si no afecta filas no se vuelven a crear días ni a mover el periodo.

## Verificación (local, Wompi sandbox)

- Back: `go test ./...` y `make test-integration` sin fallos (cobertura por día/membresía/exención,
  compra idempotente, tope del plan, administradoras, webhook por prefijo).
- Front (Node 22): typecheck, 634 pruebas, build.
- Punta a punta en local: activar votación sin día → bloqueado; compra del día por Wompi
  (APPROVED) → se activa; día borrado → bloqueado; cortesía → se activa; mes por Wompi confirmado
  por **webhook firmado** → membresía ACTIVE 30 días y la asamblea de 13 días queda cubierta;
  plan de hasta 3 con 4 conjuntos → rechazado; webhook sin firma → 401.

## Producción (pendiente, con autorización)

1. `pg_dump -Fc` y migrador por túnel SSM (producción no migra en el deploy).
2. Merge a `main` (CI despliega back y front).
3. Las asambleas de prueba "ola"/"voto prueba" de Tayazal pierden su "pagado" (era de la tabla vieja).
