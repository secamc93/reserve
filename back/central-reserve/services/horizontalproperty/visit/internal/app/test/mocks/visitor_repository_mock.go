package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
)

// MockVisitorRepository es un mock del VisitorRepository
type MockVisitorRepository struct {
	FindByDNIFunc          func(ctx context.Context, businessID *uint, dni string) (*domain.Visitor, error)
	CreateOrGetVisitorFunc func(ctx context.Context, businessID *uint, dni string, name string, phone string) (*domain.Visitor, error)
	CreateVisitorFunc      func(ctx context.Context, visitor *domain.Visitor) (*domain.Visitor, error)
	GetVisitorByIDFunc     func(ctx context.Context, id uint) (*domain.Visitor, error)
	UpdateVisitorFunc      func(ctx context.Context, visitor *domain.Visitor) (*domain.Visitor, error)
}

func (m *MockVisitorRepository) FindByDNI(ctx context.Context, businessID *uint, dni string) (*domain.Visitor, error) {
	if m.FindByDNIFunc != nil {
		return m.FindByDNIFunc(ctx, businessID, dni)
	}
	return nil, nil
}

func (m *MockVisitorRepository) CreateOrGetVisitor(ctx context.Context, businessID *uint, dni string, name string, phone string) (*domain.Visitor, error) {
	if m.CreateOrGetVisitorFunc != nil {
		return m.CreateOrGetVisitorFunc(ctx, businessID, dni, name, phone)
	}
	return nil, nil
}

func (m *MockVisitorRepository) CreateVisitor(ctx context.Context, visitor *domain.Visitor) (*domain.Visitor, error) {
	if m.CreateVisitorFunc != nil {
		return m.CreateVisitorFunc(ctx, visitor)
	}
	return nil, nil
}

func (m *MockVisitorRepository) GetVisitorByID(ctx context.Context, id uint) (*domain.Visitor, error) {
	if m.GetVisitorByIDFunc != nil {
		return m.GetVisitorByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockVisitorRepository) UpdateVisitor(ctx context.Context, visitor *domain.Visitor) (*domain.Visitor, error) {
	if m.UpdateVisitorFunc != nil {
		return m.UpdateVisitorFunc(ctx, visitor)
	}
	return nil, nil
}
