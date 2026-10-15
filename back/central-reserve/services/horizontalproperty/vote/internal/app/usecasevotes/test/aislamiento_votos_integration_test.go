//go:build integration

package usecasevotes_test

import (
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/cache"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
)

// Regresión multi-tenant: una unidad de otra propiedad no puede votar en una votación ajena, ni
// se acepta una opción de otra votación. Antes se guardaban sin error (la unidad de B contaba
// como voto en A; la opción ajena dejaba un voto perdido que no salía en los resultados).
func TestCreateVote_AislamientoEntrePropiedadesYVotaciones(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	logger := testkit.Logger(t)
	repo := repository.New(database, logger)
	votes := usecasevotes.New(repo, cache.New(), logger)

	a := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "A-101", Coefficient: 50}, {Number: "A-102", Coefficient: 50}})
	b := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "B-101", Coefficient: 100}})

	nuevaVotacion := func(hp *testkit.HorizontalProperty) (uint, uint) {
		t.Helper()
		g, err := repo.CreateVotingGroup(ctx, &domain.VotingGroup{BusinessID: hp.BusinessID, Name: "Aislamiento " + hp.Code,
			VotingStartDate: time.Now(), VotingEndDate: time.Now().Add(time.Hour)})
		if err != nil {
			t.Fatalf("CreateVotingGroup: %v", err)
		}
		v, err := repo.CreateVoting(ctx, &domain.Voting{VotingGroupID: g.ID, Title: "Aislamiento", Description: "IT", VotingType: "simple", DisplayOrder: 1})
		if err != nil {
			t.Fatalf("CreateVoting: %v", err)
		}
		o, err := repo.CreateVotingOption(ctx, &domain.VotingOption{VotingID: v.ID, OptionText: "Sí", OptionCode: "yes", Color: "#1f8a4c", DisplayOrder: 1})
		if err != nil {
			t.Fatalf("CreateVotingOption: %v", err)
		}
		return v.ID, o.ID
	}
	votingA, optA := nuevaVotacion(a)
	votingB, optB := nuevaVotacion(b)
	_ = votingB

	votar := func(votingID, unitID, optionID uint) error {
		_, err := votes.CreateVote(ctx, domain.CreateVoteDTO{VotingID: votingID, PropertyUnitID: unitID, VotingOptionID: optionID})
		return err
	}

	if err := votar(votingA, b.UnitID(0), optA); !errors.Is(err, domain.ErrUnitNotInVotingBusiness) {
		t.Errorf("unidad de B votando en A: se esperaba ErrUnitNotInVotingBusiness, got %v", err)
	}
	if err := votar(votingA, a.UnitID(0), optB); !errors.Is(err, domain.ErrOptionNotInVoting) {
		t.Errorf("opción de B en votación de A: se esperaba ErrOptionNotInVoting, got %v", err)
	}
	voted, err := repo.GetVotedUnitIDsByVoting(ctx, votingA)
	if err != nil || len(voted) != 0 {
		t.Fatalf("los votos rechazados no deben quedar guardados: %v (err=%v)", voted, err)
	}

	// El caso válido sigue funcionando.
	if err := votar(votingA, a.UnitID(1), optA); err != nil {
		t.Fatalf("voto válido rechazado: %v", err)
	}
}
