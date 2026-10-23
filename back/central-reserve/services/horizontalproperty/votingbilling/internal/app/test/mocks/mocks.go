package mocks

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	"central_reserve/shared/log"

	"github.com/rs/zerolog"
)

// RepositoryMock implementa ports.IRepository con un Func por método; si es nil devuelve ceros.
type RepositoryMock struct {
	IsPropertyExemptFn         func(ctx context.Context, businessID uint) (bool, error)
	IsAdminExemptFn            func(ctx context.Context, businessID uint) (bool, error)
	SetPropertyExemptFn        func(ctx context.Context, businessID uint, exempt bool, byUserID *uint) error
	SetUserExemptFn            func(ctx context.Context, userID uint, exempt bool, notes string, byUserID *uint) error
	CountManagedPropertiesFn   func(ctx context.Context, userID uint) (int64, error)
	ListPropertyAdminsFn       func(ctx context.Context, businessID uint) ([]entities.PropertyAdmin, error)
	ActiveMembershipFn         func(ctx context.Context, businessID uint, at time.Time) (*entities.ActiveMembership, error)
	PurchasedDatesFn           func(ctx context.Context, businessID uint, from string) ([]string, error)
	UpcomingAssembliesFn       func(ctx context.Context, businessID uint, now time.Time) ([]entities.UpcomingAssembly, error)
	CreateDayPaymentFn         func(ctx context.Context, p *entities.DayPayment) (*entities.DayPayment, error)
	CreateGrantedDaysFn        func(ctx context.Context, p *entities.DayPayment) (*entities.DayPayment, error)
	GetDayPaymentByReferenceFn func(ctx context.Context, reference string) (*entities.DayPayment, error)
	ApproveDayPaymentFn        func(ctx context.Context, paymentID uint, tx entities.Transaction, paidAt time.Time) error
	UpdateDayPaymentStatusFn   func(ctx context.Context, paymentID uint, tx entities.Transaction) error
	ListRecentDayPaymentsFn    func(ctx context.Context, businessID uint, limit int) ([]entities.DayPayment, error)
}

func (m *RepositoryMock) IsPropertyExempt(ctx context.Context, b uint) (bool, error) {
	if m.IsPropertyExemptFn != nil {
		return m.IsPropertyExemptFn(ctx, b)
	}
	return false, nil
}
func (m *RepositoryMock) IsAdminExempt(ctx context.Context, b uint) (bool, error) {
	if m.IsAdminExemptFn != nil {
		return m.IsAdminExemptFn(ctx, b)
	}
	return false, nil
}
func (m *RepositoryMock) SetPropertyExempt(ctx context.Context, b uint, e bool, u *uint) error {
	if m.SetPropertyExemptFn != nil {
		return m.SetPropertyExemptFn(ctx, b, e, u)
	}
	return nil
}
func (m *RepositoryMock) SetUserExempt(ctx context.Context, id uint, e bool, n string, u *uint) error {
	if m.SetUserExemptFn != nil {
		return m.SetUserExemptFn(ctx, id, e, n, u)
	}
	return nil
}
func (m *RepositoryMock) CountManagedProperties(ctx context.Context, id uint) (int64, error) {
	if m.CountManagedPropertiesFn != nil {
		return m.CountManagedPropertiesFn(ctx, id)
	}
	return 0, nil
}
func (m *RepositoryMock) ListPropertyAdmins(ctx context.Context, b uint) ([]entities.PropertyAdmin, error) {
	if m.ListPropertyAdminsFn != nil {
		return m.ListPropertyAdminsFn(ctx, b)
	}
	return nil, nil
}
func (m *RepositoryMock) ActiveMembership(ctx context.Context, b uint, at time.Time) (*entities.ActiveMembership, error) {
	if m.ActiveMembershipFn != nil {
		return m.ActiveMembershipFn(ctx, b, at)
	}
	return nil, nil
}
func (m *RepositoryMock) PurchasedDates(ctx context.Context, b uint, from string) ([]string, error) {
	if m.PurchasedDatesFn != nil {
		return m.PurchasedDatesFn(ctx, b, from)
	}
	return nil, nil
}
func (m *RepositoryMock) UpcomingAssemblies(ctx context.Context, b uint, now time.Time) ([]entities.UpcomingAssembly, error) {
	if m.UpcomingAssembliesFn != nil {
		return m.UpcomingAssembliesFn(ctx, b, now)
	}
	return nil, nil
}
func (m *RepositoryMock) CreateDayPayment(ctx context.Context, p *entities.DayPayment) (*entities.DayPayment, error) {
	if m.CreateDayPaymentFn != nil {
		return m.CreateDayPaymentFn(ctx, p)
	}
	return nil, nil
}
func (m *RepositoryMock) CreateGrantedDays(ctx context.Context, p *entities.DayPayment) (*entities.DayPayment, error) {
	if m.CreateGrantedDaysFn != nil {
		return m.CreateGrantedDaysFn(ctx, p)
	}
	return nil, nil
}
func (m *RepositoryMock) GetDayPaymentByReference(ctx context.Context, r string) (*entities.DayPayment, error) {
	if m.GetDayPaymentByReferenceFn != nil {
		return m.GetDayPaymentByReferenceFn(ctx, r)
	}
	return nil, nil
}
func (m *RepositoryMock) ApproveDayPayment(ctx context.Context, id uint, tx entities.Transaction, at time.Time) error {
	if m.ApproveDayPaymentFn != nil {
		return m.ApproveDayPaymentFn(ctx, id, tx, at)
	}
	return nil
}
func (m *RepositoryMock) UpdateDayPaymentStatus(ctx context.Context, id uint, tx entities.Transaction) error {
	if m.UpdateDayPaymentStatusFn != nil {
		return m.UpdateDayPaymentStatusFn(ctx, id, tx)
	}
	return nil
}
func (m *RepositoryMock) ListRecentDayPayments(ctx context.Context, b uint, l int) ([]entities.DayPayment, error) {
	if m.ListRecentDayPaymentsFn != nil {
		return m.ListRecentDayPaymentsFn(ctx, b, l)
	}
	return nil, nil
}

// GatewayMock implementa ports.IPaymentGateway.
type GatewayMock struct {
	EnabledFn        func() bool
	CheckoutURLFn    func(reference string, amountInCents int64, currency, redirectURL string) (string, error)
	GetTransactionFn func(ctx context.Context, id string) (*entities.Transaction, error)
}

func (g *GatewayMock) Enabled() bool {
	if g.EnabledFn != nil {
		return g.EnabledFn()
	}
	return false
}
func (g *GatewayMock) CheckoutURL(r string, a int64, c, u string) (string, error) {
	if g.CheckoutURLFn != nil {
		return g.CheckoutURLFn(r, a, c, u)
	}
	return "", nil
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
