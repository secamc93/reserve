//go:build integration

package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/vote"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/votingstream"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/repository"
	sharedjwt "central_reserve/shared/jwt"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"

	"github.com/gin-gonic/gin"
)

// itEnv levanta el módulo completo (bundle real: repo GORM, cache, handlers) contra Postgres en
// un httptest.Server con WriteTimeout corto, como el http.Server de producción (15 s).
type itEnv struct {
	t      *testing.T
	srv    *httptest.Server
	repo   domain.VotingRepository
	hp     *testkit.HorizontalProperty
	other  *testkit.HorizontalProperty
	admin  string // business token del negocio hp
	secret string
}

func newITEnv(t *testing.T) *itEnv {
	t.Helper()
	database := testkit.DB(t)
	logger := testkit.Logger(t)
	secret := "it-secret-" + testkit.Suffix()
	gin.SetMode(gin.TestMode)
	middleware.InitFromEnv(fixedConfig{"JWT_SECRET": secret}, logger)

	r := gin.New()
	vote.New(database, secret, logger, r.Group("/api/v1"))
	srv := httptest.NewUnstartedServer(r)
	srv.Config.WriteTimeout = time.Second
	srv.Start()
	t.Cleanup(srv.Close)

	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{
		{Number: "IT-101", Coefficient: 40, ResidentName: "Ana Residente"},
		{Number: "IT-102", Coefficient: 60}, // sin residentes
	})
	other := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "OT-101", Coefficient: 100}})
	admin, err := sharedjwt.New(secret).GenerateBusinessToken(1, hp.BusinessID, 1, 1)
	if err != nil {
		t.Fatal(err)
	}
	return &itEnv{t: t, srv: srv, repo: repository.New(database, logger), hp: hp, other: other, admin: admin, secret: secret}
}

func (e *itEnv) call(method, path, token string, body any) (int, map[string]any) {
	e.t.Helper()
	var rd io.Reader
	if body != nil {
		b, _ := json.Marshal(body)
		rd = bytes.NewReader(b)
	}
	req, _ := http.NewRequest(method, e.srv.URL+"/api/v1"+path, rd)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		e.t.Fatalf("%s %s: %v", method, path, err)
	}
	defer resp.Body.Close()
	var out map[string]any
	_ = json.NewDecoder(resp.Body).Decode(&out)
	return resp.StatusCode, out
}

func dataOf(out map[string]any) map[string]any {
	d, _ := out["data"].(map[string]any)
	return d
}

// newGroup crea un grupo por la API admin (flag nil = no se envía) con una votación activa y una
// opción "Sí". Devuelve group_id, voting_id, option_id.
func (e *itEnv) newGroup(flag *bool) (uint, uint, uint) {
	e.t.Helper()
	body := map[string]any{
		"name": "IT Voto público " + testkit.Suffix(), "description": "integración",
		"voting_start_date": time.Now().Add(-time.Minute).UTC().Format(time.RFC3339),
		"voting_end_date":   time.Now().Add(time.Hour).UTC().Format(time.RFC3339),
		"requires_quorum":   false,
	}
	if flag != nil {
		body["require_document_validation"] = *flag
	}
	st, out := e.call(http.MethodPost, "/horizontal-properties/voting-groups", e.admin, body)
	if st != http.StatusCreated {
		e.t.Fatalf("crear grupo: %d %v", st, out)
	}
	g := dataOf(out)
	want := flag != nil && *flag
	if g["require_document_validation"] != want {
		e.t.Fatalf("crear grupo: require_document_validation=%v, se esperaba %v", g["require_document_validation"], want)
	}
	gid := uint(g["id"].(float64))

	ctx := context.Background()
	v, err := e.repo.CreateVoting(ctx, &domain.Voting{VotingGroupID: gid, Title: "IT votación", Description: "IT", VotingType: "simple", DisplayOrder: 1})
	if err != nil {
		e.t.Fatalf("CreateVoting: %v", err)
	}
	o, err := e.repo.CreateVotingOption(ctx, &domain.VotingOption{VotingID: v.ID, OptionText: "Sí", OptionCode: "SI", Color: "#1f8a4c", DisplayOrder: 1})
	if err != nil {
		e.t.Fatalf("CreateVotingOption: %v", err)
	}
	if err := e.repo.ActivateVoting(ctx, v.ID); err != nil {
		e.t.Fatalf("ActivateVoting: %v", err)
	}
	return gid, v.ID, o.ID
}

