# App Layer - Mappers

Esta carpeta es **OPCIONAL** y solo se usa cuando se necesitan transformaciones específicas de la capa de aplicación.

## ¿Cuándo usar mappers en app layer?

- ✅ Cuando los DTOs de dominio requieren transformaciones adicionales antes de usarse en use cases
- ✅ Cuando se necesita lógica de validación o enriquecimiento específica de aplicación
- ✅ Cuando se combinan múltiples DTOs de dominio en un DTO compuesto

## ¿Cuándo NO usar mappers en app layer?

- ❌ Si los DTOs de dominio son suficientes para los use cases (caso más común)
- ❌ Si las transformaciones son puramente técnicas (HTTP ↔ Domain: usar handlers/mappers)
- ❌ Si las transformaciones son de persistencia (DB ↔ Domain: usar repository/mappers)

**Estado actual**: Esta carpeta está vacía porque los use cases usan directamente los DTOs de dominio, lo cual es válido y recomendado cuando no hay lógica adicional de transformación.

**Nota**: Actualmente los mappers están embebidos en el use case `get-dashboard.go` (líneas 38-103). Si el mapeo se vuelve complejo, considera extraerlo aquí.
