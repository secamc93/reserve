# Producción temporal (EC2 rupu-prod) — pendientes

**Fecha:** 2026-10-14 · **Prioridad:** importante

## Contexto

Producción se relanzó el 2026-10-14 en una EC2 **temporal** (`rupu-prod`, t4g.medium, sin
Elastic IP, auto-apagado diario 23:59 Bogotá). Al encender: `infra/scripts/rupu-up.sh`
(enciende, actualiza DNS de rupü.com y despliega lo último por SSM). Ver
`.claude/rules/aws-infrastructure.md` y `.claude/bitacora/2026-10-14-relanzamiento-temporal-produccion.md`.

## Ítems

- [ ] **Urgente**: mergear el PR #69 (solo propiedad horizontal + CI/CD ARM + arreglo del selector
      de negocio). Hasta entonces la imagen del frontend en ECR es de febrero y en producción el
      super admin no puede elegir negocio (selector vacío).
- [ ] **Importante**: la propiedad "Tayazal de Suba" se creó con dirección provisional
      "Suba, Bogotá D.C." y sin unidades (local y producción): completar dirección y cargar
      unidades con coeficientes antes de la asamblea.
- [ ] Importante: decidir el destino de la EC2 al terminar el uso (terminar = se pierde la BD,
      que no tiene backup).
- [ ] Deseable: si va a durar, backup de la BD (pg_dump a S3) antes de cualquier apagado definitivo.

## Cierre

PR #69 mergeado y desplegado, propiedad completa, y decisión tomada sobre la EC2.