func (e *itEnv) qrToken(groupID uint) string {
	e.t.Helper()
	st, out := e.call(http.MethodPost, fmt.Sprintf("/horizontal-properties/voting-groups/%d/generate-public-url", groupID), e.admin, map[string]any{"duration_hours": 1})
	if st != http.StatusOK {
		e.t.Fatalf("generate-public-url: %d %v", st, out)
	}
	return dataOf(out)["token"].(string)
}

func boolp(b bool) *bool { return &b }

// Flujo público completo con require_document_validation = false (por defecto): se vota por
// unidad sin documento, incluso una unidad sin residentes, y el SSE público con el token de
// grupo + voting_id recibe el voto en vivo (también pasado el WriteTimeout del servidor).
func TestIntegration_VotoPublico_SinDocumento(t *testing.T) {
	e := newITEnv(t)
	gid, vid, optID := e.newGroup(nil)
	qr := e.qrToken(gid)

	st, out := e.call(http.MethodGet, "/public/voting-context", qr, nil)
	if st != http.StatusOK || dataOf(out)["require_document_validation"] != false {
		t.Fatalf("voting-context: %d %v", st, out)
	}

	// Unidad de otra propiedad -> 404; unidad inexistente -> 404.
	if st, out := e.call(http.MethodPost, "/public/validate-resident", qr, map[string]any{"property_unit_id": e.other.UnitID(0)}); st != http.StatusNotFound {
		t.Fatalf("unidad de otra propiedad: se esperaba 404, got %d %v", st, out)
	}

	// Unidad con residente: dni ignorado (aunque sea erróneo), devuelve el nombre del residente.
	st, out = e.call(http.MethodPost, "/public/validate-resident", qr, map[string]any{"property_unit_id": e.hp.UnitID(0), "dni": "no-importa"})
	if st != http.StatusOK || dataOf(out)["resident_name"] != "Ana Residente" {
		t.Fatalf("validar unidad con residente: %d %v", st, out)
	}

	// Unidad sin residentes: puede votar, resident_id 0 y nombre "Unidad <número>".
	st, out = e.call(http.MethodPost, "/public/validate-resident", qr, map[string]any{"property_unit_id": e.hp.UnitID(1)})
	d := dataOf(out)
	if st != http.StatusOK || d["resident_name"] != "Unidad IT-102" || d["resident_id"].(float64) != 0 || d["require_document_validation"] != false {
		t.Fatalf("validar unidad sin residente: %d %v", st, out)
	}
	vat := d["voting_auth_token"].(string)

	st, out = e.call(http.MethodGet, "/public/voting-group/votings", vat, nil)
	if st != http.StatusOK || dataOf(out)["voting_group"].(map[string]any)["require_document_validation"] != false {
		t.Fatalf("voting-group/votings: %d %v", st, out)
	}

	// SSE público con el token del residente de grupo + voting_id.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/v1/public/voting-stream?voting_id=%d&token=%s", e.srv.URL, vid, vat), nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		t.Fatalf("voting-stream: %d %s", resp.StatusCode, b)
	}
	events := readSSE(resp)
	waitEvent(t, events, "connected", 3*time.Second)
	if n := voteCount(t, waitEvent(t, events, "initial_data", 3*time.Second).Data, optID); n != 0 {
		t.Fatalf("initial_data con %d votos", n)
	}

	// Se vota pasado el WriteTimeout (1 s) del servidor: el stream debe seguir vivo.
	time.Sleep(1500 * time.Millisecond)
	if err := e.repo.MarkUnitAttendanceForVoting(context.Background(), vid, e.hp.UnitID(1), true); err != nil {
		t.Fatalf("marcar asistencia: %v", err)
	}
	st, out = e.call(http.MethodPost, "/public/vote", vat, map[string]any{"voting_id": vid, "voting_option_id": optID})
	if st != http.StatusCreated && st != http.StatusOK {
		t.Fatalf("voto público (unidad sin residente): %d %v", st, out)
	}
	ev := waitEvent(t, events, "new_vote", 3*time.Second)
	if n := voteCount(t, ev.Data, optID); n != 1 {
		t.Fatalf("new_vote con vote_count %d, se esperaba 1: %v", n, ev.Data)
	}

	// Voto único por unidad y voting-info ve el voto por la unidad del token.
	if st, out := e.call(http.MethodPost, "/public/vote", vat, map[string]any{"voting_id": vid, "voting_option_id": optID}); st != http.StatusConflict {
		t.Fatalf("voto duplicado: se esperaba 409, got %d %v", st, out)
	}
	st, out = e.call(http.MethodGet, fmt.Sprintf("/public/voting-info?voting_id=%d", vid), vat, nil)
	if st != http.StatusOK || dataOf(out)["has_voted"] != true {
		t.Fatalf("voting-info debe marcar has_voted: %d %v", st, out)
	}

	// Reset por la API admin: llega votes_reset y el stream sigue abierto.
	st, out = e.call(http.MethodDelete, fmt.Sprintf("/horizontal-properties/voting-groups/%d/votings/%d/votes/reset", gid, vid), e.admin, nil)
	if st != http.StatusOK && st != http.StatusNoContent {
		t.Fatalf("reset: %d %v", st, out)
	}
	if n := voteCount(t, waitEvent(t, events, "votes_reset", 3*time.Second).Data, optID); n != 0 {
		t.Fatalf("votes_reset con %d votos", n)
	}
}

