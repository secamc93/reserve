package handlers_test

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// Aislamiento multi-tenant de las rutas admin de votaciones (ScopeGuard): con el token de otra
// propiedad, toda ruta con :group_id responde 404 y NO llega al repositorio. Antes, editar o borrar
// un grupo (y crear votaciones, votar, etc.) no verificaba la propiedad del grupo.
func TestScopeGuard_OtraPropiedadNoTocaNada(t *testing.T) {
	var writes atomic.Int64
	repo := fakeRepo(false, nil, &atomic.Int64{})
	hit := func() { writes.Add(1) }
	repo.UpdateVotingGroupFn = func(ctx context.Context, id uint, g *domain.VotingGroup) (*domain.VotingGroup, error) {
		hit()
		return g, nil
	}
	repo.DeleteVotingGroupFn = func(ctx context.Context, id uint) error { hit(); return nil }
	repo.CreateVotingFn = func(ctx context.Context, v *domain.Voting) (*domain.Voting, error) { hit(); return v, nil }
	repo.UpdateVotingFn = func(ctx context.Context, id uint, v *domain.Voting) (*domain.Voting, error) { hit(); return v, nil }
	repo.ActivateVotingFn = func(ctx context.Context, id uint) error { hit(); return nil }
	repo.DeleteVotingFn = func(ctx context.Context, id uint) error { hit(); return nil }
	repo.CreateVotingOptionFn = func(ctx context.Context, o *domain.VotingOption) (*domain.VotingOption, error) {
		hit()
		return o, nil
	}
	repo.CreateVoteFn = func(ctx context.Context, v domain.Vote) (*domain.Vote, error) { hit(); return &v, nil }
	repo.DeleteVoteFn = func(ctx context.Context, id uint) error { hit(); return nil }
	repo.MarkUnitAttendanceForVotingFn = func(ctx context.Context, vid, uid uint, mark bool) error { hit(); return nil }

	r, _ := newRouter(t, repo)
	ajeno := businessToken(t, otherHP)
	g := "/api/v1/horizontal-properties/voting-groups/3"
	v := g + "/votings/30"

	cases := []struct {
		method, path, body string
	}{
		{http.MethodPut, g, `{"name":"Hackeado","voting_start_date":"2026-10-14T00:00:00Z","voting_end_date":"2026-10-15T00:00:00Z"}`},
		{http.MethodDelete, g, ``},
		{http.MethodPost, g + "/votings", `{"title":"Ajena","description":"x","voting_type":"simple","display_order":1}`},
		{http.MethodPut, v, `{"title":"Ajena","description":"x","voting_type":"simple","display_order":1}`},
		{http.MethodPatch, v + "/activate", ``},
		{http.MethodDelete, v, ``},
		{http.MethodPost, v + "/options", `{"option_text":"Sí","option_code":"SI","color":"#1f8a4c","display_order":1}`},
		{http.MethodPost, v + "/votes", `{"property_unit_id":5,"voting_option_id":301}`},
		{http.MethodDelete, v + "/votes/1", ``},
		{http.MethodPut, v + "/units/5/attendance", `{"mark_attendance":true}`},
		{http.MethodGet, v + "/voting-details", ``},
		{http.MethodPost, g + "/generate-public-url", `{"duration_hours":1}`},
	}
	for _, tc := range cases {
		t.Run(tc.method+" "+tc.path, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, bytes.NewBufferString(tc.body))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+ajeno)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)
			if w.Code != http.StatusNotFound {
				t.Fatalf("token de otra propiedad: esperaba 404, obtuvo %d: %s", w.Code, w.Body.String())
			}
		})
	}
	if n := writes.Load(); n != 0 {
		t.Fatalf("ninguna ruta debía llegar al repositorio con el token ajeno, llegaron %d escrituras", n)
	}
}

func TestScopeGuard_PermitidosYVotacionDeOtroGrupo(t *testing.T) {
	repo := fakeRepo(false, nil, &atomic.Int64{})
	repo.ListVotingOptionsByVotingFn = func(ctx context.Context, id uint) ([]domain.VotingOption, error) { return nil, nil }
	r, _ := newRouter(t, repo)

	do := func(path, token string) int {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		return w.Code
	}
	own := businessToken(t, hpID)
	super := businessToken(t, 0)

	// Votación 40 es de otro grupo aunque se pida bajo el grupo 3 (propio): 404.
	if code := do("/api/v1/horizontal-properties/voting-groups/3/votings/40/options", own); code != http.StatusNotFound {
		t.Errorf("votación de otro grupo bajo un grupo propio: esperaba 404, obtuvo %d", code)
	}
	// Grupo inexistente o id inválido: 404.
	for _, p := range []string{"/api/v1/horizontal-properties/voting-groups/999/votings", "/api/v1/horizontal-properties/voting-groups/abc/votings"} {
		if code := do(p, own); code != http.StatusNotFound {
			t.Errorf("%s: esperaba 404, obtuvo %d", p, code)
		}
	}
	// Propio y super admin (con su business_id correcto o sin él) pasan el guard.
	for name, tc := range map[string]struct{ path, token string }{
		"propietario":                 {"/api/v1/horizontal-properties/voting-groups/3/votings/30/options", own},
		"super admin sin business_id": {"/api/v1/horizontal-properties/voting-groups/3/votings/30/options", super},
		"super admin con business_id": {"/api/v1/horizontal-properties/voting-groups/3/votings/30/options?business_id=7", super},
	} {
		if code := do(tc.path, tc.token); code == http.StatusNotFound || code == http.StatusUnauthorized {
			t.Errorf("%s: el guard no debía bloquear, obtuvo %d", name, code)
		}
	}
	// Super admin con business_id de otra propiedad: 404.
	if code := do("/api/v1/horizontal-properties/voting-groups/3/votings/30/options?business_id=8", super); code != http.StatusNotFound {
		t.Errorf("super admin con business_id ajeno: esperaba 404, obtuvo %d", code)
	}
	// Las rutas sin :group_id (listar grupos) no pasan por el guard.
	if code := do("/api/v1/horizontal-properties/voting-groups?business_id=7", super); code == http.StatusNotFound {
		t.Errorf("listar grupos no debe pasar por el guard, obtuvo %d", code)
	}
}
