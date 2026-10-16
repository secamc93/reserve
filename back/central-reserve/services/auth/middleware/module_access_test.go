package middleware_test

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// fakeJWT: el token es la clave del mapa de claims.
type fakeJWT struct {
	claims map[string]*middleware.BusinessTokenClaims
}

func (f fakeJWT) GenerateToken(uint) (string, error)                  { return "", nil }
func (f fakeJWT) ValidateToken(string) (*middleware.JWTClaims, error) { return nil, errors.New("no") }
func (f fakeJWT) RefreshToken(string) (string, error)                 { return "", nil }
func (f fakeJWT) GenerateBusinessToken(uint, uint, uint, uint) (string, error) {
	return "", nil
}
func (f fakeJWT) ValidateBusinessToken(t string) (*middleware.BusinessTokenClaims, error) {
	if c, ok := f.claims[t]; ok {
		return c, nil
	}
	return nil, errors.New("token inválido")
}

type fakeLookup struct {
	byRole map[uint][]string
	err    error
	calls  int
}

func (f *fakeLookup) GetRoleResourceNames(_ context.Context, roleID, _ uint) ([]string, error) {
	f.calls++
	return f.byRole[roleID], f.err
}

const (
	roleConsejero = 7
	roleAdmin     = 8
)

func newRouter(lookup middleware.IRoleResourceLookup) *gin.Engine {
	gin.SetMode(gin.TestMode)
	jwt := fakeJWT{claims: map[string]*middleware.BusinessTokenClaims{
		"super":     {UserID: 1, BusinessID: 0, RoleID: 1, TokenType: "business"},
		"consejero": {UserID: 2, BusinessID: 5, RoleID: roleConsejero, TokenType: "business"},
		"admin":     {UserID: 3, BusinessID: 5, RoleID: roleAdmin, TokenType: "business"},
		"sinrol":    {UserID: 4, BusinessID: 5, RoleID: 0, TokenType: "business"},
	}}
	r := gin.New()
	v1 := r.Group("/api/v1")
	v1.Use(middleware.ModuleAccessMiddleware(jwt, lookup, "/api/v1"))
	ok := func(c *gin.Context) { c.Status(http.StatusOK) }
	v1.Any("/horizontal-properties/voting-groups", ok)
	v1.Any("/horizontal-properties/voting-groups/:g/votings", ok)
	v1.Any("/horizontal-properties/voting-groups/:g/credentials", ok)
	v1.Any("/horizontal-properties/voting-groups/:g/credentials/generate", ok)
	v1.Any("/horizontal-properties/property-units", ok)
	v1.Any("/horizontal-properties/residents", ok)
	v1.Any("/horizontal-properties/packages", ok)
	v1.Any("/horizontal-properties/:id", ok)
	v1.Any("/attendance/lists", ok)
	v1.Any("/dashboard/today", ok)
	v1.Any("/users", ok)
	v1.Any("/businesses", ok)
	v1.Any("/auth/roles-permissions", ok)
	return r
}

func do(r *gin.Engine, method, path, token string) int {
	req := httptest.NewRequest(method, path, nil)
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w.Code
}

func TestModuleAccess_ConsejeroSoloVotaciones(t *testing.T) {
	lookup := &fakeLookup{byRole: map[uint][]string{roleConsejero: {middleware.ResourceVotaciones}}}
	r := newRouter(lookup)

	cases := []struct {
		method, path string
		want         int
	}{
		// su módulo, completo
		{"GET", "/api/v1/horizontal-properties/voting-groups", 200},
		{"POST", "/api/v1/horizontal-properties/voting-groups/3/votings", 200},
		{"POST", "/api/v1/attendance/lists", 200},
		{"GET", "/api/v1/horizontal-properties/voting-groups/3/credentials", 200},
		// pero no genera contraseñas
		{"POST", "/api/v1/horizontal-properties/voting-groups/3/credentials/generate", 403},
		// lecturas que usa Votaciones
		{"GET", "/api/v1/horizontal-properties/property-units", 200},
		{"GET", "/api/v1/horizontal-properties/residents", 200},
		{"GET", "/api/v1/horizontal-properties/1", 200},
		{"GET", "/api/v1/businesses", 200},
		{"GET", "/api/v1/auth/roles-permissions", 200},
		// lo demás, no
		{"POST", "/api/v1/horizontal-properties/property-units", 403},
		{"PUT", "/api/v1/horizontal-properties/residents", 403},
		{"GET", "/api/v1/horizontal-properties/packages", 403},
		{"PUT", "/api/v1/horizontal-properties/1", 403},
		{"GET", "/api/v1/dashboard/today", 403},
		{"GET", "/api/v1/users", 403},
		{"POST", "/api/v1/users", 403},
		{"POST", "/api/v1/businesses", 403},
	}
	for _, tc := range cases {
		if got := do(r, tc.method, tc.path, "consejero"); got != tc.want {
			t.Errorf("%s %s = %d, se esperaba %d", tc.method, tc.path, got, tc.want)
		}
	}
}

