package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// Nombres de los recursos (tabla resource) que dan acceso a cada módulo. Deben coincidir con
// RESOURCE_ROUTE_MAP del front (front/rupu-central/src/services/auth/permissions/domain/entities).
const (
	ResourcePropiedades = "Propiedades"
	ResourceUnidades    = "Unidades"
	ResourceResidentes  = "Residentes"
	ResourceVotaciones  = "Votaciones"
	// Generar (o regenerar) las contraseñas de voto de un grupo: aparte de Votaciones para que un
	// rol pueda operar la asamblea sin poder cambiar las contraseñas ya entregadas.
	ResourceContrasenasVotacion = "Contraseñas de votación"
	// Panel en vivo de una votación (stream de votos en tiempo real).
	ResourceVotacionEnVivo = "Votación en vivo"
	ResourceAsistencia     = "Asistencia"
	ResourceVisitas        = "Visitas"
	ResourcePaqueteria     = "Paquetería"
	ResourceParqueaderos   = "Parqueaderos"
	ResourceZonasComunes   = "Zonas Comunes"
	ResourceUsuarios       = "Usuarios"
	ResourceRoles          = "Roles"
	ResourcePermisos       = "Permisos"
	ResourceRecursos       = "Recursos"
	ResourceTiposNegocio   = "Tipos de Negocio"
	ResourceNegocios       = "Negocios"
)

// Acciones (tabla action) que exige cada método HTTP sobre el recurso del módulo.
const (
	ActionRead   = "Read"
	ActionCreate = "Create"
	ActionUpdate = "Update"
	ActionDelete = "Delete"
)

// actionForMethod: GET/HEAD leen, POST crea, PUT/PATCH actualizan, DELETE borra.
func actionForMethod(method string) string {
	switch method {
	case http.MethodGet, http.MethodHead:
		return ActionRead
	case http.MethodPost:
		return ActionCreate
	case http.MethodDelete:
		return ActionDelete
	default:
		return ActionUpdate
	}
}

// moduleRule dice qué recursos abren una ruta (relativa a /api/v1).
//   - resources: el rol necesita uno de estos recursos con la acción del método (o `action`).
//   - action: si no está vacía, la acción exigida en vez de la del método (p. ej. marcar
//     asistencia es un POST pero cuenta como Update).
//   - readResources: dan acceso solo de lectura (GET) con cualquier acción, p. ej. Votaciones
//     lee unidades y residentes.
//   - readAny: cualquier usuario con business token puede leer (GET).
//   - suffix: si no está vacío, la regla solo aplica a rutas bajo prefix que terminan así.
type moduleRule struct {
	prefix        string
	suffix        string
	resources     []string
	action        string
	readResources []string
	readAny       bool
}

// moduleRules: la primera regla que coincide manda, así que las más específicas van primero.
// Las rutas que no coinciden con ninguna regla (/auth, /public…) no se restringen aquí.
var moduleRules = []moduleRule{
	{prefix: "/horizontal-properties/voting-groups", suffix: "/credentials/generate", resources: []string{ResourceContrasenasVotacion}, action: ActionCreate},
	{prefix: "/horizontal-properties/voting-groups", suffix: "/stream", resources: []string{ResourceVotacionEnVivo}, action: ActionRead},
	// Marcar asistencia y apoderados: lo único que puede modificar un rol con "Asistencia".
	{prefix: "/horizontal-properties/voting-groups", suffix: "/attendance", resources: []string{ResourceAsistencia, ResourceVotaciones}, action: ActionUpdate},
	{prefix: "/attendance/records", suffix: "/mark", resources: []string{ResourceAsistencia, ResourceVotaciones}, action: ActionUpdate},
	{prefix: "/attendance/records", suffix: "/unmark", resources: []string{ResourceAsistencia, ResourceVotaciones}, action: ActionUpdate},
	{prefix: "/attendance/records", suffix: "/proxy", resources: []string{ResourceAsistencia, ResourceVotaciones}, action: ActionUpdate},
	{prefix: "/horizontal-properties/voting-groups", resources: []string{ResourceVotaciones}},
	{prefix: "/horizontal-properties/property-units", resources: []string{ResourceUnidades}, readResources: []string{ResourceVotaciones, ResourceAsistencia}},
	{prefix: "/horizontal-properties/residents", resources: []string{ResourceResidentes}, readResources: []string{ResourceVotaciones, ResourceAsistencia}},
	{prefix: "/horizontal-properties/visits", resources: []string{ResourceVisitas}},
	{prefix: "/horizontal-properties/packages", resources: []string{ResourcePaqueteria}},
	{prefix: "/horizontal-properties/parking", resources: []string{ResourceParqueaderos}},
	{prefix: "/horizontal-properties/common-areas", resources: []string{ResourceZonasComunes}},
	{prefix: "/horizontal-properties", resources: []string{ResourcePropiedades}, readAny: true},
	{prefix: "/attendance", resources: []string{ResourceVotaciones}, readResources: []string{ResourceAsistencia}},
	{prefix: "/dashboard", resources: []string{ResourcePropiedades}},
	{prefix: "/users", resources: []string{ResourceUsuarios}},
	{prefix: "/roles", resources: []string{ResourceRoles}},
	{prefix: "/permissions", resources: []string{ResourcePermisos}},
	{prefix: "/actions", resources: []string{ResourcePermisos}},
	{prefix: "/resources", resources: []string{ResourceRecursos}},
	{prefix: "/business-types", resources: []string{ResourceTiposNegocio}},
	{prefix: "/businesses", resources: []string{ResourceNegocios}, readAny: true},
}

