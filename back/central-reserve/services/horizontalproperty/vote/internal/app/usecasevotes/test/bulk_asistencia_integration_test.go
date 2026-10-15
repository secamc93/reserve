//go:build integration

package usecasevotes_test

import (
	"fmt"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/cache"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
)

// Regresión: el primer voto masivo de un grupo con AutoMarkAttendance procesa las unidades en
// paralelo; varias goroutines intentaban crear a la vez la lista de asistencia del grupo (índice
// único idx_voting_group_attendance), las que perdían quedaban sin asistencia y su voto se
// rechazaba con "unidad no registra asistencia". Ver
// .claude/bitacora/2026-10-14-voto-masivo-pierde-unidades-por-carrera.md
func TestVotoMasivo_PrimeraVezMarcaAsistenciaDeTodas(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	logger := testkit.Logger(t)
	repo := repository.New(database, logger)
	votes := usecasevotes.New(repo, cache.New(), logger)

	const n = 20
	specs := make([]testkit.UnitSpec, n)
	for i := range specs {
		specs[i] = testkit.UnitSpec{Number: fmt.Sprintf("M%02d", i+1), Coefficient: 100.0 / n}
	}
	hp := testkit.NewHorizontalProperty(t, database, specs)
	unitIDs := make([]uint, n)
	for i := range unitIDs {
		unitIDs[i] = hp.UnitID(i)
	}

	// Varias rondas: cada una con un grupo nuevo (sin lista de asistencia), que es cuando ocurre la carrera.
	for ronda := 1; ronda <= 5; ronda++ {
		group, err := repo.CreateVotingGroup(ctx, &domain.VotingGroup{
			BusinessID: hp.BusinessID, Name: fmt.Sprintf("Masiva IT %s %d", hp.Code, ronda),
			VotingStartDate: time.Now(), VotingEndDate: time.Now().Add(time.Hour),
		})
		if err != nil {
			t.Fatalf("ronda %d CreateVotingGroup: %v", ronda, err)
		}
		voting, err := repo.CreateVoting(ctx, &domain.Voting{
			VotingGroupID: group.ID, Title: "Masiva", Description: "IT", VotingType: "simple", DisplayOrder: 1,
		})
		if err != nil {
			t.Fatalf("ronda %d CreateVoting: %v", ronda, err)
		}
		si, err := repo.CreateVotingOption(ctx, &domain.VotingOption{VotingID: voting.ID, OptionText: "Sí", OptionCode: "yes", Color: "#1f8a4c", DisplayOrder: 1})
		if err != nil {
			t.Fatalf("ronda %d CreateVotingOption: %v", ronda, err)
		}

		res, err := votes.CreateBulkVotes(ctx, domain.CreateBulkVotesDTO{
			VotingID: voting.ID, PropertyUnitIDs: unitIDs, VotingOptionID: si.ID, AutoMarkAttendance: true,
		})
		if err != nil {
			t.Fatalf("ronda %d CreateBulkVotes: %v", ronda, err)
		}
		if res.Succeeded != n || res.Failed != 0 {
			for _, r := range res.Results {
				if !r.Success {
					t.Errorf("ronda %d: unidad %d rechazada: %s", ronda, r.PropertyUnitID, r.Error)
				}
			}
			t.Fatalf("ronda %d: el primer voto masivo debe registrar las %d unidades, registró %d", ronda, n, res.Succeeded)
		}
		voted, err := repo.GetVotedUnitIDsByVoting(ctx, voting.ID)
		if err != nil || len(voted) != n {
			t.Fatalf("ronda %d: %d unidades con voto en BD (err=%v), se esperaban %d", ronda, len(voted), err, n)
		}
	}
}
