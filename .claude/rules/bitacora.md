# Bitácora — Histórico de soportes y correcciones

`.claude/bitacora/` guarda el histórico de soportes, incidentes, correcciones y diagnósticos.
**Un archivo por caso**, nunca un archivo acumulativo. Índice: `.claude/bitacora/README.md`.

| | alerts | bitacora |
|---|---|---|
| Qué es | pendiente urgente, trabajo sin terminar | histórico de algo ya diagnosticado |
| Cuándo se borra | al resolver lo urgente | nunca |
| Se lee | al iniciar sesión, siempre | cuando el problema se parece |

1. **Antes de investigar un problema**: buscar en la bitácora un caso parecido
   (`grep -ril "<palabra>" .claude/bitacora/`).
2. **Crear entrada** cuando se investigó un problema que costó tiempo, se corrigió data, se
   descubrió un comportamiento no documentado o una hipótesis razonable resultó falsa.
3. **Dejar escritas las hipótesis descartadas.** Es la parte más útil.
4. **Datos reales**: ids, consultas SQL, comandos que reproduzcan el diagnóstico (sin secretos).
5. **Nombre**: `YYYY-MM-DD-tema-corto.md`. Actualizar el índice del README.
6. No hace falta entrada para un arreglo trivial.

Formato sugerido: Síntoma · Causa · Hipótesis descartadas · Arreglo (commit/PR) · Cómo
reproducir o verificar · Prevención.
