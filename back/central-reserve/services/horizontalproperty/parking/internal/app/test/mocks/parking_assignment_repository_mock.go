package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

// ParkingAssignmentRepositoryMock - Mock del repositorio de asignaciones de parqueo
type ParkingAssignmentRepositoryMock struct {
	CreateParkingAssignmentFn         func(ctx context.Context, assignment *domain.ParkingAssignment) (*domain.ParkingAssignment, error)
	GetParkingAssignmentByIDFn        func(ctx context.Context, id uint) (*domain.ParkingAssignment, error)
	UpdateParkingAssignmentFn         func(ctx context.Context, assignment *domain.ParkingAssignment) error
	DeleteParkingAssignmentFn         func(ctx context.Context, id uint) error
	ListParkingAssignmentsFn          func(ctx context.Context, filters domain.ParkingAssignmentFiltersDTO) (*domain.PaginatedParkingAssignmentsDTO, error)
	GetActiveAssignmentBySlotIDFn     func(ctx context.Context, slotID uint) (*domain.ParkingAssignment, error)
	GetAssignmentsByPropertyUnitIDFn  func(ctx context.Context, propertyUnitID uint) ([]*domain.ParkingAssignment, error)
	GetAssignmentsByResidentIDFn      func(ctx context.Context, residentID uint) ([]*domain.ParkingAssignment, error)
}

func (m *ParkingAssignmentRepositoryMock) CreateParkingAssignment(ctx context.Context, assignment *domain.ParkingAssignment) (*domain.ParkingAssignment, error) {
	if m.CreateParkingAssignmentFn != nil {
		return m.CreateParkingAssignmentFn(ctx, assignment)
	}
	return assignment, nil
}

func (m *ParkingAssignmentRepositoryMock) GetParkingAssignmentByID(ctx context.Context, id uint) (*domain.ParkingAssignment, error) {
	if m.GetParkingAssignmentByIDFn != nil {
		return m.GetParkingAssignmentByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *ParkingAssignmentRepositoryMock) UpdateParkingAssignment(ctx context.Context, assignment *domain.ParkingAssignment) error {
	if m.UpdateParkingAssignmentFn != nil {
		return m.UpdateParkingAssignmentFn(ctx, assignment)
	}
	return nil
}

func (m *ParkingAssignmentRepositoryMock) DeleteParkingAssignment(ctx context.Context, id uint) error {
	if m.DeleteParkingAssignmentFn != nil {
		return m.DeleteParkingAssignmentFn(ctx, id)
	}
	return nil
}

func (m *ParkingAssignmentRepositoryMock) ListParkingAssignments(ctx context.Context, filters domain.ParkingAssignmentFiltersDTO) (*domain.PaginatedParkingAssignmentsDTO, error) {
	if m.ListParkingAssignmentsFn != nil {
		return m.ListParkingAssignmentsFn(ctx, filters)
	}
	return &domain.PaginatedParkingAssignmentsDTO{}, nil
}

func (m *ParkingAssignmentRepositoryMock) GetActiveAssignmentBySlotID(ctx context.Context, slotID uint) (*domain.ParkingAssignment, error) {
	if m.GetActiveAssignmentBySlotIDFn != nil {
		return m.GetActiveAssignmentBySlotIDFn(ctx, slotID)
	}
	return nil, nil
}

func (m *ParkingAssignmentRepositoryMock) GetAssignmentsByPropertyUnitID(ctx context.Context, propertyUnitID uint) ([]*domain.ParkingAssignment, error) {
	if m.GetAssignmentsByPropertyUnitIDFn != nil {
		return m.GetAssignmentsByPropertyUnitIDFn(ctx, propertyUnitID)
	}
	return []*domain.ParkingAssignment{}, nil
}

func (m *ParkingAssignmentRepositoryMock) GetAssignmentsByResidentID(ctx context.Context, residentID uint) ([]*domain.ParkingAssignment, error) {
	if m.GetAssignmentsByResidentIDFn != nil {
		return m.GetAssignmentsByResidentIDFn(ctx, residentID)
	}
	return []*domain.ParkingAssignment{}, nil
}
