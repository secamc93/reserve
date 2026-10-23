# Migración del cobro por día de votación pendiente en producción

**Fecha:** 2026-10-22 · **Prioridad:** importante (lo urgente se resolvió el mismo día)

## Contexto

El PR #87 (cobro con Wompi + diseño nuevo + web pública) se desplegó a producción el 2026-10-22,
pero **producción no corre el migrador en el deploy** y las tablas
`horizontal_property.voting_billing_settings` y `horizontal_property.voting_group_payments` no
existen allá. El voto consulta esas tablas: sin el parche, **todos los votos fallan**.

Resuelto el 2026-10-22 (~18:26 Bogotá) con el usuario IAM `santiago-admin` (perfil AWS CLI
`rupu` en este PC): respaldo `pg_dump -Fc` en la EC2
(`/home/ubuntu/backups/prod-antes-cobro-20261022-232238.dump`, 58 tablas con datos) y migrador
por túnel SSM (`DB_HOST=127.0.0.1 DB_PORT=15433`). Tablas creadas, Tayazal de Suba exenta, marca
"exenciones iniciales aplicadas" puesta y `GET /voting-groups/2/payment` responde exenta/pagado.
El migrador también convirtió a `time` las columnas de hora de reservas que en prod seguían en
timestamptz (lógica existente de `fixTimeColumns`).

## Ítems

- [x] 2026-10-22: migrador corrido contra producción (ver arriba).
- [x] 2026-10-22: acceso a AWS en este PC (perfil `rupu`, usuario `santiago-admin`).
- [x] 2026-10-23: compose con `WOMPI_*` copiado a producción (copia previa
      `docker-compose.yaml.bak-20261023-154503`) y back redesplegado. Pago sandbox de punta a punta en
      producción (grupo 4 "ola" de Tayazal): Wompi `APPROVED` → Rupü pagado; webhook con firma falsa 401.
- [x] 2026-10-23: comercio aprobado por Wompi; llaves de producción en `/rupu/WOMPI_*` y URL de eventos `https://xn--rup-joa.com/api/v1/payments/wompi/events` configurada en el modo producción.
- [x] 2026-10-23: `fix/votos-sin-tablas-de-cobro` fusionado (PR #89).
- [ ] Importante: Tayazal de Suba quedó **sin exención** en producción (alguien le dio "Cobrarle"
      para probar). Mientras siga así, sus asambleas reales no reciben votos sin pagar.
- [x] 2026-10-23: parche de tablas sin migrar desplegado (PR #89; sigue en `GetVotingCoverage`).
- [ ] Importante: que `deploy.sh` corra el migrador en cada deploy del back, para que no se repita.

## Cierre

Borrar cuando `deploy.sh` corra el migrador en cada deploy del back (o se adopte el parche como red).
