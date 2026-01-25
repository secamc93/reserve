package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
)

// MockVisitBlacklistRepository es un mock del VisitBlacklistRepository
type MockVisitBlacklistRepository struct {
	CreateBlacklistEntryFunc  func(ctx context.Context, entry *domain.VisitBlacklist) (*domain.VisitBlacklist, error)
	GetBlacklistEntryFunc     func(ctx context.Context, businessID uint, visitorID uint) (*domain.VisitBlacklist, error)
	IsVisitorBlacklistedFunc  func(ctx context.Context, businessID uint, visitorID uint) (bool, error)
	UnblockVisitorFunc        func(ctx context.Context, businessID uint, visitorID uint, unblockedByUserID uint, reason string) error
	ListBlacklistFunc         func(ctx context.Context, businessID uint) ([]*domain.VisitBlacklist, error)
}

func (m *MockVisitBlacklistRepository) CreateBlacklistEntry(ctx context.Context, entry *domain.VisitBlacklist) (*domain.VisitBlacklist, error) {
	if m.CreateBlacklistEntryFunc != nil {
		return m.CreateBlacklistEntryFunc(ctx, entry)
	}
	return nil, nil
}

func (m *MockVisitBlacklistRepository) GetBlacklistEntry(ctx context.Context, businessID uint, visitorID uint) (*domain.VisitBlacklist, error) {
	if m.GetBlacklistEntryFunc != nil {
		return m.GetBlacklistEntryFunc(ctx, businessID, visitorID)
	}
	return nil, nil
}

func (m *MockVisitBlacklistRepository) IsVisitorBlacklisted(ctx context.Context, businessID uint, visitorID uint) (bool, error) {
	if m.IsVisitorBlacklistedFunc != nil {
		return m.IsVisitorBlacklistedFunc(ctx, businessID, visitorID)
	}
	return false, nil
}

func (m *MockVisitBlacklistRepository) UnblockVisitor(ctx context.Context, businessID uint, visitorID uint, unblockedByUserID uint, reason string) error {
	if m.UnblockVisitorFunc != nil {
		return m.UnblockVisitorFunc(ctx, businessID, visitorID, unblockedByUserID, reason)
	}
	return nil
}

func (m *MockVisitBlacklistRepository) ListBlacklist(ctx context.Context, businessID uint) ([]*domain.VisitBlacklist, error) {
	if m.ListBlacklistFunc != nil {
		return m.ListBlacklistFunc(ctx, businessID)
	}
	return nil, nil
}
