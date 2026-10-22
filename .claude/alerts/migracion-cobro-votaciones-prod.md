# Migración del cobro por día de votación pendiente en producción

**Fecha:** 2026-10-22 · **Prioridad:** urgente

## Contexto

El PR #87 (cobro con Wompi + diseño nuevo + web pública) se desplegó a producción el 2026-10-22,
pero **producción no corre el migrador en el deploy** y las tablas
`horizontal_property.voting_billing_settings` y `horizontal_property.voting_group_payments` no
existen allá. El voto consulta esas tablas: sin el parche, **todos los votos fallan**.

Desde este PC no se pudo migrar: no hay `cam.pem`, el puerto 22 de la EC2 no responde y no hay
perfil AWS de la cuenta 334689162817 (el perfil `default` no existe).

## Ítems

- [ ] **Urgente**: desplegar el parche `fix/votos-sin-tablas-de-cobro` (el voto no se bloquea si
      faltan las tablas, SQLSTATE 42P01) o, mejor, correr el migrador contra la BD de producción.
- [ ] **Urgente**: correr `back/dbpostgres` contra producción (túnel SSH como el 2026-10-15). Crea las
      dos tablas y deja **exentas** a las propiedades existentes (marca de una sola vez).
- [ ] Importante: recuperar acceso (cam.pem / perfil AWS `default`) en este PC.
- [ ] Importante: que `deploy.sh` corra el migrador en cada deploy del back, para que no se repita.

## Cierre

Tablas creadas en producción, propiedades actuales exentas y una votación de prueba registrando votos.
