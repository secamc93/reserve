# Plan — Rupü solo propiedad horizontal: sin tipo de negocio, una propiedad a la vez

**Estado:** PLANEADO, sin ejecutar (pedido del usuario 2026-10-14: "déjalo en lista de plan para
ejecutar, espera instrucciones"). No arrancar hasta que el usuario lo indique.

## Objetivo (palabras del usuario)

- La lógica de **tipo de negocio se elimina**: el software siempre será de propiedad horizontal.
- El usuario entra **siempre directo a propiedad horizontal** (se quita "Selecciona un Módulo" /
  `/select-type` y el selector de negocio de arriba a la derecha).
- Un rol **administrador de propiedades** sí puede elegir a qué propiedad entrar, con un botón
  **"Cambiar propiedad"** abajo en el menú lateral.
- Siempre ve **una propiedad a la vez**: puede transitar entre propiedades, pero trabaja con una
  sola; **al cambiar se aplican el logo y los colores** de esa propiedad.

## Estado actual (relevado 2026-10-14)

- Front: `/select-type` (`src/app/(auth)/select-type/page.tsx`) se abre desde el login
  (`login-form.tsx:85` y `:120`), desde el layout de propiedad horizontal
  (`(property-horizontal)/layout.tsx:28`) y desde el botón **"Cambiar Módulo"** del sidebar
  (`shared/ui/sidebar.tsx:163-173`, el ícono ⇄ de abajo). Ese botón es el que se reutiliza.
- Selector de negocio arriba a la derecha: `shared/ui/business-dropdown.tsx` (genera el business
  token del negocio elegido y aplica tema).
- Tema por propiedad ya existe: `shared/utils/apply-business-theme.ts`,
  `shared/providers/theme-provider.tsx` (colores primary/secondary/tertiary/quaternary y logo
  del `business`). Se reutiliza al cambiar de propiedad.
- Configuración de tipos: `shared/config/business-type-config.ts` (+ test) y el CRUD de tipos de
  negocio en IAM (`src/services/auth/business-types/`, 25 archivos).
- Back: el tipo está muy acoplado. `business.business_type_id` es `NOT NULL` con FK; también
  `role`, `resource` y `permission` tienen `business_type_id`. Lo usan auth/business (40 archivos),
  roles (15), permisos (15), resources (13), login (9), dashboard (9), users (6), middleware (3) y
  horizontalpropertiy (13): este último **busca el tipo `horizontal_property` por código** y da 500
  si no existe.
- Roles: hoy solo existe "Super Admin" (scope `platform`). **No existe** el rol "administrador de
  propiedades"; la relación usuario↔propiedad vive en `business_staff` (user, business, role).
- Token: el super admin siempre tiene `business_id = 0` (los módulos reciben `?business_id`). Un
  usuario con varias propiedades necesita un business token por propiedad (`/auth/business-token`).

## Decisiones tomadas

- 2026-10-14: el menú lateral y la barra superior usan **los colores (y logo) de la propiedad activa**;
  al cambiar de propiedad cambian. No se aplica el shell neutro del diseño de votaciones.

## Decisiones a confirmar antes de ejecutar

1. **Alcance en el back** (recomendado: A primero, B después en un PR aparte):
   - **A. Solo producto/front**: el concepto desaparece de la UI y de la API pública; en BD queda un
     único tipo `horizontal_property` sembrado por la migración (sin CRUD ni selección). Bajo riesgo.
   - **B. Eliminación total**: migración que quita `business_type_id` de business/role/resource/
     permission y la tabla `business_type`; refactor de auth, roles, permisos, resources, dashboard,
     tokens. Alto impacto; requiere migración con datos de producción (AutoMigrate no borra columnas).
2. **Rol "administrador de propiedades"**: ¿es un rol nuevo (scope `business`, asignado a varias
   propiedades vía `business_staff`) o se reutiliza el super admin? ¿Qué puede hacer dentro de
   cada propiedad (todo el módulo, o permisos por recurso)?
3. **Usuario de una sola propiedad** (residente/administrador de un conjunto): entra directo a su
   propiedad y **no** ve "Cambiar propiedad". ¿Confirmado?
4. **Super admin**: ¿ve "Cambiar propiedad" con todas las propiedades (comportamiento de
   administrador de propiedades) además de IAM?
5. ¿Se hace sobre la rama del rediseño de votaciones (`wt/rediseno`) o sobre
   `chore/agent-context-testing`? (Recomendado: sobre `chore/agent-context-testing`, y el rediseño
   se rebasa encima.)

## Fases (con la opción A)

### Fase 1 — Back: el tipo deja de ser un requisito visible
- [ ] Migración: sembrar el tipo `horizontal_property` (idempotente, por `code`) para que ninguna BD
      nueva dé 500 (hoy hay que crearlo a mano por la API).
- [ ] Crear propiedad horizontal asigna el tipo internamente (ya lo hace por código); quitar cualquier
      parámetro de tipo de la API pública.
- [ ] Endpoint "mis propiedades": lista paginada de las propiedades a las que el usuario puede entrar
      (super admin: todas; administrador de propiedades: las de `business_staff`; resto: la suya),
      con nombre, logo y colores. Revisar si `/auth/login` ya devuelve `businesses` suficiente.
- [ ] Rol "administrador de propiedades" (según decisión 2): seed del rol + asignación a varias
      propiedades. Prueba de aislamiento: no entra a una propiedad que no tiene asignada.
- [ ] Ocultar/retirar el CRUD de tipos de negocio de la API (o dejarlo solo para super admin, según 1).

### Fase 2 — Front: entrar directo, una propiedad a la vez
- [ ] Login → si el usuario tiene 1 propiedad: business token de esa propiedad, aplicar tema y entrar a
      `/properties/<id>`. Si tiene varias: entrar a la última usada (guardada) o mostrar el selector de
      propiedad la primera vez.
- [ ] Eliminar `/select-type`, `business-type-config.ts` (y su test), la redirección del layout
      `(property-horizontal)` por tipo, y `business-dropdown.tsx` del header.
- [ ] Sidebar: el botón ⇄ "Cambiar Módulo" pasa a **"Cambiar propiedad"**, visible solo si el usuario
      tiene más de una propiedad (administrador de propiedades / super admin). Abre un selector
      (modal o pantalla) con las propiedades, buscador y paginación.
- [ ] Al cambiar: pedir el business token de la nueva propiedad, aplicar **logo y colores**
      (`apply-business-theme`), limpiar estado de la propiedad anterior y navegar a
      `/properties/<nueva>`. Nunca mezclar datos de dos propiedades en pantalla.
- [ ] IAM: quitar la sección de tipos de negocio y las referencias a tipo en roles/usuarios/recursos
      (en la UI).

### Fase 3 — Pruebas (definición de "hecho": `.claude/rules/testing.md`)
- [ ] Unitarias Go: login/"mis propiedades" por rol; aislamiento del administrador de propiedades.
- [ ] Integración: usuario con 2 propiedades obtiene token de cada una y no de una tercera.
- [ ] Vitest: lógica de "a dónde entra el usuario" (1 propiedad / varias / última usada) y del
      cambio de propiedad (tema aplicado, estado limpiado).
- [ ] Playwright: (a) usuario de una propiedad entra directo sin selector; (b) administrador de
      propiedades cambia de propiedad desde el sidebar y cambian logo/colores y datos; (c) ya no
      existe `/select-type`. Actualizar `e2e/auth-login.spec.ts` y
      `e2e/propiedad-horizontal-votaciones.spec.ts` (hoy pasan por "Selecciona un Módulo" y el
      selector de negocio).
- [ ] Casos manuales nuevos en `.claude/testing/` (módulo `acceso/`).

### Fase 4 (opcional, decisión 1-B) — Eliminación total del tipo en BD
- [ ] Migración SQL explícita (con `Up`/`Down`) que quita las columnas y la tabla; refactor de los
      módulos de auth listados arriba; prueba en una copia de la BD de producción antes de desplegar.

## Ejecución sugerida (trabajo en paralelo, `.claude/rules/servicios-y-worktrees.md`)

- Trabajador 1 (worktree `acceso-back`): Fase 1 + sus pruebas.
- Trabajador 2 (worktree `acceso-front`): Fase 2 + Vitest/Playwright, contra el back del trabajador 1
  cuando esté (mientras tanto, contra el back local).
- Archivos compartidos con dueño único (orquestador): `migration_usecase.go`, `models.go`,
  `package.json`, `AGENTS.md`, este plan.
