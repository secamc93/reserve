# Build del front roto: pnpm 11 y error de tipos

## Síntoma

`docker build` del front fallaba en dos puntos:
1. `pnpm install`: `ERR_PNPM_IGNORED_BUILDS` (`@tailwindcss/oxide`, `sharp`, `unrs-resolver`).
2. `pnpm run build`: `Type 'string' is not assignable to type '"GET" | "POST" | ...'` en los
   repositorios de sport training.

## Causa

1. El Dockerfile hace `corepack enable pnpm` sin versión: corepack bajaba la última (11), que
   convierte en error los scripts de build no aprobados. El lockfile es de pnpm 10.33.0.
2. Los helpers `req()` declaraban `method: string` y `logHttpRequest` exige la unión de métodos.
   `main` no compilaba: la imagen nunca se habría podido construir desde `main`.

## Arreglo

1. `"packageManager": "pnpm@10.33.0"` en `front/rupu-central/package.json` (corepack lo respeta).
2. Tipado de `method` (luego el módulo de sport training se eliminó completo).

## Prevención

Correr `pnpm typecheck && pnpm build` antes de mergear (`.claude/rules/testing.md`); el PR corre
el build en CI (runner ARM).