// Con require_document_validation = true el documento es obligatorio y debe coincidir; el
// grupo se puede cambiar por la API y un PUT sin el campo lo conserva.
func TestIntegration_VotoPublico_ConDocumento(t *testing.T) {
	e := newITEnv(t)
	gid, _, _ := e.newGroup(boolp(true))

	// Listar grupos devuelve la bandera.
	st, out := e.call(http.MethodGet, "/horizontal-properties/voting-groups", e.admin, nil)
	if st != http.StatusOK {
		t.Fatalf("listar grupos: %d %v", st, out)
	}
	found := false
	for _, g := range out["data"].([]any) {
		m := g.(map[string]any)
		if uint(m["id"].(float64)) == gid {
			found = m["require_document_validation"] == true
		}
	}
	if !found {
		t.Fatalf("listar grupos no devuelve require_document_validation=true para %d: %v", gid, out["data"])
	}

	// PUT sin el campo conserva true.
	put := map[string]any{
		"name": "IT editado " + testkit.Suffix(), "description": "x",
		"voting_start_date": time.Now().UTC().Format(time.RFC3339),
		"voting_end_date":   time.Now().Add(time.Hour).UTC().Format(time.RFC3339),
	}
	st, out = e.call(http.MethodPut, fmt.Sprintf("/horizontal-properties/voting-groups/%d", gid), e.admin, put)
	if st != http.StatusOK || dataOf(out)["require_document_validation"] != true {
		t.Fatalf("PUT sin el campo debe conservar true: %d %v", st, out)
	}

	qr := e.qrToken(gid)
	st, out = e.call(http.MethodGet, "/public/voting-context", qr, nil)
	d := dataOf(out)
	if st != http.StatusOK || d["require_document_validation"] != true || d["voting_group"].(map[string]any)["require_document_validation"] != true {
		t.Fatalf("voting-context: %d %v", st, out)
	}

	unit := e.hp.UnitID(0)
	dni := "IT" + testkit.Suffix()
	if len(dni) > 30 {
		dni = dni[:30]
	}
	conn := testkit.DB(t).Conn(context.Background())
	if err := conn.Model(&models.Resident{}).Where("id = ?", e.hp.ResidentIDByUnit[unit]).Update("dni", dni).Error; err != nil {
		t.Fatalf("asignando dni: %v", err)
	}

	if st, out := e.call(http.MethodPost, "/public/validate-resident", qr, map[string]any{"property_unit_id": unit}); st != http.StatusBadRequest || out["message"] != "Documento requerido" {
		t.Fatalf("sin dni: se esperaba 400 Documento requerido, got %d %v", st, out)
	}
	if st, out := e.call(http.MethodPost, "/public/validate-resident", qr, map[string]any{"property_unit_id": unit, "dni": "000"}); st != http.StatusNotFound {
		t.Fatalf("dni erróneo: se esperaba 404, got %d %v", st, out)
	}
	// La unidad sin residentes no puede votar si se exige documento.
	if st, out := e.call(http.MethodPost, "/public/validate-resident", qr, map[string]any{"property_unit_id": e.hp.UnitID(1), "dni": dni}); st != http.StatusNotFound {
		t.Fatalf("dni de otra unidad: se esperaba 404, got %d %v", st, out)
	}
	st, out = e.call(http.MethodPost, "/public/validate-resident", qr, map[string]any{"property_unit_id": unit, "dni": dni})
	d = dataOf(out)
	if st != http.StatusOK || d["resident_name"] != "Ana Residente" || d["require_document_validation"] != true || d["voting_auth_token"] == "" {
		t.Fatalf("dni correcto: %d %v", st, out)
	}

	// Cambiar a false por la API: ya no se pide documento.
	put["require_document_validation"] = false
	if st, out := e.call(http.MethodPut, fmt.Sprintf("/horizontal-properties/voting-groups/%d", gid), e.admin, put); st != http.StatusOK || dataOf(out)["require_document_validation"] != false {
		t.Fatalf("PUT a false: %d %v", st, out)
	}
	if st, out := e.call(http.MethodPost, "/public/validate-resident", qr, map[string]any{"property_unit_id": unit}); st != http.StatusOK {
		t.Fatalf("tras desactivar la bandera debe validar sin dni: %d %v", st, out)
	}
}

