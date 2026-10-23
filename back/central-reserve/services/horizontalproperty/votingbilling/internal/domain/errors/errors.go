package errors

import "errors"

var (
	ErrNothingDue           = errors.New("esas fechas ya están cubiertas")
	ErrInvalidDates         = errors.New("fechas inválidas: usa AAAA-MM-DD, de hoy en adelante y máximo 31")
	ErrInvalidSource        = errors.New("origen inválido: manual o cortesia")
	ErrGatewayNotConfigured = errors.New("la pasarela de pagos no está configurada")
	ErrInvalidRedirectURL   = errors.New("redirect_url inválida")
	ErrPaymentNotFound      = errors.New("pago no encontrado")
	ErrTransactionMismatch  = errors.New("la transacción no coincide con el pago")
	ErrUserNotPropertyAdmin = errors.New("el usuario no administra propiedades")
)
