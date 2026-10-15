# Voto masivo pierde unidades: carrera al crear la lista de asistencia

## Síntoma

En la ronda de pruebas de votaciones, el primer voto masivo de un grupo con
`auto_mark_attendance: true` registraba solo parte de las unidades:
`"Votación masiva completada: 1 exitosos, 1 fallidos"`, con
`{"property_unit_id": 2, "success": false, "error": "unidad no registra asistencia"}`.
Intermitente: en una corrida pasaron las 2 unidades, en las siguientes falló una.

## Causa

`usecasevotes.CreateBulkVotes` procesa las unidades en goroutines. Cada una llama
`repo.MarkUnitAttendanceForVoting`, que hace "buscar la lista de asistencia activa del grupo y,
si no existe, crearla". En el primer voto masivo de un grupo varias goroutines no la encuentran
y la crean a la vez; la tabla tiene índice único `idx_voting_group_attendance (voting_group_id)`,
así que una gana y las demás fallan con `duplicate key ... (SQLSTATE 23505)`. El voto masivo
registra ese error solo como warning y sigue: la unidad queda sin asistencia y `CreateVote` la
rechaza por la regla de asistencia.

Log del back:
`ERR Error creando lista de asistencia error="... duplicate key value violates unique constraint \"idx_voting_group_attendance\""`
`WRN Warning: no se pudo marcar asistencia automática`

## Hipótesis descartadas

- **Dos listas activas para el mismo grupo** y el chequeo leyendo una sola: falso, el índice
  único lo impide (`select voting_group_id, count(*) ... group by` daba 1 por grupo).
- **Regla de asistencia mal aplicada**: la regla es correcta (con lista activa solo votan
  unidades con asistencia); el problema es que la marca automática se perdía.

## Arreglo

`MarkUnitAttendanceForVoting` crea la lista con `ON CONFLICT (voting_group_id) DO NOTHING` y, si
no la insertó, lee la que dejó la otra petición.

Prueba de integración `usecasevotes/test/bulk_asistencia_integration_test.go`: 5 grupos nuevos ×
20 unidades con voto masivo; falla sin el arreglo (ronda 2: 7+ unidades rechazadas) y pasa con él.

## Prevención

Todo "buscar o crear" que pueda correr en paralelo necesita índice único + `ON CONFLICT` (o
transacción con bloqueo). No tragarse errores como warning cuando el paso siguiente depende de él.
