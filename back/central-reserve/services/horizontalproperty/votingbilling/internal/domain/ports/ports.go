package ports

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
)

// IRepository persiste la configuración de cobro y los pagos. Lee los grupos de votación con una
// consulta propia (no comparte el repositorio del módulo de votaciones).
type IRepository interface {
	GetVotingGroup(ctx context.Context, groupID uint) (*entities.VotingGroup, error)
	IsExempt(ctx context.Context, businessID uint) (bool, error)
	SetExempt(ctx context.Context, businessID uint, exempt bool, userID *uint) error
	SumApprovedDays(ctx context.Context, groupID uint) (int, error)
	// ListPaymentsByGroup no se pagina: un grupo tiene pocos pagos (uno por intento).
	ListPaymentsByGroup(ctx context.Context, groupID uint) ([]entities.Payment, error)
	CreatePayment(ctx context.Context, payment *entities.Payment) (*entities.Payment, error)
	GetPaymentByReference(ctx context.Context, reference string) (*entities.Payment, error)
	UpdatePaymentFromTransaction(ctx context.Context, paymentID uint, tx entities.Transaction, paidAt *time.Time) error
}

// IPaymentGateway es la pasarela de pagos (Wompi).
type IPaymentGateway interface {
	Enabled() bool
	CheckoutURL(params dtos.CheckoutParams) (string, error)
	// ParseEvent valida la firma de un evento enviado por la pasarela y devuelve su transacción.
	ParseEvent(body []byte) (*entities.Transaction, error)
	GetTransaction(ctx context.Context, transactionID string) (*entities.Transaction, error)
}

// IUseCase son los casos de uso del cobro por día de votación.
type IUseCase interface {
	GetStatus(ctx context.Context, businessID, groupID uint) (*dtos.BillingStatus, error)
	CreateCheckout(ctx context.Context, req dtos.CheckoutRequest) (*dtos.Checkout, error)
	HandleGatewayEvent(ctx context.Context, body []byte) error
	SyncTransaction(ctx context.Context, businessID, groupID uint, transactionID string) (*dtos.BillingStatus, error)
	RegisterManualPayment(ctx context.Context, req dtos.ManualPaymentRequest) (*entities.Payment, error)
	SetExemption(ctx context.Context, req dtos.ExemptionRequest) error
}
