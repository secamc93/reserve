package errors

import "errors"

var (
	ErrPlanNotFound         = errors.New("plan de membresía no encontrado")
	ErrInvalidProperties    = errors.New("elige entre 1 conjunto y el máximo del plan")
	ErrPropertyNotManaged   = errors.New("no administras alguno de esos conjuntos")
	ErrInvalidSource        = errors.New("origen inválido: manual o cortesia")
	ErrGatewayNotConfigured = errors.New("la pasarela de pagos no está configurada")
	ErrInvalidRedirectURL   = errors.New("redirect_url inválida")
	ErrPaymentNotFound      = errors.New("pago no encontrado")
	ErrTransactionMismatch  = errors.New("la transacción no coincide con el pago")
)