// El SSE admin funciona con el business token por header y aísla por negocio.
func TestIntegration_StreamAdmin(t *testing.T) {
	e := newITEnv(t)
	gid, vid, optID := e.newGroup(nil)
	votingstream.HeartbeatInterval = 30 * time.Second

	otherAdmin, _ := sharedjwt.New(e.secret).GenerateBusinessToken(1, e.other.BusinessID, 1, 1)
	path := fmt.Sprintf("/horizontal-properties/voting-groups/%d/votings/%d/stream", gid, vid)
	if st, out := e.call(http.MethodGet, path, otherAdmin, nil); st != http.StatusNotFound {
		t.Fatalf("stream de otro negocio: se esperaba 404, got %d %v", st, out)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, e.srv.URL+"/api/v1"+path, nil)
	req.Header.Set("Authorization", "Bearer "+e.admin)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("stream admin: %d", resp.StatusCode)
	}
	events := readSSE(resp)
	waitEvent(t, events, "connected", 3*time.Second)
	waitEvent(t, events, "initial_data", 3*time.Second)

	st, out := e.call(http.MethodPost, fmt.Sprintf("/horizontal-properties/voting-groups/%d/votings/%d/votes", gid, vid), e.admin,
		map[string]any{"property_unit_id": e.hp.UnitID(0), "voting_option_id": optID})
	if st != http.StatusCreated && st != http.StatusOK {
		t.Fatalf("voto admin: %d %v", st, out)
	}
	ev := waitEvent(t, events, "new_vote", 3*time.Second)
	if voteCount(t, ev.Data, optID) != 1 || ev.Data["vote"] == nil {
		t.Fatalf("new_vote admin: %v", ev.Data)
	}
	voteID := uint(ev.Data["vote"].(map[string]any)["id"].(float64))
	st, out = e.call(http.MethodDelete, fmt.Sprintf("/horizontal-properties/voting-groups/%d/votings/%d/votes/%d", gid, vid, voteID), e.admin, nil)
	if st != http.StatusOK && st != http.StatusNoContent {
		t.Fatalf("anular voto: %d %v", st, out)
	}
	if voteCount(t, waitEvent(t, events, "vote_deleted", 3*time.Second).Data, optID) != 0 {
		t.Fatal("vote_deleted debe traer el conteo en 0")
	}
}
