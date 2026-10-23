package ports

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
)

// IRepository persiste exenciones y compras de días. Lee membresías, grupos de votación y
// business_staff con consultas propias (no comparte repositorios con otros módulos).
type IRepository interface {
	IsPropertyExempt(ctx context.Context, businessID uint) (bool, error)
	IsAdminExempt(ctx context.Context, businessID uint) (bool, error)
	SetPropertyExempt(ctx context.Context, businessID uint, exempt bool, byUserID *uint) error
	SetUserExempt(ctx context.Context, userID uint, exempt bool, notes string, byUserID *uint) error
	CountManagedProperties(ctx context.Context, userID uint) (int64, error)
	// ListPropertyAdmins no se pagina: una propiedad tiene pocos administradores.
	ListPropertyAdmins(ctx context.Context, businessID uint) ([]entities.PropertyAdmin, error)

	ActiveMembership(ctx context.Context, businessID uint, at time.Time) (*entities.ActiveMembership, error)
	PurchasedDates(ctx context.Context, businessID uint, from string) ([]string, error)
	UpcomingAssemblies(ctx context.Context, businessID uint, now time.Time) ([]entities.UpcomingAssembly, error)

	CreateDayPayment(ctx context.Context, p *entities.DayPayment) (*entities.DayPayment, error)
	// CreateGrantedDays guarda un pago ya aprobado (manual o cortesía) y sus fechas en una transacción.
	CreateGrantedDays(ctx context.Context, p *entities.DayPayment) (*entities.DayPayment, error)
	GetDayPaymentByReference(ctx context.Context, reference string) (*entities.DayPayment, error)
	// ApproveDayPayment marca el pago aprobado y crea sus fechas en una transacción (idempotente).
	ApproveDayPayment(ctx context.Context, paymentID uint, tx entities.Transaction, paidAt time.Time) error
	UpdateDayPaymentStatus(ctx context.Context, paymentID uint, tx entities.Transaction) error
	ListRecentDayPayments(ctx context.Context, businessID uint, limit int) ([]entities.DayPayment, error)
}

// IPaymentGateway es la pasarela (Wompi).
type IPaymentGateway interface {
	Enabled() bool
	CheckoutURL(reference string, amountInCents int64, currency, redirectURL string) (string, error)
	GetTransaction(ctx context.Context, transactionID string) (*entities.Transaction, error)
}

// IUseCase son los casos de uso del cobro por días de votación.
type IUseCase interface {
	GetCoverage(ctx context.Context, businessID uint, now time.Time) (*dtos.Coverage, error)
	CreateDaysCheckout(ctx context.Context, req dtos.DaysCheckoutRequest) (*dtos.Checkout, error)
	ApplyGatewayTransaction(ctx context.Context, tx entities.Transaction) error
	SyncTransaction(ctx context.Context, businessID uint, transactionID string, now time.Time) (*dtos.Coverage, error)
	GrantDays(ctx context.Context, req dtos.GrantDaysRequest) (*entities.DayPayment, error)
	SetPropertyExemption(ctx context.Context, req dtos.PropertyExemptionRequest) error
	SetAdminExemption(ctx context.Context, req dtos.AdminExemptionRequest) error
	ListPropertyAdmins(ctx context.Context, businessID uint) ([]entities.PropertyAdmin, error)
}
