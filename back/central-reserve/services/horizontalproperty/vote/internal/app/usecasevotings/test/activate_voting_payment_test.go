package usecasevotings_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotings"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestActivateVoting_SinElDiaDeVotacionPagadoNoSeAbre(t *testing.T) {
	repo := mocks.NewMockVotingRepository()
	repo.GetVotingCoverageFn = func(context.Context, uint, time.Time) (domain.VotingCoverage, error) {
		return domain.VotingCoverage{Found: true}, nil
	}
	activated := false
	repo.ActivateVotingFn = func(context.Context, uint) error { activated = true; return nil }

	err := usecasevotings.New(repo, mocks.NewMockVotingCacheService(), mocks.NewMockLogger()).ActivateVoting(context.Background(), 1)
	if !errors.Is(err, domain.ErrVotingDayNotPaid) {
		t.Fatalf("err = %v, se esperaba ErrVotingDayNotPaid", err)
	}
	if activated {
		t.Fatal("la votación no debía abrirse sin pagar")
	}
}
