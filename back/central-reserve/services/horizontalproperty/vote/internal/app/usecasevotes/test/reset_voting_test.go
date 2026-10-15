package usecasevotes_test

import (
	"context"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
)

// El reset avisa a los streams (ResetVotes -> evento votes_reset) en vez de cerrarlos (ClearVoting).
func TestResetVoting_AvisaAlStreamSinCerrarlo(t *testing.T) {
	repo := mocks.NewMockVotingRepository()
	repo.DeleteAllVotesByVotingFn = func(ctx context.Context, votingID uint) (int64, error) { return 3, nil }
	cache := mocks.NewMockVotingCacheService()
	var reset, cleared uint
	cache.ResetVotesFn = func(votingID uint) error { reset = votingID; return nil }
	cache.ClearVotingFn = func(votingID uint) error { cleared = votingID; return nil }

	res, err := usecasevotes.New(repo, cache, mocks.NewMockLogger()).ResetVoting(context.Background(), 12)
	if err != nil || res.DeletedCount != 3 {
		t.Fatalf("ResetVoting: %+v, %v", res, err)
	}
	if reset != 12 {
		t.Errorf("se esperaba ResetVotes(12), got %d", reset)
	}
	if cleared != 0 {
		t.Errorf("el reset no debe cerrar los streams (ClearVoting(%d))", cleared)
	}
}
