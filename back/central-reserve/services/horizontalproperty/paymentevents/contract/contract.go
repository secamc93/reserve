// Package contract es lo que un módulo que cobra debe implementar para recibir los eventos de Wompi
// del webhook único (ver paymentevents).
package contract

import (
	"context"
	"errors"

	"central_reserve/shared/payments/wompi"
)

// ErrNotApplicable: el evento está bien firmado pero no aplica (otra referencia, otro ambiente o un
// monto distinto). El webhook responde 200 para que Wompi no lo reintente y lo deja en el log.
var ErrNotApplicable = errors.New("el evento de pago no aplica")

// Applier aplica a sus pagos una transacción reportada por Wompi.
type Applier interface {
	ApplyGatewayTransaction(ctx context.Context, tx wompi.Transaction) error
}
