# Importar residentes fallaba completo si la persona ya estaba en otro conjunto (2026-10-23)

**Síntoma:** la importación de residentes por Excel fallaba para todo el lote con
`duplicate key value violates unique constraint "idx_business_resident_email"`.

**Causa:** el Excel no trae correo y el back inventa uno provisional `<documento>@residente.local`.
Pese al nombre, el índice `idx_business_resident_email` es único **global** (solo `email`), así
que si el mismo documento ya era residente de otro conjunto (propietario con apartamentos en dos
conjuntos, común con administradoras) el insert del lote chocaba.

**Hipótesis descartada:** que el índice fuera por `(business_id, email)`;
`select indexdef from pg_indexes where indexname='idx_business_resident_email'` muestra solo `email`.

**Arreglo (PR #102):** regla de dominio `PlaceholderResidentEmail(businessID, dni, fallback)` →
`<documento>.<propiedad>@residente.local`, usada en la importación y en la actualización por
Excel. Prueba en `resident/internal/domain/test`.

**Pendiente (no hecho):** un correo real repetido entre dos conjuntos también choca con ese índice;
si se vuelve un problema, cambiar el índice a `(business_id, email)` con migración.

**Relacionado:** el formulario de importación prometía columnas de correo y teléfono que el back no
lee; se corrigió el texto (unidad, nombre, documento).
