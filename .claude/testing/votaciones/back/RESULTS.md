# Resultados — votaciones (back)

| Fecha | Entorno | Caso | Resultado | Evidencia | Bug / commit |
|-------|---------|------|-----------|-----------|--------------|
| 2026-10-14 | worktree `ronda-votaciones` (back :3060, BD `rupu_ronda_votaciones`) | Ronda API (`ronda_api.py`: CU-01, CU-02, CU-03) | FAIL → OK | 1ª corrida 53/58; tras arreglos **57/57** en 3 corridas seguidas | ver abajo |
| 2026-10-15 | worktree `votopub-back` (back :3060, BD `rupu_votopub_back`) | Ronda API con `require_document_validation` (true/false) y SSE público con token de grupo | OK | **69/69** | rama `wt/votopub-back` |

### Bugs encontrados y corregidos en la ronda (2026-10-14)

| Bug | Arreglo |
|-----|---------|
| `resident_types` vacía: no se podían crear residentes ni importar por Excel (asume id 1) → sin voto por QR | `3171d48d` siembra owner/tenant/family |
| Super admin no podía crear unidades (token con `business_id = 0`) | `95e71e3f` acepta `?business_id` + prueba de handler |
| Voto público respondía 500 por reglas de negocio (sin asistencia, ya votó) | `74589d12` errores tipados → 403 / 409 |
| Voto masivo perdía unidades (carrera al crear la lista de asistencia) | `e706c973` ON CONFLICT + prueba de integración |
| Unidad de otra propiedad / opción de otra votación podían votar (multi-tenant) | `ddbb2414` `ValidateVoteTarget` + pruebas unitaria e integración |
| Resultados del back solo por número de votos | `b0da089e` `percentage_by_coefficient` + prueba de integración |

Hallazgos que **no** eran bugs (quedan documentados): la regla de asistencia (con lista activa
solo votan unidades con asistencia) y que `voting-group/votings` y `units-with-residents` piden
el token del residente (después de `validate-resident`), no el del QR.

