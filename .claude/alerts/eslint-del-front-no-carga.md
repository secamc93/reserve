# ESLint del front no carga su configuración

**Fecha:** 2026-10-14 · **Prioridad:** importante

## Contexto

`cd front/rupu-central && npx eslint <archivo>` falla antes de revisar nada: error en
`@eslint/eslintrc` (`ConfigArrayFactory._loadExtendedShareableConfig`) al cargar un `extends` de
`eslint.config.mjs`. Ya pasaba antes de la ronda de pruebas; no lo causó ningún cambio reciente.
Mientras tanto el front se valida con `pnpm typecheck`, `pnpm test`, `pnpm build` y los e2e.

## Ítems

- [ ] Importante: corregir `eslint.config.mjs` (probablemente un `extends` de `next` incompatible
      con la versión de ESLint 9 / flat config) y que `pnpm lint` corra en verde.
- [ ] Deseable: agregar `pnpm lint` al job `unit-tests` del CI del front cuando esté en verde.

## Cierre

`pnpm lint` sin errores de configuración.
