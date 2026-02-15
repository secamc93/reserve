package mocks

import (
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"context"
)

// MockResidentRepository - Mock del repositorio de residentes
type MockResidentRepository struct {
	CreateResidentFunc            func(ctx context.Context, resident *domain.Resident) (*domain.Resident, error)
	GetResidentByIDFunc           func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error)
	ListResidentsFunc             func(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error)
	UpdateResidentFunc            func(ctx context.Context, id uint, resident *domain.Resident) (*domain.Resident, error)
	DeleteResidentFunc            func(ctx context.Context, id uint) error
	ExistsResidentByEmailFunc     func(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error)
	ExistsResidentByDniFunc       func(ctx context.Context, businessID uint, dni string, excludeID uint) (bool, error)
	GetResidentByUnitAndDniFunc   func(ctx context.Context, hpID, propertyUnitID uint, dni string) (*domain.ResidentBasicDTO, error)
	GetPropertyUnitsByNumbersFunc func(ctx context.Context, businessID uint, numbers []string) (map[string]uint, error)
	CreateResidentsInBatchFunc    func(ctx context.Context, residents []*domain.Resident) error
	GetMainResidentsByUnitIDsFunc func(ctx context.Context, businessID uint, unitIDs []uint) (map[uint]domain.ResidentDetailDTO, error)
	UpdateResidentsInBatchFunc    func(ctx context.Context, pairs []domain.ResidentUpdatePair) error
	GetResidentIDsByDniFunc       func(ctx context.Context, businessID uint, dnis []string) (map[string]uint, error)
	CreateResidentUnitsInBatchFunc func(ctx context.Context, pivots []domain.ResidentUnit) error
}

// CreateResident mock implementation
func (m *MockResidentRepository) CreateResident(ctx context.Context, resident *domain.Resident) (*domain.Resident, error) {
	if m.CreateResidentFunc != nil {
		return m.CreateResidentFunc(ctx, resident)
	}
	return resident, nil
}

// GetResidentByID mock implementation
func (m *MockResidentRepository) GetResidentByID(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
	if m.GetResidentByIDFunc != nil {
		return m.GetResidentByIDFunc(ctx, id)
	}
	return nil, nil
}

// ListResidents mock implementation
func (m *MockResidentRepository) ListResidents(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
	if m.ListResidentsFunc != nil {
		return m.ListResidentsFunc(ctx, filters)
	}
	return &domain.PaginatedResidentsDTO{}, nil
}

// UpdateResident mock implementation
func (m *MockResidentRepository) UpdateResident(ctx context.Context, id uint, resident *domain.Resident) (*domain.Resident, error) {
	if m.UpdateResidentFunc != nil {
		return m.UpdateResidentFunc(ctx, id, resident)
	}
	return resident, nil
}

// DeleteResident mock implementation
func (m *MockResidentRepository) DeleteResident(ctx context.Context, id uint) error {
	if m.DeleteResidentFunc != nil {
		return m.DeleteResidentFunc(ctx, id)
	}
	return nil
}

// ExistsResidentByEmail mock implementation
func (m *MockResidentRepository) ExistsResidentByEmail(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error) {
	if m.ExistsResidentByEmailFunc != nil {
		return m.ExistsResidentByEmailFunc(ctx, businessID, email, excludeID)
	}
	return false, nil
}

// ExistsResidentByDni mock implementation
func (m *MockResidentRepository) ExistsResidentByDni(ctx context.Context, businessID uint, dni string, excludeID uint) (bool, error) {
	if m.ExistsResidentByDniFunc != nil {
		return m.ExistsResidentByDniFunc(ctx, businessID, dni, excludeID)
	}
	return false, nil
}

// GetResidentByUnitAndDni mock implementation
func (m *MockResidentRepository) GetResidentByUnitAndDni(ctx context.Context, hpID, propertyUnitID uint, dni string) (*domain.ResidentBasicDTO, error) {
	if m.GetResidentByUnitAndDniFunc != nil {
		return m.GetResidentByUnitAndDniFunc(ctx, hpID, propertyUnitID, dni)
	}
	return nil, nil
}

// GetPropertyUnitsByNumbers mock implementation
func (m *MockResidentRepository) GetPropertyUnitsByNumbers(ctx context.Context, businessID uint, numbers []string) (map[string]uint, error) {
	if m.GetPropertyUnitsByNumbersFunc != nil {
		return m.GetPropertyUnitsByNumbersFunc(ctx, businessID, numbers)
	}
	return make(map[string]uint), nil
}

// CreateResidentsInBatch mock implementation
func (m *MockResidentRepository) CreateResidentsInBatch(ctx context.Context, residents []*domain.Resident) error {
	if m.CreateResidentsInBatchFunc != nil {
		return m.CreateResidentsInBatchFunc(ctx, residents)
	}
	return nil
}

// GetMainResidentsByUnitIDs mock implementation
func (m *MockResidentRepository) GetMainResidentsByUnitIDs(ctx context.Context, businessID uint, unitIDs []uint) (map[uint]domain.ResidentDetailDTO, error) {
	if m.GetMainResidentsByUnitIDsFunc != nil {
		return m.GetMainResidentsByUnitIDsFunc(ctx, businessID, unitIDs)
	}
	return make(map[uint]domain.ResidentDetailDTO), nil
}

// UpdateResidentsInBatch mock implementation
func (m *MockResidentRepository) UpdateResidentsInBatch(ctx context.Context, pairs []domain.ResidentUpdatePair) error {
	if m.UpdateResidentsInBatchFunc != nil {
		return m.UpdateResidentsInBatchFunc(ctx, pairs)
	}
	return nil
}

// GetResidentIDsByDni mock implementation
func (m *MockResidentRepository) GetResidentIDsByDni(ctx context.Context, businessID uint, dnis []string) (map[string]uint, error) {
	if m.GetResidentIDsByDniFunc != nil {
		return m.GetResidentIDsByDniFunc(ctx, businessID, dnis)
	}
	return make(map[string]uint), nil
}

// CreateResidentUnitsInBatch mock implementation
func (m *MockResidentRepository) CreateResidentUnitsInBatch(ctx context.Context, pivots []domain.ResidentUnit) error {
	if m.CreateResidentUnitsInBatchFunc != nil {
		return m.CreateResidentUnitsInBatchFunc(ctx, pivots)
	}
	return nil
}
