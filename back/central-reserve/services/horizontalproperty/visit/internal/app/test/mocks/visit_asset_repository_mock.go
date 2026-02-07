package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
)

// MockVisitAssetRepository es un mock del VisitAssetRepository
type MockVisitAssetRepository struct {
	CreateAssetFunc            func(ctx context.Context, asset *domain.VisitAsset) (*domain.VisitAsset, error)
	GetAssetsByVisitIDFunc     func(ctx context.Context, visitID uint) ([]*domain.VisitAsset, error)
	UpdateAssetFunc            func(ctx context.Context, asset *domain.VisitAsset) error
	DeleteAssetFunc            func(ctx context.Context, id uint) error
	GetPendingExitAssetsFunc   func(ctx context.Context, visitID uint) ([]*domain.VisitAsset, error)
}

func (m *MockVisitAssetRepository) CreateAsset(ctx context.Context, asset *domain.VisitAsset) (*domain.VisitAsset, error) {
	if m.CreateAssetFunc != nil {
		return m.CreateAssetFunc(ctx, asset)
	}
	return nil, nil
}

func (m *MockVisitAssetRepository) GetAssetsByVisitID(ctx context.Context, visitID uint) ([]*domain.VisitAsset, error) {
	if m.GetAssetsByVisitIDFunc != nil {
		return m.GetAssetsByVisitIDFunc(ctx, visitID)
	}
	return nil, nil
}

func (m *MockVisitAssetRepository) UpdateAsset(ctx context.Context, asset *domain.VisitAsset) error {
	if m.UpdateAssetFunc != nil {
		return m.UpdateAssetFunc(ctx, asset)
	}
	return nil
}

func (m *MockVisitAssetRepository) DeleteAsset(ctx context.Context, id uint) error {
	if m.DeleteAssetFunc != nil {
		return m.DeleteAssetFunc(ctx, id)
	}
	return nil
}

func (m *MockVisitAssetRepository) GetPendingExitAssets(ctx context.Context, visitID uint) ([]*domain.VisitAsset, error) {
	if m.GetPendingExitAssetsFunc != nil {
		return m.GetPendingExitAssetsFunc(ctx, visitID)
	}
	return nil, nil
}
