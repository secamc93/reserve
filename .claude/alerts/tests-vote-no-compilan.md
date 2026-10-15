# Los tests del módulo de votaciones (back) no compilan

**Fecha:** 2026-10-14 · **Prioridad:** importante

## Contexto

`go test ./...` en `back/central-reserve`: 9 paquetes OK y **7 FAIL** de build, todos en
`services/horizontalproperty/vote/internal/app/*/test`. Causa: el puerto `domain.VotingRepository`
ganó el método `DeleteAllVotesByVoting` y `mocks.MockVotingRepository` no se actualizó.

Es anterior a la limpieza de sport training / restaurants (PR #69); no lo causó ese cambio.

## Ítems

- [ ] **Importante**: agregar `DeleteAllVotesByVoting` (campo `Func` + método) al mock y correr
      `go test ./services/horizontalproperty/vote/...` en verde.
- [ ] Deseable: verificar si otros puertos del módulo tienen mocks desactualizados.

## Cierre

`cd back/central-reserve && go test ./...` sin fallos de build.
