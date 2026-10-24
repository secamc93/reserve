# No se podía crear un conjunto con el nombre de uno borrado (2026-10-23)

**Síntoma:** "El dominio personalizado ya está en uso" (o `duplicate key uni_business_code`) al
crear un conjunto con el mismo nombre de uno borrado.

**Causa:** `business.code` y `business.custom_domain` (que se generan del nombre) tienen índices
únicos que cuentan también las filas borradas (soft delete); las validaciones del back
(`ExistsHorizontalPropertyByCode`, `ExistsCustomDomain`) ignoran las borradas, así que pasaba la
validación y fallaba el insert.

**Arreglo (PR #103, sin migración):** al borrar, el código y el dominio pasan a
`<recorte>--del-<id>`; al crear, se liberan los que conserve un conjunto borrado antes del
arreglo (cubre los ya borrados en producción).

**Verificar:** prueba de integración `release_identifiers_integration_test.go` (falla sin el
arreglo). Local: crear, borrar y recrear "PH Prueba Boton".
