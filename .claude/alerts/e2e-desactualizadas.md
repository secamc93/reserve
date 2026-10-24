# Alerta — Pruebas e2e desactualizadas (2026-10-23)

Al correr en local (`pnpm test:e2e`, front 3005 / back 3060) para el PR #92 (tutoriales y recorrido
guiado), fallan specs que ya fallaban **sin** ese cambio: describen pantallas que el producto quitó.

| Spec | Qué espera | Qué hay hoy |
|------|-----------|-------------|
| `e2e/propiedad-horizontal-votaciones.spec.ts` | redirección a `/select-type` | se quitó el selector de módulo (2026-10-14): el super admin va a `/properties` |
| `e2e/votaciones-flujo-admin.spec.ts` | `/select-type` | ídem |
| `e2e/movil-navegacion.spec.ts` (3 tests) | escritorio sin `banner`; selector de propiedad (combobox) dentro del menú del teléfono | navegación flotante con barra superior; la propiedad se cambia con "Cambiar propiedad" |

Verificación: se corrió `propiedad-horizontal-votaciones` con `e2e/helpers.ts` de `HEAD` (sin el
cambio del PR) y falla igual en `/select-type`.

Nota: con la máquina muy cargada (load > 20) el login de los e2e se queda en "Iniciando sesión…"
y se ven timeouts de `waitForURL`; correr con `--workers=1` y la carga baja.

## Ítems

- **Importante:** actualizar los specs al flujo actual (sin `/select-type`, navegación flotante,
  "Cambiar propiedad"). No desactivarlos.

## Criterio de cierre

`pnpm test:e2e` de esos specs en verde contra local.