func TestModuleAccess_SuperAdminPasaSinConsultar(t *testing.T) {
	lookup := &fakeLookup{}
	r := newRouter(lookup)
	for _, p := range []string{"/api/v1/users", "/api/v1/horizontal-properties/packages", "/api/v1/dashboard/today"} {
		if got := do(r, "POST", p, "super"); got != 200 {
			t.Errorf("super admin POST %s = %d", p, got)
		}
	}
	if lookup.calls != 0 {
		t.Errorf("no debía consultar recursos para el super admin, consultó %d veces", lookup.calls)
	}
}

func TestModuleAccess_RolConVariosRecursos(t *testing.T) {
	lookup := &fakeLookup{byRole: map[uint][]string{roleAdmin: {middleware.ResourcePaqueteria, middleware.ResourcePropiedades}}}
	r := newRouter(lookup)
	if got := do(r, "POST", "/api/v1/horizontal-properties/packages", "admin"); got != 200 {
		t.Errorf("paquetería = %d", got)
	}
	if got := do(r, "GET", "/api/v1/dashboard/today", "admin"); got != 200 {
		t.Errorf("dashboard = %d", got)
	}
	if got := do(r, "GET", "/api/v1/horizontal-properties/voting-groups", "admin"); got != 403 {
		t.Errorf("votaciones sin el recurso = %d", got)
	}
}

func TestModuleAccess_SinRolNoEntraANingunModulo(t *testing.T) {
	r := newRouter(&fakeLookup{})
	if got := do(r, "GET", "/api/v1/horizontal-properties/voting-groups", "sinrol"); got != 403 {
		t.Errorf("sin rol = %d", got)
	}
}

func TestModuleAccess_SinTokenLoDecideElJWT(t *testing.T) {
	// Sin token o con token inválido no responde 403: deja que el JWT de la ruta responda 401.
	r := newRouter(&fakeLookup{})
	if got := do(r, "GET", "/api/v1/users", ""); got != 200 {
		t.Errorf("sin token = %d", got)
	}
	if got := do(r, "GET", "/api/v1/users", "basura"); got != 200 {
		t.Errorf("token inválido = %d", got)
	}
}

func TestModuleAccess_ErrorDeBDNoDejaPasar(t *testing.T) {
	r := newRouter(&fakeLookup{err: errors.New("bd caída")})
	if got := do(r, "GET", "/api/v1/horizontal-properties/voting-groups", "consejero"); got != 500 {
		t.Errorf("error de BD = %d", got)
	}
}

func TestModuleAccess_GenerarContrasenasExigeSuRecurso(t *testing.T) {
	lookup := &fakeLookup{byRole: map[uint][]string{
		roleAdmin: {middleware.ResourceVotaciones, middleware.ResourceContrasenasVotacion},
	}}
	r := newRouter(lookup)
	if got := do(r, "POST", "/api/v1/horizontal-properties/voting-groups/3/credentials/generate", "admin"); got != 200 {
		t.Errorf("rol con el recurso = %d", got)
	}
	if got := do(r, "POST", "/api/v1/horizontal-properties/voting-groups/3/credentials/generate", "super"); got != 200 {
		t.Errorf("super admin = %d", got)
	}
}
