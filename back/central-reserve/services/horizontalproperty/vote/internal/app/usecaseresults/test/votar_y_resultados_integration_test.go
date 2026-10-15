//go:build integration

package usecaseresults_test

import (
	"math"
	"strings"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseresults"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/cache"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
)

// porcentajesPorCoeficiente reproduce la regla de negocio de la asamblea: el peso de cada
// opción es la suma de los coeficientes de participación de las unidades que la eligieron,
// sobre el total de coeficientes de la propiedad (100).
func porcentajesPorCoeficiente(details []domain.VotingDetailByUnitDTO) (porOpcion map[uint]float64, sinVotar float64, total float64) {
	porOpcion = map[uint]float64{}
	for _, d := range details {
		coef := 0.0
		if d.ParticipationCoefficient != nil {
			coef = *d.ParticipationCoefficient
		}
		total += coef
		if d.HasVoted && d.VotingOptionID != nil {
			porOpcion[*d.VotingOptionID] += coef
		} else {
			sinVotar += coef
		}
	}
	for k, v := range porOpcion {
		porOpcion[k] = v / total * 100
	}
	sinVotar = sinVotar / total * 100
	return porOpcion, sinVotar, total
}

func casi(a, b float64) bool { return math.Abs(a-b) < 1e-6 }

