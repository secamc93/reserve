package mocks

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
	"central_reserve/shared/log"

	"github.com/rs/zerolog"
)

// RepositoryMock implementa ports.IRepository con un Func por método; si es nil devuelve ceros.
type RepositoryMock struct {
	ManagedBusinessIDsFn    func(ctx context.Context, userID uint) ([]uint, error)
	CreatePendingFn         func(ctx context.Context, m *entities.Membership, p *entities.Payment) (*entities.Membership, *entities.Payment, error)
	CreateActiveFn          func(ctx context.Context, m *entities.Membership) (*entities.Membership, error)
	GetPaymentByReferenceFn func(ctx context.Context, ref string) (*entities.Payment, error)
	GetMembershipFn         func(ctx context.Context, id uint) (*entities.Membership, error)
	ActivateFn              func(ctx context.Context, paymentID, membershipID uint, tx entities.Transaction, start, end time.Time) error
	UpdatePaymentStatusFn   func(ctx context.Context, paymentID uint, tx entities.Transaction) error
	ListByOwnerFn           func(ctx context.Context, userID uint, limit int) ([]entities.Membership, error)
	ListByBusinessFn        func(ctx context.Context, businessID uint, limit int) ([]entities.Membership, error)
}

func (m *RepositoryMock) ManagedBusinessIDs(ctx context.Context, u uint) ([]uint, error) {
	if m.ManagedBusinessIDsFn != nil {
		return m.ManagedBusinessIDsFn(ctx, u)
	}
	return nil, nil
}
func (m *RepositoryMock) CreatePending(ctx context.Context, mm *entities.Membership, p *entities.Payment) (*entities.Membership, *entities.Payment, error) {
	if m.CreatePendingFn != nil {
		return m.CreatePendingFn(ctx, mm, p)
	}
	return nil, nil, nil
}
func (m *RepositoryMock) CreateActive(ctx context.Context, mm *entities.Membership) (*entities.Membership, error) {
	if m.CreateActiveFn != nil {
		return m.CreateActiveFn(ctx, mm)
	}
	return nil, nil
}
func (m *RepositoryMock) GetPaymentByReference(ctx context.Context, r string) (*entities.Payment, error) {
	if m.GetPaymentByReferenceFn != nil {
		return m.GetPaymentByReferenceFn(ctx, r)
	}
	return nil, nil
}
func (m *RepositoryMock) GetMembership(ctx context.Context, id uint) (*entities.Membership, error) {
	if m.GetMembershipFn != nil {
		return m.GetMembershipFn(ctx, id)
	}
	return nil, nil
}
func (m *RepositoryMock) Activate(ctx context.Context, p, mm uint, tx entities.Transaction, s, e time.Time) error {
	if m.ActivateFn != nil {
		return m.ActivateFn(ctx, p, mm, tx, s, e)
	}
	return nil
}
func (m *RepositoryMock) UpdatePaymentStatus(ctx context.Context, p uint, tx entities.Transaction) error {
	if m.UpdatePaymentStatusFn != nil {
		return m.UpdatePaymentStatusFn(ctx, p, tx)
	}
	return nil
}
func (m *RepositoryMock) ListByOwner(ctx context.Context, u uint, l int) ([]entities.Membership, error) {
	if m.ListByOwnerFn != nil {
		return m.ListByOwnerFn(ctx, u, l)
	}
	return nil, nil
}
func (m *RepositoryMock) ListByBusiness(ctx context.Context, b uint, l int) ([]entities.Membership, error) {
	if m.ListByBusinessFn != nil {
		return m.ListByBusinessFn(ctx, b, l)
	}
	return nil, nil
}

// GatewayMock implementa ports.IPaymentGateway.
type GatewayMock struct {
	EnabledFn        func() bool
	GetTransactionFn func(ctx context.Context, id string) (*entities.Transaction, error)
}

func (g *GatewayMock) Enabled() bool {
	if g.EnabledFn != nil {
		return g.EnabledFn()
	}
	return false
}
func (g *GatewayMock) CheckoutURL(r string, _ int64, _, _ string) (string, error) {
	return "https://checkout.wompi.co/p/?reference=" + r, nil
}
func (g *GatewayMock) GetTransaction(ctx context.Context, id string) (*entities.Transaction, error) {
	if g.GetTransactionFn != nil {
		return g.GetTransactionFn(ctx, id)
	}
	return nil, nil
}

var nop = zerolog.Nop()

// Logger implementa log.ILogger sin escribir nada.
type Logger struct{}

func (Logger) Info(...context.Context) *zerolog.Event  { return nop.Info() }
func (Logger) Error(...context.Context) *zerolog.Event { return nop.Error() }
func (Logger) Warn(...context.Context) *zerolog.Event  { return nop.Warn() }
func (Logger) Debug(...context.Context) *zerolog.Event { return nop.Debug() }
func (Logger) Fatal(...context.Context) *zerolog.Event { return nop.Fatal() }
func (Logger) Panic(...context.Context) *zerolog.Event { return nop.Panic() }
func (Logger) With() zerolog.Context                   { return nop.With() }
func (l Logger) WithService(string) log.ILogger        { return l }
func (l Logger) WithModule(string) log.ILogger         { return l }
func (l Logger) WithBusinessID(uint) log.ILogger       { return l }
