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
	byRole map[uint]map[string][]string
	err    error
	calls  int
}

func (f *fakeLookup) GetRoleResourceActions(_ context.Context, roleID, _ uint) (map[string][]string, error) {
	f.calls++
	return f.byRole[roleID], f.err
}

const (
	roleConsejero = 7
	roleAdmin     = 8
)

var crud = []string{middleware.ActionCreate, middleware.ActionRead, middleware.ActionUpdate, middleware.ActionDelete}

// consejeroActions: ve Votaciones y solo marca asistencia y apoderados.
var consejeroActions = map[string][]string{
	middleware.ResourceVotaciones: {middleware.ActionRead},
	middleware.ResourceAsistencia: {middleware.ActionUpdate},
}

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
	for _, p := range []string{
		"/horizontal-properties/voting-groups",
		"/horizontal-properties/voting-groups/:g",
		"/horizontal-properties/voting-groups/:g/votings",
		"/horizontal-properties/voting-groups/:g/votings/:v/activate",
		"/horizontal-properties/voting-groups/:g/votings/:v/votes",
		"/horizontal-properties/voting-groups/:g/votings/:v/units/:u/attendance",
		"/horizontal-properties/voting-groups/:g/votings/:v/stream",
		"/horizontal-properties/voting-groups/:g/generate-public-url",
		"/horizontal-properties/voting-groups/:g/credentials",
		"/horizontal-properties/voting-groups/:g/credentials/generate",
		"/horizontal-properties/property-units",
		"/horizontal-properties/residents",
		"/horizontal-properties/packages",
		"/horizontal-properties/:id",
		"/attendance/lists",
		"/attendance/lists/:id",
		"/attendance/lists/generate",
		"/attendance/lists/:id/records",
		"/attendance/records/:id/mark",
		"/attendance/records/:id/unmark",
		"/attendance/records/:id/proxy",
		"/dashboard/today",
		"/users",
		"/businesses",
		"/auth/roles-permissions",
	} {
		v1.Any(p, ok)
	}
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

func TestModuleAccess_ConsejeroSoloVeYMarcaAsistencia(t *testing.T) {
	r := newRouter(&fakeLookup{byRole: map[uint]map[string][]string{roleConsejero: consejeroActions}})
	const vg = "/api/v1/horizontal-properties/voting-groups"

	cases := []struct {
		method, path string
		want         int
	}{
		// ver
		{"GET", vg, 200},
		{"GET", vg + "/3/votings", 200},
		{"GET", vg + "/3/votings/8/votes", 200},
		{"GET", "/api/v1/attendance/lists", 200},
		{"GET", "/api/v1/attendance/lists/4/records", 200},
		{"GET", "/api/v1/horizontal-properties/property-units", 200},
		{"GET", "/api/v1/horizontal-properties/residents", 200},
		{"GET", "/api/v1/horizontal-properties/1", 200},
		{"GET", "/api/v1/businesses", 200},
		{"GET", "/api/v1/auth/roles-permissions", 200},
		// marcar asistencia y apoderados
		{"POST", "/api/v1/attendance/records/9/mark", 200},
		{"POST", "/api/v1/attendance/records/9/unmark", 200},
		{"PUT", "/api/v1/attendance/records/9/proxy", 200},
		{"DELETE", "/api/v1/attendance/records/9/proxy", 200},
		{"PUT", vg + "/3/votings/8/units/12/attendance", 200},
		// nada más: ni grupos, ni votaciones, ni iniciarlas, ni votos, ni QR, ni contraseñas, ni en vivo
		{"POST", vg, 403},
		{"PUT", vg + "/3", 403},
		{"DELETE", vg + "/3", 403},
		{"POST", vg + "/3/votings", 403},
		{"PATCH", vg + "/3/votings/8/activate", 403},
		{"POST", vg + "/3/votings/8/votes", 403},
		{"POST", vg + "/3/generate-public-url", 403},
		{"POST", vg + "/3/credentials/generate", 403},
		{"GET", vg + "/3/credentials", 403},
		{"GET", vg + "/3/votings/8/stream", 403},
		{"POST", "/api/v1/attendance/lists/generate", 403},
		{"DELETE", "/api/v1/attendance/lists/4", 403},
		// ni otros módulos
		{"POST", "/api/v1/horizontal-properties/property-units", 403},
		{"PUT", "/api/v1/horizontal-properties/residents", 403},
		{"GET", "/api/v1/horizontal-properties/packages", 403},
		{"PUT", "/api/v1/horizontal-properties/1", 403},
		{"GET", "/api/v1/dashboard/today", 403},
		{"GET", "/api/v1/users", 403},
		{"POST", "/api/v1/businesses", 403},
	}
	for _, tc := range cases {
		if got := do(r, tc.method, tc.path, "consejero"); got != tc.want {
			t.Errorf("%s %s = %d, se esperaba %d", tc.method, tc.path, got, tc.want)
		}
	}
}

func TestModuleAccess_AdminDeVotacionesGestionaTodo(t *testing.T) {
	r := newRouter(&fakeLookup{byRole: map[uint]map[string][]string{roleAdmin: {
		middleware.ResourceVotaciones:          crud,
		middleware.ResourceContrasenasVotacion: crud,
		middleware.ResourceVotacionEnVivo:      crud,
	}}})
	const vg = "/api/v1/horizontal-properties/voting-groups"
	for _, tc := range []struct{ method, path string }{
		{"POST", vg},
		{"DELETE", vg + "/3"},
		{"PATCH", vg + "/3/votings/8/activate"},
		{"POST", vg + "/3/votings/8/votes"},
		{"POST", vg + "/3/credentials/generate"},
		{"GET", vg + "/3/credentials"},
		{"GET", vg + "/3/votings/8/stream"},
		{"POST", "/api/v1/attendance/lists/generate"},
		{"POST", "/api/v1/attendance/records/9/mark"},
		{"PUT", "/api/v1/attendance/records/9/proxy"},
	} {
		if got := do(r, tc.method, tc.path, "admin"); got != 200 {
			t.Errorf("%s %s = %d, se esperaba 200", tc.method, tc.path, got)
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
