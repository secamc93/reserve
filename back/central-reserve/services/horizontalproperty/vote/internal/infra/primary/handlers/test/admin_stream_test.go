package handlers_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	sharedjwt "central_reserve/shared/jwt"
)

func businessToken(t *testing.T, businessID uint) string {
	t.Helper()
	tok, err := sharedjwt.New(testSecret).GenerateBusinessToken(1, businessID, 1, 1)
	if err != nil {
		t.Fatal(err)
	}
	return tok
}

func adminStream(t *testing.T, srv *httptest.Server, ctx context.Context, path, token string) *http.Response {
	t.Helper()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, srv.URL+path, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	return resp
}

// El SSE admin funciona con el business token en el header Authorization (como lo consume el
// route handler de Next) y emite initial_data con votos y resultados y new_vote en vivo.
func TestAdminStream_BusinessTokenPorHeader(t *testing.T) {
	var yes atomic.Int64
	repo := fakeRepo(false, nil, &yes)
	repo.ListVotesByVotingFn = func(ctx context.Context, vid uint) ([]domain.Vote, error) { return nil, nil }
	r, vc := newRouter(t, repo)
	srv := httptest.NewServer(r)
	defer srv.Close()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	resp := adminStream(t, srv, ctx, "/api/v1/horizontal-properties/voting-groups/3/votings/30/stream", businessToken(t, hpID))
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status %d", resp.StatusCode)
	}
	events := readSSE(resp)
	waitEvent(t, events, "connected", 2*time.Second)
	ini := waitEvent(t, events, "initial_data", 2*time.Second)
	if votes, ok := ini.Data["votes"].([]any); !ok || len(votes) != 0 {
		t.Errorf("initial_data del admin debe traer votes (lista): %v", ini.Data)
	}
	yes.Store(1)
	_ = vc.PublishVote(votingID, domain.VoteDTO{ID: 1, VotingID: votingID, PropertyUnitID: unitID, VotingOptionID: optionYes})
	ev := waitEvent(t, events, "new_vote", 2*time.Second)
	if voteCount(t, ev.Data, optionYes) != 1 || ev.Data["vote"] == nil {
		t.Errorf("new_vote del admin: %v", ev.Data)
	}
}

// Aislamiento: un negocio no puede abrir el stream de una votación de otro negocio, ni una
// votación que no es del grupo de la ruta.
func TestAdminStream_Aislamiento(t *testing.T) {
	r, _ := newRouter(t, fakeRepo(false, nil, nil))
	casos := []struct {
		nombre, path, token string
		want                int
	}{
		{"otro negocio", "/api/v1/horizontal-properties/voting-groups/3/votings/30/stream", businessToken(t, otherHP), http.StatusNotFound},
		{"votación de otro grupo", "/api/v1/horizontal-properties/voting-groups/3/votings/40/stream", businessToken(t, hpID), http.StatusNotFound},
		{"super admin con business_id ajeno", "/api/v1/horizontal-properties/voting-groups/3/votings/30/stream?business_id=8", businessToken(t, 0), http.StatusNotFound},
		{"sin token", "/api/v1/horizontal-properties/voting-groups/3/votings/30/stream", "", http.StatusUnauthorized},
	}
	for _, tc := range casos {
		t.Run(tc.nombre, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, tc.path, nil)
			if tc.token != "" {
				req.Header.Set("Authorization", "Bearer "+tc.token)
			}
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)
			if w.Code != tc.want {
				t.Fatalf("se esperaba %d, got %d %s", tc.want, w.Code, w.Body.String())
			}
		})
	}
}
