# Cobro por día de votación con Wompi

**Fecha:** 2026-10-22 · **Área:** back (votaciones, módulo nuevo `votingbilling`) / migrador / front

## Decisiones del usuario

- Pasarela: **Wompi** (persona natural, cuenta Bancolombia/Nequi; 2,65% + $700 + IVA en 2026).
- Precio: **$50.000 por día de votación** = días calendario (hora de Colombia) entre inicio y cierre
  del grupo. Si se amplían las fechas después de pagar, se pagan solo los días que faltan.
- Sin pagar se puede preparar todo (grupo, preguntas, asistencia, contraseñas, QR); lo que se
  bloquea es **abrir/recibir votos**.
- Propiedades existentes: **exentas** (casilla que solo cambia el super admin); las nuevas pagan.

## Cómo quedó

- Tablas `horizontal_property.voting_billing_settings` (exención por propiedad) y
  `horizontal_property.voting_group_payments` (pagos: días, monto en centavos, estado de Wompi).
- Módulo `services/horizontalproperty/votingbilling` (hexagonal): estado, checkout (enlace de Web
  Checkout firmado en el back), webhook `POST /api/v1/payments/wompi/events`, sync al volver del
  pago, pago manual y exención (super admin).
- Votaciones: `IsVotingPaymentPending` (consulta replicada) bloquea `CreateVote`, `CreateBulkVotes`
  y `ActivateVoting` con `ErrVotingDayNotPaid` → **HTTP 402**.
- Front: `VotingBillingBanner` en cada grupo abierto ("Pago pendiente: 1 día · $50.000" + "Pagar con
  Wompi"); al volver con `?payment_group=<id>&id=<transacción>` confirma con `/payments/sync`.
- Variables (opcionales): `WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`,
  `WOMPI_API_URL`, `VOTING_DAY_PRICE_COP`. Llave `pub_test_…` → sandbox automáticamente.

## Hallazgos (lo que costó tiempo)

- **Las votaciones nacen activas y el voto no revisaba el estado** (`CreateVoting` guarda
  `IsActive: true`; `CreateVote` no mira `is_active`, solo el voto público por token de grupo). Por
  eso el bloqueo va en el registro del voto y no solo en "activar".
- **La tabla de propiedades es `business`, no `businesses`**: GORM usa `SingularTable: true`
  (`back/dbpostgres/app/infra/db/db.go`). El primer intento de la migración falló por eso.
- **Exención inicial "una sola vez"**: la primera versión dependía de que la tabla no existiera; al
  fallar a mitad la tabla quedaba creada y la exención no volvía a correr. Ahora se marca con el
  comentario de la tabla (`exenciones iniciales aplicadas`) en la misma transacción; verificado
  corriendo la migración dos veces.
- **Documentación de Wompi (Eventos) con un ejemplo inconsistente**: el SHA-256 de la cadena de
  ejemplo `1234-1610641025-49201APPROVED44900001530291411prod_events_…` es `5a18ec5e…`, no el
  `3476DDA5…` que muestra la página. Se implementó la fórmula documentada (valores de
  `signature.properties` + `timestamp` + secreto de eventos). El ejemplo de la firma de integridad
  sí coincide (`37c84077…`) y está como prueba.
- Wompi reintenta el webhook si no recibe 200 (30 min, 3 h, 24 h). Eventos firmados pero sin pago
  aplicable responden 200 (quedan en el log); firma inválida 401; error interno 500 (reintento).
- **Vitest no arranca con Node 20** (undici 8: `Cannot read properties of undefined (reading 'bind')`
  en las 72 suites). El CI usa Node 22; en local: `export PATH="$HOME/.nvm/versions/node/v22.23.3/bin:$PATH"`.

## Verificación

- Back: `go test ./...` y `make test-integration` sin fallos; pruebas nuevas de días, checkout,
  webhook (monto distinto, evento repetido, firma inválida), pago manual, exención, adaptador de
  Wompi (vector oficial de integridad, URL, firma de eventos, consulta con servidor falso) y bloqueo
  del voto. Mutaciones: quitar cada regla hace fallar su prueba.
- Front (Node 22): typecheck, 612 pruebas y build en verde.
- Falta: prueba punta a punta con llaves de sandbox de Wompi (las debe crear el usuario) y
  reiniciar el back local para probar los endpoints.

## Para producción (pendiente, con autorización)

- Cargar las llaves en Parameter Store `/rupu/WOMPI_*` (SecureString) y configurar en Wompi la URL
  de eventos `https://xn--rup-joa.com/api/v1/payments/wompi/events`.
- La migración en producción deja exentas a las propiedades que existan ese día.

## Prueba de punta a punta con Wompi sandbox (2026-10-22, noche)

Contra el back local con las llaves `pub_test_`/`test_integrity_`/`test_events_` de la cuenta real
(comercio "Rupu Votaciones", en revisión → modo Sandbox):

| Caso | Resultado |
|------|-----------|
| Checkout del back → transacción por API de Wompi (tarjeta 4242…) | Wompi `APPROVED`; `/payments/sync` → grupo pagado, 2 días, `CARD` |
| Tarjeta 4111… | Wompi `DECLINED`; el grupo sigue debiendo |
| Repetir el sync de un pago aprobado | Sin duplicados (1 aprobado, 2 días) |
| Webhook con firma falsa | 401, no cambia nada |
| Webhook firmado con el secreto de eventos | 200, pago `APPROVED` (`PSE`) |
| Abrir el checkout con `redirect-url` a `localhost` | 403 de CloudFront de Wompi; con `rupu.localhost` funciona |

**Producción:** las llaves sandbox quedaron en `/rupu/WOMPI_*` (públicas como String, secretos como
SecureString) y el `.env` del servidor ya las tiene, pero **el contenedor del back no las recibe**: el
`docker-compose.yaml` de producción le pasa una lista fija en `environment:` (no `env_file`). El
arreglo está en el repo (commit `34d22b9d`, rama `fix/votos-sin-tablas-de-cobro`); falta copiarlo a
`/home/ubuntu/reserve/infra/compose-prod/` (allá **no es un repo git**: los archivos se copiaron a
mano; hoy son idénticos al repo) y redesplegar el back. Falta también la URL de eventos en Wompi:
`https://xn--rup-joa.com/api/v1/payments/wompi/events`.
