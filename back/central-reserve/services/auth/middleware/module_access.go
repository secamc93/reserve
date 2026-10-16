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
	ResourcePropiedades  = "Propiedades"
	ResourceUnidades     = "Unidades"
	ResourceResidentes   = "Residentes"
	ResourceVotaciones   = "Votaciones"
	ResourceAsistencia   = "Asistencia"
	ResourceVisitas      = "Visitas"
	ResourcePaqueteria   = "Paquetería"
	ResourceParqueaderos = "Parqueaderos"
	ResourceZonasComunes = "Zonas Comunes"
	ResourceUsuarios     = "Usuarios"
	ResourceRoles        = "Roles"
	ResourcePermisos     = "Permisos"
	ResourceRecursos     = "Recursos"
	ResourceTiposNegocio = "Tipos de Negocio"
	ResourceNegocios     = "Negocios"
)

// moduleRule dice qué recursos abren un prefijo de ruta (relativo a /api/v1).
//   - resources: dan acceso completo.
//   - readResources: dan acceso solo de lectura (GET), p. ej. Votaciones lee unidades y residentes.
//   - readAny: cualquier usuario con business token puede leer (GET).
type moduleRule struct {
	prefix        string
	resources     []string
	readResources []string
	readAny       bool
}

// moduleRules: el primer prefijo que coincide manda, así que los más específicos van primero.
// Las rutas que no coinciden con ninguna regla (/auth, /public…) no se restringen aquí.
var moduleRules = []moduleRule{
	{prefix: "/horizontal-properties/voting-groups", resources: []string{ResourceVotaciones}},
	{prefix: "/horizontal-properties/property-units", resources: []string{ResourceUnidades}, readResources: []string{ResourceVotaciones, ResourceAsistencia}},
	{prefix: "/horizontal-properties/residents", resources: []string{ResourceResidentes}, readResources: []string{ResourceVotaciones, ResourceAsistencia}},
	{prefix: "/horizontal-properties/visits", resources: []string{ResourceVisitas}},
	{prefix: "/horizontal-properties/packages", resources: []string{ResourcePaqueteria}},
	{prefix: "/horizontal-properties/parking", resources: []string{ResourceParqueaderos}},
	{prefix: "/horizontal-properties/common-areas", resources: []string{ResourceZonasComunes}},
	{prefix: "/horizontal-properties", resources: []string{ResourcePropiedades}, readAny: true},
	{prefix: "/attendance", resources: []string{ResourceAsistencia, ResourceVotaciones}},
	{prefix: "/dashboard", resources: []string{ResourcePropiedades}},
	{prefix: "/users", resources: []string{ResourceUsuarios}},
	{prefix: "/roles", resources: []string{ResourceRoles}},
	{prefix: "/permissions", resources: []string{ResourcePermisos}},
	{prefix: "/actions", resources: []string{ResourcePermisos}},
	{prefix: "/resources", resources: []string{ResourceRecursos}},
	{prefix: "/business-types", resources: []string{ResourceTiposNegocio}},
	{prefix: "/businesses", resources: []string{ResourceNegocios}, readAny: true},
}

// IRoleResourceLookup devuelve los nombres de recursos que un rol tiene activos en un negocio.
type IRoleResourceLookup interface {
	GetRoleResourceNames(ctx context.Context, roleID, businessID uint) ([]string, error)
}

// matchModuleRule busca la regla del path (ya sin /api/v1). Coincide por segmento completo.
func matchModuleRule(path string) (moduleRule, bool) {
	for _, rule := range moduleRules {
		if path == rule.prefix || strings.HasPrefix(path, rule.prefix+"/") {
			return rule, true
		}
	}
	return moduleRule{}, false
}

func containsAny(have map[string]bool, want []string) bool {
	for _, w := range want {
		if have[w] {
			return true
		}
	}
	return false
}

// ModuleAccessMiddleware restringe los módulos según los recursos del rol del business token.
// El super admin (business_id = 0) pasa siempre. Si no hay business token válido deja pasar:
// la autenticación la rechaza el middleware JWT de la ruta.
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
				"message": "Tu rol no tiene acceso a este módulo",
				"error":   "forbidden",
			})
		}

		if claims.RoleID == 0 {
			deny()
			return
		}
		names, err := lookup.GetRoleResourceNames(c.Request.Context(), claims.RoleID, claims.BusinessID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "No se pudieron verificar los permisos",
				"error":   "internal_error",
			})
			return
		}
		have := make(map[string]bool, len(names))
		for _, n := range names {
			have[n] = true
		}

		if containsAny(have, rule.resources) || (isRead && containsAny(have, rule.readResources)) {
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
