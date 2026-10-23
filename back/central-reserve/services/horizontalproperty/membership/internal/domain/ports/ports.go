package ports

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/membership/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
)

// IRepository persiste membresías y sus pagos. Lee business_staff con una consulta propia.
type IRepository interface {
	ManagedBusinessIDs(ctx context.Context, userID uint) ([]uint, error)
	// CreatePending guarda la membresía (PENDING), sus propiedades y su pago en una transacción.
	CreatePending(ctx context.Context, m *entities.Membership, p *entities.Payment) (*entities.Membership, *entities.Payment, error)
	// CreateActive guarda una membresía ya activa (manual o cortesía) y sus propiedades.
	CreateActive(ctx context.Context, m *entities.Membership) (*entities.Membership, error)
	GetPaymentByReference(ctx context.Context, reference string) (*entities.Payment, error)
	GetMembership(ctx context.Context, id uint) (*entities.Membership, error)
	// Activate aprueba el pago y activa la membresía en una transacción (idempotente).
	Activate(ctx context.Context, paymentID, membershipID uint, tx entities.Transaction, startsAt, endsAt time.Time) error
	UpdatePaymentStatus(ctx context.Context, paymentID uint, tx entities.Transaction) error
	// Los listados se limitan a las más recientes (pocas por usuario o propiedad).
	ListByOwner(ctx context.Context, userID uint, limit int) ([]entities.Membership, error)
	ListByBusiness(ctx context.Context, businessID uint, limit int) ([]entities.Membership, error)
}

// IPaymentGateway es la pasarela (Wompi).
type IPaymentGateway interface {
	Enabled() bool
	CheckoutURL(reference string, amountInCents int64, currency, redirectURL string) (string, error)
	GetTransaction(ctx context.Context, transactionID string) (*entities.Transaction, error)
}

// IUseCase son los casos de uso de membresías.
type IUseCase interface {
	ListPlans() []entities.Plan
	CreateCheckout(ctx context.Context, req dtos.CheckoutRequest) (*dtos.Checkout, error)
	ApplyGatewayTransaction(ctx context.Context, tx entities.Transaction) error
	SyncTransaction(ctx context.Context, req dtos.SyncRequest) (*entities.Membership, error)
	Grant(ctx context.Context, req dtos.GrantRequest) (*entities.Membership, error)
	ListMine(ctx context.Context, userID uint) ([]entities.Membership, error)
	ListForBusiness(ctx context.Context, businessID uint) ([]entities.Membership, error)
}
