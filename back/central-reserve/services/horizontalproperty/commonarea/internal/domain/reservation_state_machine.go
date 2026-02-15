package domain

import (
	"fmt"
	"time"
)

// AllowedReservationTransitions define las transiciones permitidas para reservas
var AllowedReservationTransitions = map[string][]string{
	"pending":     {"approved", "rejected", "cancelled"},
	"approved":    {"confirmed", "cancelled", "expired"},
	"confirmed":   {"checked_in", "cancelled"},
	"checked_in":  {"checked_out", "cancelled"},
	"checked_out": {"completed"},
}

// ReservationStateTransition contiene los cambios a aplicar tras una transición de estado
type ReservationStateTransition struct {
	NewStatusID      uint
	ApprovedAt       *time.Time
	QRCode           string
	AccessCode       string
	CheckedInAt      *time.Time
	CheckedOutAt     *time.Time
	RejectedAt       *time.Time
	CancelledAt      *time.Time
}

// ReservationStateMachine maneja la lógica de transiciones de estado de reservas
type ReservationStateMachine struct {
	AllowedTransitions map[string][]string
}

// NewReservationStateMachine crea una nueva máquina de estados
func NewReservationStateMachine() *ReservationStateMachine {
	return &ReservationStateMachine{
		AllowedTransitions: AllowedReservationTransitions,
	}
}

// ValidateTransition valida si una transición de estado es permitida
func (sm *ReservationStateMachine) ValidateTransition(currentStatus *CommonAreaReservationStatus, newStatusCode string) error {
	// Validar si la transición está permitida
	if currentStatus.IsFinal {
		return fmt.Errorf("no se puede cambiar el estado de una reserva en estado final: %s", currentStatus.Code)
	}

	allowed, exists := sm.AllowedTransitions[currentStatus.Code]
	if !exists {
		return fmt.Errorf("estado actual desconocido: %s", currentStatus.Code)
	}

	isAllowed := false
	for _, allowedStatus := range allowed {
		if allowedStatus == newStatusCode {
			isAllowed = true
			break
		}
	}

	if !isAllowed {
		return fmt.Errorf("transición no permitida: %s → %s", currentStatus.Code, newStatusCode)
	}

	return nil
}

// PrepareTransition prepara los cambios necesarios para una transición de estado
func (sm *ReservationStateMachine) PrepareTransition(
	reservation *CommonAreaReservation,
	newStatus *CommonAreaReservationStatus,
	newStatusCode string,
) *ReservationStateTransition {
	now := time.Now()
	transition := &ReservationStateTransition{
		NewStatusID: newStatus.ID,
	}

	// Aplicar triggers automáticos según el nuevo estado
	if newStatusCode == "approved" && reservation.ApprovedAt == nil {
		transition.ApprovedAt = &now
	}
	if newStatusCode == "confirmed" && reservation.QRCode == "" {
		// Generar QR code y access code
		transition.QRCode = generateQRCode(reservation.ID)
		transition.AccessCode = generateAccessCode()
	}
	if newStatusCode == "checked_in" && reservation.CheckedInAt == nil {
		transition.CheckedInAt = &now
	}
	if newStatusCode == "checked_out" && reservation.CheckedOutAt == nil {
		transition.CheckedOutAt = &now
	}
	if newStatusCode == "rejected" && reservation.RejectedAt == nil {
		transition.RejectedAt = &now
	}
	if newStatusCode == "cancelled" && reservation.CancelledAt == nil {
		transition.CancelledAt = &now
	}

	return transition
}

// generateQRCode genera un código QR único para la reserva
func generateQRCode(reservationID uint) string {
	return fmt.Sprintf("RESERVATION-%d-%d", reservationID, time.Now().Unix())
}

// generateAccessCode genera un código de acceso alfanumérico
func generateAccessCode() string {
	return fmt.Sprintf("%06d", time.Now().Unix()%1000000)
}
