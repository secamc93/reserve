//go:build integration

package repository_test

import (
	"math"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
)

// GetVotingResults expone, además del porcentaje por votos, el porcentaje por COEFICIENTE sobre el
// total de la propiedad (el que vale en la asamblea). Antes solo existía el de votos: con 1 voto
// daba 100 % aunque la unidad pesara el 15 % de la propiedad.
func TestRepo_ResultadosPorCoeficiente(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	repo := repository.New(database, testkit.Logger(t))

	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{
		{Number: "101", Coefficient: 40}, {Number: "102", Coefficient: 25},
		{Number: "103", Coefficient: 20}, {Number: "104", Coefficient: 15},
	})
	g, err := repo.CreateVotingGroup(ctx, &domain.VotingGroup{BusinessID: hp.BusinessID, Name: "Coef " + hp.Code,
		VotingStartDate: time.Now(), VotingEndDate: time.Now().Add(time.Hour)})
	if err != nil {
		t.Fatalf("CreateVotingGroup: %v", err)
	}
	v, err := repo.CreateVoting(ctx, &domain.Voting{VotingGroupID: g.ID, Title: "Coef", Description: "IT", VotingType: "simple", DisplayOrder: 1})
	if err != nil {
		t.Fatalf("CreateVoting: %v", err)
	}
	opt := map[string]uint{}
	for i, code := range []string{"yes", "no"} {
		o, err := repo.CreateVotingOption(ctx, &domain.VotingOption{VotingID: v.ID, OptionText: code, OptionCode: code, Color: "#000000", DisplayOrder: i + 1})
		if err != nil {
			t.Fatalf("CreateVotingOption: %v", err)
		}
		opt[code] = o.ID
	}
	for _, x := range []struct {
		unit int
		code string
	}{{0, "yes"}, {1, "no"}, {2, "yes"}} {
		if _, err := repo.CreateVote(ctx, domain.Vote{VotingID: v.ID, PropertyUnitID: hp.UnitID(x.unit), VotingOptionID: opt[x.code]}); err != nil {
			t.Fatalf("CreateVote: %v", err)
		}
	}

	results, err := repo.GetVotingResults(ctx, v.ID)
	if err != nil {
		t.Fatalf("GetVotingResults: %v", err)
	}
	got := map[string]domain.VotingResultDTO{}
	for _, r := range results {
		got[r.OptionCode] = r
	}
	casi := func(a, b float64) bool { return math.Abs(a-b) < 1e-6 }
	// Por coeficiente: Sí = 40 + 20 = 60 %, No = 25 % (la 104, 15 %, no votó).
	if !casi(got["yes"].PercentageByCoefficient, 60) || !casi(got["no"].PercentageByCoefficient, 25) {
		t.Fatalf("por coeficiente: Sí=%v No=%v, se esperaba 60 y 25", got["yes"].PercentageByCoefficient, got["no"].PercentageByCoefficient)
	}
	// Por votos (se conserva por compatibilidad): Sí 2/3, No 1/3.
	if !casi(got["yes"].Percentage, 200.0/3) || got["yes"].VoteCount != 2 {
		t.Fatalf("por votos: Sí=%v (%d votos), se esperaba 66.67 y 2", got["yes"].Percentage, got["yes"].VoteCount)
	}
}
