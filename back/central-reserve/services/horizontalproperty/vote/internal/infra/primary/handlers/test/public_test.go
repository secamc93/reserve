package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	sharedjwt "central_reserve/shared/jwt"
)

const (
	hpID      = uint(7)
	otherHP   = uint(8)
	groupID   = uint(3)
	otherGrp  = uint(4)
	votingID  = uint(30)
	otherVot  = uint(40)
	optionYes = uint(301)
	unitID    = uint(101)
)

// fakeRepo: grupo groupID (de hpID) con la votación votingID; la votación otherVot es de otro grupo.
func fakeRepo(requireDoc bool, unit *domain.PublicVoterUnitDTO, yesVotes *atomic.Int64) *mocks.MockVotingRepository {
	repo := mocks.NewMockVotingRepository()
	repo.GetVotingGroupByIDFn = func(ctx context.Context, id uint) (*domain.VotingGroup, error) {
		switch id {
		case groupID:
			return &domain.VotingGroup{ID: groupID, BusinessID: hpID, Name: "Asamblea", RequireDocumentValidation: requireDoc}, nil
		case otherGrp:
			return &domain.VotingGroup{ID: otherGrp, BusinessID: otherHP, Name: "Otra"}, nil
		}
		return nil, domain.ErrVotingGroupNotFound
	}
	repo.GetVotingByIDFn = func(ctx context.Context, id uint) (*domain.Voting, error) {
		switch id {
		case votingID:
			return &domain.Voting{ID: votingID, VotingGroupID: groupID, Title: "Presupuesto", IsActive: true}, nil
		case otherVot:
			return &domain.Voting{ID: otherVot, VotingGroupID: otherGrp, Title: "Ajena", IsActive: true}, nil
		}
		return nil, domain.ErrVotingNotFound
	}
	repo.GetPublicVoterUnitFn = func(ctx context.Context, hp, pu uint) (*domain.PublicVoterUnitDTO, error) {
		if hp != hpID || unit == nil || pu != unit.PropertyUnitID {
			return nil, domain.ErrPropertyUnitNotFound
		}
		return unit, nil
	}
	repo.GetResidentByUnitAndDniFn = func(ctx context.Context, hp, pu uint, dni string) (*domain.ResidentBasicDTO, error) {
		return nil, domain.ErrResidentNotFound
	}
	repo.GetVotingResultsFn = func(ctx context.Context, vid uint) ([]domain.VotingResultDTO, error) {
		n := 0
		if yesVotes != nil {
			n = int(yesVotes.Load())
		}
		return []domain.VotingResultDTO{{VotingOptionID: optionYes, OptionText: "Sí", OptionCode: "SI", VoteCount: n, Percentage: 100, PercentageByCoefficient: 20}}, nil
	}
	return repo
}

func groupQRToken(t *testing.T, gid, hp uint) string {
	t.Helper()
	tok, err := sharedjwt.New(testSecret).GeneratePublicGroupVotingToken(gid, hp, 1)
	if err != nil {
		t.Fatal(err)
	}
	return tok
}

func postValidate(t *testing.T, srv http.Handler, token string, body map[string]any) (int, map[string]any) {
	t.Helper()
	b, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/public/validate-resident", bytes.NewReader(b))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)
	var out map[string]any
	_ = json.Unmarshal(w.Body.Bytes(), &out)
	return w.Code, out
}

func TestValidateResidentHTTP_ConDocumentoSinDni400(t *testing.T) {
	r, _ := newRouter(t, fakeRepo(true, nil, nil))
	code, out := postValidate(t, r, groupQRToken(t, groupID, hpID), map[string]any{"property_unit_id": unitID})
	if code != http.StatusBadRequest || out["message"] != "Documento requerido" {
		t.Fatalf("se esperaba 400 Documento requerido, got %d %v", code, out)
	}
}

func TestValidateResidentHTTP_SinDocumentoUnidadAjena404(t *testing.T) {
	unit := &domain.PublicVoterUnitDTO{PropertyUnitID: unitID, PropertyUnitNumber: "101", IsActive: true}
	r, _ := newRouter(t, fakeRepo(false, unit, nil))
	code, out := postValidate(t, r, groupQRToken(t, groupID, hpID), map[string]any{"property_unit_id": 999})
	if code != http.StatusNotFound || out["message"] != "Unidad no encontrada" {
		t.Fatalf("se esperaba 404 Unidad no encontrada, got %d %v", code, out)
	}
}

