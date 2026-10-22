package errors

import "errors"

var (
	ErrVotingGroupNotFound   = errors.New("grupo de votación no encontrado")
	ErrNothingDue            = errors.New("el grupo de votación no tiene días pendientes de pago")
	ErrGatewayNotConfigured  = errors.New("la pasarela de pagos no está configurada")
	ErrInvalidRedirectURL    = errors.New("redirect_url inválida")
	ErrInvalidEventSignature = errors.New("firma del evento de la pasarela inválida")
	ErrPaymentNotFound       = errors.New("pago no encontrado")
	ErrTransactionMismatch   = errors.New("la transacción no coincide con el pago")
)
