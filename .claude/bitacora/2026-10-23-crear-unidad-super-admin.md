# Crear unidad como super admin: "An error occurred in the Server Components render" (2026-10-23)

**Síntoma:** en producción, al crear una unidad desde el panel con el super admin salía el error
genérico de Next ("An error occurred in the Server Components render… digest").

**Diagnóstico:** el digest se busca en los logs del front por SSM (perfil `rupu`):
`docker logs --since 2h frontend_prod | grep -A4 digest` → `Error: business_id requerido` en
`createPropertyUnit` (digest 981263020).

**Causa:** el back toma la propiedad del super admin (token con `business_id = 0`) de
`?business_id=`; el front la mandaba solo en el body. Además la server action lanzaba el error y
Next oculta el mensaje en producción.

**Arreglo (PR #100):** `createPropertyUnit` envía `?business_id=`; las acciones de crear y editar
unidad devuelven `{ success, error }` para que el formulario muestre el motivo real.

**Verificar:** back local, `POST /horizontal-properties/property-units` sin el parámetro → 400, con
él → 201. Prueba que falla sin el arreglo en `property-units-summary.mapper.test.ts`.

**Prevención:** en server actions que un formulario usa, devolver el error en vez de lanzarlo.