func TestValidateResidentHTTP_SinDocumentoUnidadSinResidente(t *testing.T) {
	unit := &domain.PublicVoterUnitDTO{PropertyUnitID: unitID, PropertyUnitNumber: "T1-101", IsActive: true}
	r, _ := newRouter(t, fakeRepo(false, unit, nil))
	code, out := postValidate(t, r, groupQRToken(t, groupID, hpID), map[string]any{"property_unit_id": unitID})
	if code != http.StatusOK {
		t.Fatalf("se esperaba 200, got %d %v", code, out)
	}
	data := out["data"].(map[string]any)
	if data["resident_name"] != "Unidad T1-101" || data["resident_id"].(float64) != 0 || data["require_document_validation"] != false {
		t.Errorf("respuesta inesperada: %v", data)
	}
	claims, err := sharedjwt.New(testSecret).ValidateVotingAuthToken(data["voting_auth_token"].(string))
	if err != nil {
		t.Fatalf("voting_auth_token inválido: %v", err)
	}
	if claims.ResidentID != 0 || claims.PropertyUnitID != unitID || claims.VotingGroupID != groupID || claims.VotingID != nil {
		t.Errorf("claims inesperados: %+v", claims)
	}
}

func residentGroupToken(t *testing.T, gid, hp uint) string {
	t.Helper()
	tok, err := sharedjwt.New(testSecret).GenerateGroupVotingAuthToken(0, unitID, gid, hp)
	if err != nil {
		t.Fatal(err)
	}
	return tok
}

func TestPublicStream_TokenDeGrupoSinVotingID400(t *testing.T) {
	r, _ := newRouter(t, fakeRepo(false, nil, nil))
	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/voting-stream?token="+residentGroupToken(t, groupID, hpID), nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("se esperaba 400, got %d %s", w.Code, w.Body.String())
	}
}

func TestPublicStream_VotacionDeOtroGrupo404(t *testing.T) {
	r, _ := newRouter(t, fakeRepo(false, nil, nil))
	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/voting-stream?voting_id=40&token="+residentGroupToken(t, groupID, hpID), nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusNotFound {
		t.Fatalf("se esperaba 404, got %d %s", w.Code, w.Body.String())
	}
}

func TestPublicStream_TokenInvalido401(t *testing.T) {
	r, _ := newRouter(t, fakeRepo(false, nil, nil))
	// El token del QR (scope public_voting_group) no sirve: hace falta el de validate-resident.
	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/voting-stream?voting_id=30&token="+groupQRToken(t, groupID, hpID), nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("se esperaba 401, got %d %s", w.Code, w.Body.String())
	}
}

// El stream público con token de grupo + voting_id emite initial_data y un evento por cada
// voto, anulación y reset, sin cortar la conexión; el token va por header Authorization.
func TestPublicStream_EventosEnVivo(t *testing.T) {
	var yes atomic.Int64
	r, vc := newRouter(t, fakeRepo(false, nil, &yes))
	srv := httptest.NewServer(r)
	defer srv.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, srv.URL+"/api/v1/public/voting-stream?voting_id=30", nil)
	req.Header.Set("Authorization", "Bearer "+residentGroupToken(t, groupID, hpID))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK || resp.Header.Get("Content-Type") != "text/event-stream" {
		t.Fatalf("status %d, content-type %q", resp.StatusCode, resp.Header.Get("Content-Type"))
	}
	events := readSSE(resp)

	waitEvent(t, events, "connected", 2*time.Second)
	ini := waitEvent(t, events, "initial_data", 2*time.Second)
	if voteCount(t, ini.Data, optionYes) != 0 {
		t.Errorf("initial_data: %v", ini.Data)
	}
	if _, ok := ini.Data["votes"]; ok {
		t.Error("el stream público no debe exponer los votos individuales")
	}

	yes.Store(1)
	_ = vc.PublishVote(votingID, domain.VoteDTO{ID: 900, VotingID: votingID, PropertyUnitID: unitID, VotingOptionID: optionYes})
	ev := waitEvent(t, events, "new_vote", 2*time.Second)
	if voteCount(t, ev.Data, optionYes) != 1 || ev.Data["total_votes"].(float64) != 1 {
		t.Errorf("new_vote: %v", ev.Data)
	}
	if _, ok := ev.Data["vote"]; ok {
		t.Error("el stream público no debe exponer el voto individual")
	}

	yes.Store(0)
	_ = vc.RemoveVote(votingID, 900)
	ev = waitEvent(t, events, "vote_deleted", 2*time.Second)
	if voteCount(t, ev.Data, optionYes) != 0 {
		t.Errorf("vote_deleted: %v", ev.Data)
	}

	yes.Store(1)
	_ = vc.PublishVote(votingID, domain.VoteDTO{ID: 901, VotingID: votingID, PropertyUnitID: unitID, VotingOptionID: optionYes})
	waitEvent(t, events, "new_vote", 2*time.Second)
	yes.Store(0)
	_ = vc.ResetVotes(votingID)
	ev = waitEvent(t, events, "votes_reset", 2*time.Second)
	if voteCount(t, ev.Data, optionYes) != 0 {
		t.Errorf("votes_reset: %v", ev.Data)
	}

	// Tras el reset la conexión sigue viva.
	yes.Store(1)
	_ = vc.PublishVote(votingID, domain.VoteDTO{ID: 902, VotingID: votingID, PropertyUnitID: unitID, VotingOptionID: optionYes})
	waitEvent(t, events, "new_vote", 2*time.Second)
}
