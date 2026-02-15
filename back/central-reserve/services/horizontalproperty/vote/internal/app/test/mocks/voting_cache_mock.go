package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// MockVotingCacheService - Mock del servicio de cache de votaciones
type MockVotingCacheService struct {
	PublishVoteFn      func(votingID uint, vote domain.VoteDTO) error
	RemoveVoteFn       func(votingID uint, voteID uint) error
	ClearVotingFn      func(votingID uint) error
	SubscribeFn        func(ctx context.Context, votingID uint) (<-chan domain.VoteEvent, error)
	GetVotingStateFn   func(votingID uint) ([]domain.VoteDTO, error)
	InitializeVotingFn func(votingID uint, votes []domain.VoteDTO) error
}

// NewMockVotingCacheService crea una nueva instancia del mock del cache
func NewMockVotingCacheService() *MockVotingCacheService {
	return &MockVotingCacheService{}
}

func (m *MockVotingCacheService) PublishVote(votingID uint, vote domain.VoteDTO) error {
	if m.PublishVoteFn != nil {
		return m.PublishVoteFn(votingID, vote)
	}
	return nil
}

func (m *MockVotingCacheService) RemoveVote(votingID uint, voteID uint) error {
	if m.RemoveVoteFn != nil {
		return m.RemoveVoteFn(votingID, voteID)
	}
	return nil
}

func (m *MockVotingCacheService) ClearVoting(votingID uint) error {
	if m.ClearVotingFn != nil {
		return m.ClearVotingFn(votingID)
	}
	return nil
}

func (m *MockVotingCacheService) Subscribe(ctx context.Context, votingID uint) (<-chan domain.VoteEvent, error) {
	if m.SubscribeFn != nil {
		return m.SubscribeFn(ctx, votingID)
	}
	ch := make(chan domain.VoteEvent)
	close(ch)
	return ch, nil
}

func (m *MockVotingCacheService) GetVotingState(votingID uint) ([]domain.VoteDTO, error) {
	if m.GetVotingStateFn != nil {
		return m.GetVotingStateFn(votingID)
	}
	return []domain.VoteDTO{}, nil
}

func (m *MockVotingCacheService) InitializeVoting(votingID uint, votes []domain.VoteDTO) error {
	if m.InitializeVotingFn != nil {
		return m.InitializeVotingFn(votingID, votes)
	}
	return nil
}
