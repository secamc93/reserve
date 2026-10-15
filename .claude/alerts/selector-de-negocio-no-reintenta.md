# El selector de negocio a veces queda vacío

**Fecha:** 2026-10-14 · **Prioridad:** deseable (mitigado con reintento; se cierra con el plan de propiedad única)

## Contexto

`front/rupu-central/src/shared/ui/business-dropdown.tsx` carga la lista de negocios una sola vez en
el `useEffect` de montaje. Bajo carga (e2e en paralelo) a veces el `<select>` no llega a mostrar
"Tayazal de Suba" en 20 s, y no reintenta: el usuario ve el selector vacío hasta recargar. Los e2e
recargan una vez para no quedar intermitentes.

## Ítems

- [ ] Importante: el plan `.claude/plan/propiedad-unica-sin-tipo-de-negocio.md` elimina este selector
      (entrada directa a la propiedad + "Cambiar propiedad"). Al ejecutarlo, quitar también la recarga
      de los e2e (`e2e/votaciones-flujo-admin.spec.ts`, `e2e/propiedad-horizontal-votaciones.spec.ts`).
- [x] 2026-10-15: reintento con espera creciente (`shared/utils/retry-until.ts`, 8 intentos) mientras falta el token o la lista llega vacía. e2e 16/16 en 4 corridas en paralelo. Queda el ítem del plan (eliminar el selector y la recarga defensiva de los e2e).

## Cierre

Selector eliminado (o con reintento) y e2e sin la recarga defensiva.
