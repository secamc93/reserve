package usecasevotes_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// repoReadyToVote deja la unidad 100 con asistencia y sin voto en la votación 1; pending dice si el
// grupo debe el día de votación. Cuenta los votos guardados.
func repoReadyToVote(pending bool, saved *int) *mocks.MockVotingRepository {
	repo := mocks.NewMockVotingRepository()
	repo.GetVotingCoverageFn = func(context.Context, uint, time.Time) (domain.VotingCoverage, error) {
		return domain.VotingCoverage{Found: true, HasDay: !pending}, nil
	}
	repo.CheckUnitAttendanceForVotingFn = func(context.Context, uint, uint) (bool, error) { return true, nil }
	repo.HasUnitVotedFn = func(context.Context, uint, uint) (bool, error) { return false, nil }
	repo.CreateVoteFn = func(_ context.Context, v domain.Vote) (*domain.Vote, error) {
		*saved++
		v.ID = uint(*saved)
		return &v, nil
	}
	return repo
}

var voteDTO = domain.CreateVoteDTO{VotingID: 1, PropertyUnitID: 100, VotingOptionID: 10}

func TestCreateVote_SinElDiaDeVotacionPagadoNoGuardaElVoto(t *testing.T) {
	saved := 0
	uc := usecasevotes.New(repoReadyToVote(true, &saved), mocks.NewMockVotingCacheService(), mocks.NewMockLogger())

	_, err := uc.CreateVote(context.Background(), voteDTO)
	if !errors.Is(err, domain.ErrVotingDayNotPaid) {
		t.Fatalf("err = %v, se esperaba ErrVotingDayNotPaid", err)
	}
	if saved != 0 {
		t.Fatalf("se guardaron %d votos sin pagar", saved)
	}
}

func TestCreateVote_ConElDiaPagadoGuardaElVoto(t *testing.T) {
	saved := 0
	uc := usecasevotes.New(repoReadyToVote(false, &saved), mocks.NewMockVotingCacheService(), mocks.NewMockLogger())

	if _, err := uc.CreateVote(context.Background(), voteDTO); err != nil {
		t.Fatalf("CreateVote: %v", err)
	}
	if saved != 1 {
		t.Fatalf("votos guardados = %d, se esperaba 1", saved)
	}
}

func TestCreateBulkVotes_SinElDiaDeVotacionPagadoNoGuardaNinguno(t *testing.T) {
	saved := 0
	uc := usecasevotes.New(repoReadyToVote(true, &saved), mocks.NewMockVotingCacheService(), mocks.NewMockLogger())

	_, err := uc.CreateBulkVotes(context.Background(), domain.CreateBulkVotesDTO{VotingID: 1, PropertyUnitIDs: []uint{100, 101, 102}, VotingOptionID: 10})
	if !errors.Is(err, domain.ErrVotingDayNotPaid) {
		t.Fatalf("err = %v, se esperaba ErrVotingDayNotPaid", err)
	}
	if saved != 0 {
		t.Fatalf("se guardaron %d votos masivos sin pagar", saved)
	}
}
