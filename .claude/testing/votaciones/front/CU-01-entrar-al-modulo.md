# CU-01 — Entrar al módulo de votaciones como super admin

**Precondición:** front y back arriba; existe la propiedad Tayazal de Suba.

## Pasos

1. Ir a `/login`, entrar con el usuario de `.env.test`.
2. En el selector de módulo elegir **Propiedad Horizontal**.
3. En el selector de negocio (arriba a la derecha) elegir **Tayazal de Suba**.
4. Ir a **Votaciones** (`/properties/voting-groups`).

## Resultado esperado

- El selector de negocio lista Tayazal de Suba (no queda vacío).
- La página de votaciones carga sin "No se pudo cargar la información de la propiedad".
- Consola sin errores.

Regresión de `.claude/bitacora/2026-10-14-selector-de-negocio-vacio-id-fijo.md`.
Automatizado en `front/rupu-central/e2e/propiedad-horizontal-votaciones.spec.ts`.
