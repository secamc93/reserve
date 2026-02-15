package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
)

// MockVisitRepository es un mock del VisitRepository
type MockVisitRepository struct {
	CreateVisitFunc                 func(ctx context.Context, visit *domain.Visit) (*domain.Visit, error)
	GetVisitByIDFunc                func(ctx context.Context, id uint) (*domain.Visit, error)
	GetVisitByQRCodeFunc            func(ctx context.Context, qrCode string) (*domain.Visit, error)
	GetVisitByAuthorizationCodeFunc func(ctx context.Context, authCode string) (*domain.Visit, error)
	UpdateVisitFunc                 func(ctx context.Context, visit *domain.Visit) error
	ListVisitsFunc                  func(ctx context.Context, filters domain.VisitFiltersDTO) (*domain.PaginatedVisitsDTO, error)
	GetActiveVisitsFunc             func(ctx context.Context, businessID uint) ([]*domain.Visit, error)
	GetVisitTypesFunc               func(ctx context.Context, businessID uint) ([]*domain.VisitType, error)
	GetVisitStatusesFunc            func(ctx context.Context) ([]*domain.VisitStatus, error)
	GetVisitWithRelationsFunc       func(ctx context.Context, visitID uint) (*domain.Visit, *domain.VisitType, *domain.VisitStatus, error)
	GetVisitStatusByCodeFunc        func(ctx context.Context, code string) (*domain.VisitStatus, error)
	ChangeVisitStatusFunc           func(ctx context.Context, visitID uint, newStatusCode string) error
	SaveVisitFunc                   func(ctx context.Context, visit *domain.Visit) error
	GetPropertyUnitBusinessIDFunc   func(ctx context.Context, propertyUnitID uint) (uint, error)
}

func (m *MockVisitRepository) CreateVisit(ctx context.Context, visit *domain.Visit) (*domain.Visit, error) {
	if m.CreateVisitFunc != nil {
		return m.CreateVisitFunc(ctx, visit)
	}
	return nil, nil
}

func (m *MockVisitRepository) GetVisitByID(ctx context.Context, id uint) (*domain.Visit, error) {
	if m.GetVisitByIDFunc != nil {
		return m.GetVisitByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockVisitRepository) GetVisitByQRCode(ctx context.Context, qrCode string) (*domain.Visit, error) {
	if m.GetVisitByQRCodeFunc != nil {
		return m.GetVisitByQRCodeFunc(ctx, qrCode)
	}
	return nil, nil
}

func (m *MockVisitRepository) GetVisitByAuthorizationCode(ctx context.Context, authCode string) (*domain.Visit, error) {
	if m.GetVisitByAuthorizationCodeFunc != nil {
		return m.GetVisitByAuthorizationCodeFunc(ctx, authCode)
	}
	return nil, nil
}

func (m *MockVisitRepository) UpdateVisit(ctx context.Context, visit *domain.Visit) error {
	if m.UpdateVisitFunc != nil {
		return m.UpdateVisitFunc(ctx, visit)
	}
	return nil
}

func (m *MockVisitRepository) ListVisits(ctx context.Context, filters domain.VisitFiltersDTO) (*domain.PaginatedVisitsDTO, error) {
	if m.ListVisitsFunc != nil {
		return m.ListVisitsFunc(ctx, filters)
	}
	return nil, nil
}

func (m *MockVisitRepository) GetActiveVisits(ctx context.Context, businessID uint) ([]*domain.Visit, error) {
	if m.GetActiveVisitsFunc != nil {
		return m.GetActiveVisitsFunc(ctx, businessID)
	}
	return nil, nil
}

func (m *MockVisitRepository) GetVisitTypes(ctx context.Context, businessID uint) ([]*domain.VisitType, error) {
	if m.GetVisitTypesFunc != nil {
		return m.GetVisitTypesFunc(ctx, businessID)
	}
	return nil, nil
}

func (m *MockVisitRepository) GetVisitStatuses(ctx context.Context) ([]*domain.VisitStatus, error) {
	if m.GetVisitStatusesFunc != nil {
		return m.GetVisitStatusesFunc(ctx)
	}
	return nil, nil
}

func (m *MockVisitRepository) GetVisitWithRelations(ctx context.Context, visitID uint) (*domain.Visit, *domain.VisitType, *domain.VisitStatus, error) {
	if m.GetVisitWithRelationsFunc != nil {
		return m.GetVisitWithRelationsFunc(ctx, visitID)
	}
	return nil, nil, nil, nil
}

func (m *MockVisitRepository) GetVisitStatusByCode(ctx context.Context, code string) (*domain.VisitStatus, error) {
	if m.GetVisitStatusByCodeFunc != nil {
		return m.GetVisitStatusByCodeFunc(ctx, code)
	}
	return nil, nil
}

func (m *MockVisitRepository) ChangeVisitStatus(ctx context.Context, visitID uint, newStatusCode string) error {
	if m.ChangeVisitStatusFunc != nil {
		return m.ChangeVisitStatusFunc(ctx, visitID, newStatusCode)
	}
	return nil
}

func (m *MockVisitRepository) SaveVisit(ctx context.Context, visit *domain.Visit) error {
	if m.SaveVisitFunc != nil {
		return m.SaveVisitFunc(ctx, visit)
	}
	return nil
}

func (m *MockVisitRepository) GetPropertyUnitBusinessID(ctx context.Context, propertyUnitID uint) (uint, error) {
	if m.GetPropertyUnitBusinessIDFunc != nil {
		return m.GetPropertyUnitBusinessIDFunc(ctx, propertyUnitID)
	}
	return 0, nil
}