// CU-02 con caso de uso y repositorio reales (sin mocks): las unidades con asistencia votan,
// el voto duplicado se rechaza, la unidad sin asistencia no puede votar, y los resultados por
// unidad permiten calcular los porcentajes por COEFICIENTE (no por número de unidades).
func TestVotarYLeerResultados_PorcentajesPorCoeficiente(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	logger := testkit.Logger(t)
	repo := repository.New(database, logger)
	votingCache := cache.New()
	votes := usecasevotes.New(repo, votingCache, logger)
	results := usecaseresults.New(repo, votingCache, logger)

	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{
		{Number: "101", Coefficient: 40, ResidentName: "Ana IT"},
		{Number: "102", Coefficient: 25, ResidentName: "Beto IT"},
		{Number: "103", Coefficient: 20},
		{Number: "104", Coefficient: 15},
	})
	u := hp.UnitID

	quorum := 50.0
	group, err := repo.CreateVotingGroup(ctx, &domain.VotingGroup{
		BusinessID: hp.BusinessID, Name: "Asamblea IT " + hp.Code,
		VotingStartDate: time.Now(), VotingEndDate: time.Now().Add(time.Hour),
		RequiresQuorum: true, QuorumPercentage: &quorum,
	})
	if err != nil {
		t.Fatalf("CreateVotingGroup: %v", err)
	}
	voting, err := repo.CreateVoting(ctx, &domain.Voting{
		VotingGroupID: group.ID, Title: "Aprobar presupuesto", Description: "IT", VotingType: "simple", DisplayOrder: 1,
	})
	if err != nil {
		t.Fatalf("CreateVoting: %v", err)
	}
	opt := map[string]uint{}
	for i, o := range [][2]string{{"Sí", "yes"}, {"No", "no"}, {"Abstención", "abstention"}} {
		created, err := repo.CreateVotingOption(ctx, &domain.VotingOption{VotingID: voting.ID, OptionText: o[0], OptionCode: o[1], Color: "#000000", DisplayOrder: i + 1})
		if err != nil {
			t.Fatalf("CreateVotingOption %s: %v", o[0], err)
		}
		opt[o[1]] = created.ID
	}

	// Asistencia: 101, 102 y 103 asisten; 104 no. Al existir lista de asistencia, solo votan
	// las unidades presentes.
	for _, unitID := range []uint{u(0), u(1), u(2)} {
		if err := votes.MarkUnitAttendance(ctx, voting.ID, unitID, true); err != nil {
			t.Fatalf("MarkUnitAttendance(%d): %v", unitID, err)
		}
	}

	emitir := func(unitID, optionID uint) (*domain.VoteDTO, error) {
		return votes.CreateVote(ctx, domain.CreateVoteDTO{VotingID: voting.ID, PropertyUnitID: unitID, VotingOptionID: optionID, IPAddress: "127.0.0.1"})
	}

	// 101 (40) y 103 (20) votan Sí; 102 (25) vota No.
	for _, v := range []struct {
		unit uint
		opt  string
	}{{u(0), "yes"}, {u(1), "no"}, {u(2), "yes"}} {
		dto, err := emitir(v.unit, opt[v.opt])
		if err != nil {
			t.Fatalf("CreateVote(unidad %d, %s): %v", v.unit, v.opt, err)
		}
		if dto.ID == 0 || dto.OptionCode != v.opt {
			t.Errorf("voto devuelto inesperado: %+v", dto)
		}
	}

	// Voto duplicado de 101 (ahora por No): rechazado por el caso de uso, sin cambiar el voto.
	if _, err := emitir(u(0), opt["no"]); err == nil || !strings.Contains(err.Error(), "ya votó") {
		t.Fatalf("voto duplicado de la 101: err = %v, se esperaba \"la unidad ya votó\"", err)
	}

	// 104 no registró asistencia: no puede votar.
	if _, err := emitir(u(3), opt["yes"]); err == nil || !strings.Contains(err.Error(), "asistencia") {
		t.Fatalf("voto de la 104 sin asistencia: err = %v, se esperaba rechazo por asistencia", err)
	}

	// Conteo por opción.
	res, err := results.GetVotingResults(ctx, voting.ID)
	if err != nil {
		t.Fatalf("GetVotingResults: %v", err)
	}
	counts := map[string]int{}
	for _, r := range res {
		counts[r.OptionCode] = r.VoteCount
	}
	if counts["yes"] != 2 || counts["no"] != 1 || counts["abstention"] != 0 || len(res) != 3 {
		t.Errorf("conteo por opción = %v (%d opciones), se esperaba yes=2 no=1 abstention=0", counts, len(res))
	}

	// Detalle por unidad (lo que consume el admin para calcular por coeficiente).
	details, err := results.GetVotingDetailsByUnit(ctx, voting.ID, hp.BusinessID)
	if err != nil {
		t.Fatalf("GetVotingDetailsByUnit: %v", err)
	}
	if len(details) != 4 {
		t.Fatalf("detalle = %d unidades, se esperaban 4", len(details))
	}
	byUnit := map[uint]domain.VotingDetailByUnitDTO{}
	for _, d := range details {
		byUnit[d.PropertyUnitID] = d
	}
	if d := byUnit[u(0)]; !d.HasVoted || d.VotingOptionID == nil || *d.VotingOptionID != opt["yes"] || !d.HasAttendance ||
		d.ResidentName == nil || *d.ResidentName != "Ana IT" {
		t.Errorf("detalle de la 101 inesperado: %+v", d)
	}
	if d := byUnit[u(3)]; d.HasVoted || d.HasAttendance {
		t.Errorf("la 104 no votó ni asistió: %+v", d)
	}

	pct, sinVotar, total := porcentajesPorCoeficiente(details)
	if !casi(total, 100) {
		t.Fatalf("suma de coeficientes = %v, se esperaba 100", total)
	}
	// Por coeficiente: Sí = 40+20 = 60 %, No = 25 %, sin votar = 15 %.
	// (Por número de unidades Sí sería 2/3 = 66,67 %: si el detalle perdiera los coeficientes
	// o asignara mal la opción, esto falla.)
	if !casi(pct[opt["yes"]], 60) {
		t.Errorf("Sí por coeficiente = %.4f %%, se esperaba 60 %%", pct[opt["yes"]])
	}
	if !casi(pct[opt["no"]], 25) {
		t.Errorf("No por coeficiente = %.4f %%, se esperaba 25 %%", pct[opt["no"]])
	}
	if pct[opt["abstention"]] != 0 {
		t.Errorf("Abstención por coeficiente = %.4f %%, se esperaba 0", pct[opt["abstention"]])
	}
	if !casi(sinVotar, 15) {
		t.Errorf("sin votar por coeficiente = %.4f %%, se esperaba 15 %%", sinVotar)
	}

	// Pendientes: solo la 104.
	pend, err := results.GetUnvotedUnitsByVoting(ctx, voting.ID, "")
	if err != nil {
		t.Fatalf("GetUnvotedUnitsByVoting: %v", err)
	}
	if len(pend) != 1 || pend[0].UnitID != u(3) {
		t.Errorf("pendientes = %+v, se esperaba solo la 104", pend)
	}

	// Borrar el voto de la 102 la devuelve a pendientes y saca su coeficiente del No.
	v102, err := votes.GetUnitVote(ctx, voting.ID, u(1))
	if err != nil {
		t.Fatalf("GetUnitVote(102): %v", err)
	}
	if err := votes.DeleteVote(ctx, v102.ID); err != nil {
		t.Fatalf("DeleteVote: %v", err)
	}
	details, err = results.GetVotingDetailsByUnit(ctx, voting.ID, hp.BusinessID)
	if err != nil {
		t.Fatalf("GetVotingDetailsByUnit: %v", err)
	}
	pct, sinVotar, _ = porcentajesPorCoeficiente(details)
	if pct[opt["no"]] != 0 || !casi(pct[opt["yes"]], 60) || !casi(sinVotar, 40) {
		t.Errorf("tras borrar el voto de la 102: Sí=%.2f No=%.2f sinVotar=%.2f; se esperaba 60/0/40", pct[opt["yes"]], pct[opt["no"]], sinVotar)
	}
	pend, err = results.GetUnvotedUnitsByVoting(ctx, voting.ID, "")
	if err != nil {
		t.Fatalf("GetUnvotedUnitsByVoting: %v", err)
	}
	if len(pend) != 2 {
		t.Errorf("tras borrar el voto de la 102 debía haber 2 pendientes, hay %d", len(pend))
	}
}
