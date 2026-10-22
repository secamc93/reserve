package mocks

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
)

// RepositoryMock implementa ports.IRepository con un Func por método; si es nil devuelve ceros.
type RepositoryMock struct {
	GetVotingGroupFn               func(ctx context.Context, groupID uint) (*entities.VotingGroup, error)
	IsExemptFn                     func(ctx context.Context, businessID uint) (bool, error)
	SetExemptFn                    func(ctx context.Context, businessID uint, exempt bool, userID *uint) error
	SumApprovedDaysFn              func(ctx context.Context, groupID uint) (int, error)
	ListPaymentsByGroupFn          func(ctx context.Context, groupID uint) ([]entities.Payment, error)
	CreatePaymentFn                func(ctx context.Context, payment *entities.Payment) (*entities.Payment, error)
	GetPaymentByReferenceFn        func(ctx context.Context, reference string) (*entities.Payment, error)
	UpdatePaymentFromTransactionFn func(ctx context.Context, paymentID uint, tx entities.Transaction, paidAt *time.Time) error
}

func (m *RepositoryMock) GetVotingGroup(ctx context.Context, groupID uint) (*entities.VotingGroup, error) {
	if m.GetVotingGroupFn != nil {
		return m.GetVotingGroupFn(ctx, groupID)
	}
	return nil, nil
}

func (m *RepositoryMock) IsExempt(ctx context.Context, businessID uint) (bool, error) {
	if m.IsExemptFn != nil {
		return m.IsExemptFn(ctx, businessID)
	}
	return false, nil
}

func (m *RepositoryMock) SetExempt(ctx context.Context, businessID uint, exempt bool, userID *uint) error {
	if m.SetExemptFn != nil {
		return m.SetExemptFn(ctx, businessID, exempt, userID)
	}
	return nil
}

func (m *RepositoryMock) SumApprovedDays(ctx context.Context, groupID uint) (int, error) {
	if m.SumApprovedDaysFn != nil {
		return m.SumApprovedDaysFn(ctx, groupID)
	}
	return 0, nil
}

func (m *RepositoryMock) ListPaymentsByGroup(ctx context.Context, groupID uint) ([]entities.Payment, error) {
	if m.ListPaymentsByGroupFn != nil {
		return m.ListPaymentsByGroupFn(ctx, groupID)
	}
	return nil, nil
}

func (m *RepositoryMock) CreatePayment(ctx context.Context, payment *entities.Payment) (*entities.Payment, error) {
	if m.CreatePaymentFn != nil {
		return m.CreatePaymentFn(ctx, payment)
	}
	return nil, nil
}

func (m *RepositoryMock) GetPaymentByReference(ctx context.Context, reference string) (*entities.Payment, error) {
	if m.GetPaymentByReferenceFn != nil {
		return m.GetPaymentByReferenceFn(ctx, reference)
	}
	return nil, nil
}

func (m *RepositoryMock) UpdatePaymentFromTransaction(ctx context.Context, paymentID uint, tx entities.Transaction, paidAt *time.Time) error {
	if m.UpdatePaymentFromTransactionFn != nil {
		return m.UpdatePaymentFromTransactionFn(ctx, paymentID, tx, paidAt)
	}
	return nil
}
