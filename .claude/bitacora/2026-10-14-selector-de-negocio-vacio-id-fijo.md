# Selector de negocio vacío: id de tipo de negocio fijo en el código

## Síntoma

Como super admin, en `/properties/voting-groups` el selector de negocio no listaba nada y la
página mostraba "No se pudo cargar la información de la propiedad". No había forma de entrar a
ningún módulo, aunque la propiedad "Tayazal de Suba" existía.

## Causa

`front/rupu-central/src/shared/ui/business-dropdown.tsx`: para el super admin (sin negocios
propios) resolvía el `business_type_id` con un mapa fijo `{ horizontal_property: 11 }`. En la BD
nueva el tipo tiene id 1, así que pedía negocios del tipo 11 y la lista volvía vacía.

## Hipótesis descartadas

- Falta de permisos del super admin: el login devolvía `is_super_admin: true`, scope `platform`.
- Propiedad no creada: `GET /horizontal-properties` la devolvía.

## Arreglo

Commit `5403d7b0` (PR #69): el id se resuelve por `code` con `getBusinessTypesAction`.

## Verificación

`.claude/testing/votaciones/front/CU-01-entrar-al-modulo.md` (automatizado en
`front/rupu-central/e2e/propiedad-horizontal-votaciones.spec.ts`).

## Prevención

Nunca fijar ids de catálogos en código: cambian entre bases. Resolver por `code`.