// IRoleResourceLookup devuelve, por recurso, las acciones que un rol tiene en un negocio
// (solo recursos activos en ese negocio).
type IRoleResourceLookup interface {
	GetRoleResourceActions(ctx context.Context, roleID, businessID uint) (map[string][]string, error)
}

// matchModuleRule busca la regla del path (ya sin /api/v1). Coincide por segmento completo.
func matchModuleRule(path string) (moduleRule, bool) {
	for _, rule := range moduleRules {
		if rule.suffix != "" && !strings.HasSuffix(path, rule.suffix) {
			continue
		}
		if path == rule.prefix || strings.HasPrefix(path, rule.prefix+"/") {
			return rule, true
		}
	}
	return moduleRule{}, false
}

// allows: el rol tiene alguno de los recursos con la acción (o con cualquiera si action es "").
func allows(have map[string][]string, resources []string, action string) bool {
	for _, r := range resources {
		actions, ok := have[r]
		if !ok {
			continue
		}
		if action == "" {
			return true
		}
		for _, a := range actions {
			if a == action {
				return true
			}
		}
	}
	return false
}

// ModuleAccessMiddleware restringe los módulos según los recursos y acciones del rol del
// business token. El super admin (business_id = 0) pasa siempre. Si no hay business token
// válido deja pasar: la autenticación la rechaza el middleware JWT de la ruta.
func ModuleAccessMiddleware(jwtService IJWTService, lookup IRoleResourceLookup, apiPrefix string) gin.HandlerFunc {
	return func(c *gin.Context) {
		path := strings.TrimPrefix(c.Request.URL.Path, apiPrefix)
		rule, ok := matchModuleRule(path)
		if !ok {
			c.Next()
			return
		}

		token := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		if token == "" {
			c.Next()
			return
		}
		claims, err := jwtService.ValidateBusinessToken(token)
		if err != nil || claims.TokenType != "business" || claims.BusinessID == 0 {
			c.Next()
			return
		}

		isRead := c.Request.Method == http.MethodGet || c.Request.Method == http.MethodHead
		if isRead && rule.readAny {
			c.Next()
			return
		}

		deny := func() {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Tu rol no tiene permiso para esta acción",
				"error":   "forbidden",
			})
		}

		if claims.RoleID == 0 {
			deny()
			return
		}
		have, err := lookup.GetRoleResourceActions(c.Request.Context(), claims.RoleID, claims.BusinessID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "No se pudieron verificar los permisos",
				"error":   "internal_error",
			})
			return
		}

		action := rule.action
		if action == "" {
			action = actionForMethod(c.Request.Method)
		}
		if allows(have, rule.resources, action) || (isRead && allows(have, rule.readResources, "")) {
			c.Next()
			return
		}
		deny()
	}
}

// ModuleAccess usa el JWT configurado globalmente (InitFromEnv).
func ModuleAccess(lookup IRoleResourceLookup, apiPrefix string) gin.HandlerFunc {
	ensureInitialized()
	return ModuleAccessMiddleware(defaultJWTService, lookup, apiPrefix)
}
