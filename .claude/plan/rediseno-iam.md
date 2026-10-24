# Plan — Rediseño de IAM / Accesos

**Estado (2026-10-23):** implementado y commiteado en la rama `feat/rediseno-ui` (worktree
`../reserve-wt/ui-rediseno`), sin push ni PR. Pruebas unitarias, typecheck, build y la e2e
`e2e/iam-accesos.spec.ts` en verde. Revisado en navegador (escritorio y teléfono) con datos
sembrados en la BD del worktree.

Diseño: lienzo "IAM - Rediseño" (https://claude.ai/artifact/2ZM2vqZdiWe4Un93pe7DFw), pantallas
2a–2d, sobre los tokens de `shared/ui/ds`.

## Hecho
- Cabecera de Accesos con 5 pestañas (`shared/ui/iam-navigation.tsx`: `IamPage`, `IamPageHeader`):
  Resumen · Usuarios · Roles y permisos · Propiedades · Avanzado (Permisos, Recursos, Tipos de
  negocio como píldoras). El layout ya no pinta la barra vieja.
- 2a Usuarios: filtros en la URL (`?q=&estado=&rol=&propiedad=`), tabla DS con rol por propiedad,
  último acceso legible y menú por fila; ficha lateral con accesos y "qué puede hacer" (permisos
  del rol). Acciones compartidas en `useUserActions` (restablecer clave, super admin, activar /
  desactivar, eliminar).
- 2b Roles y permisos: lista de roles + matriz recurso × acción; guarda el conjunto completo
  (el back reemplaza todos los permisos) conservando los que la matriz no muestra.
- 2c Resumen: cifras de `/dashboard/stats` + atención (sin rol, sin uso 90 días, inactivos) y
  accesos por propiedad calculados de la lista de usuarios (hasta 200).
- 2d Crear usuario: diálogo con propiedad y rol en tarjetas; tras crear, asigna el rol buscando
  al usuario por correo (el alta no devuelve id) y muestra la clave una vez.

## Decisiones
- 2026-10-23: el diseño decía "Invitar" y "enviar por WhatsApp"; el back no invita (genera clave),
  así que es "Crear usuario" con la clave en pantalla. Sin "Actividad reciente" (no hay fuente).
- 2026-10-23 (usuario): Propiedades y Avanzado también llevan el diseño nuevo (sin lienzo propio: mismo sistema que 2a–2c).

## Pendientes
- [x] 2026-10-23: revisión en navegador con datos sembrados en `rupu_ui_rediseno`.
- [x] 2026-10-23: back: los filtros `role_id` y `business_id` de `GET /users` leían tablas viejas
      (ver `bitacora/2026-10-23-filtros-usuarios-por-rol-y-propiedad.md`).
- [x] 2026-10-23: push y PR #104 a `main` (pendiente revisión y merge).
- [x] 2026-10-23: Propiedades (tarjetas + panel de módulos con interruptores) y Avanzado
      (Permisos agrupados por módulo, Recursos con sus acciones, Tipos de negocio) rediseñados.
- [ ] Borrar componentes que quedaron sin uso: `RolesTable`, `AssignPermissionsModal`,
      `DashboardPage` (+ stats-card, simple-chart, module-indicator), `UserDetailModal`, `UsersFilters`,
      `BusinessesTable`, `PermissionsTable` (+ `EditPermissionModal`), `ResourcesTable` (+ modales),
      `BusinessTypesPage` (+ tabla y formulario).
- [ ] Back: endpoint de invitación por correo/WhatsApp y filtro "sin rol" en `GET /users`.
