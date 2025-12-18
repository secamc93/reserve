package domain

import (
	"fmt"
	"time"

	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// AllowedReservationTransitions define las transiciones permitidas para reservas
var AllowedReservationTransitions = map[string][]string{
	"pending":     {"approved", "rejected", "cancelled"},
	"approved":    {"confirmed", "cancelled", "expired"},
	"confirmed":   {"checked_in", "cancelled"},
	"checked_in":  {"checked_out", "cancelled"},
	"checked_out": {"completed"},
}

// ChangeReservationStatus cambia el estado de una reserva validando las transiciones permitidas
func ChangeReservationStatus(reservationModel *models.CommonAreaReservation, newStatusCode string, db *gorm.DB) error {
	// Obtener el código del estado actual
	var currentStatus models.CommonAreaReservationStatus
	if err := db.First(&currentStatus, reservationModel.ReservationStatusID).Error; err != nil {
		return fmt.Errorf("error obteniendo estado actual: %w", err)
	}

	// Validar si la transición está permitida
	if currentStatus.IsFinal {
		return fmt.Errorf("no se puede cambiar el estado de una reserva en estado final: %s", currentStatus.Code)
	}

	allowed, exists := AllowedReservationTransitions[currentStatus.Code]
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

	// Buscar el nuevo estado
	var newStatus models.CommonAreaReservationStatus
	if err := db.Where("code = ?", newStatusCode).First(&newStatus).Error; err != nil {
		return fmt.Errorf("estado no encontrado: %s", newStatusCode)
	}

	// Aplicar triggers automáticos según el nuevo estado
	now := time.Now()
	if newStatusCode == "approved" && reservationModel.ApprovedAt == nil {
		reservationModel.ApprovedAt = &now
	}
	if newStatusCode == "confirmed" && reservationModel.QRCode == "" {
		// Generar QR code y access code
		reservationModel.QRCode = generateQRCode(reservationModel.ID)
		reservationModel.AccessCode = generateAccessCode()
	}
	if newStatusCode == "checked_in" && reservationModel.CheckedInAt == nil {
		reservationModel.CheckedInAt = &now
	}
	if newStatusCode == "checked_out" && reservationModel.CheckedOutAt == nil {
		reservationModel.CheckedOutAt = &now
	}

	reservationModel.ReservationStatusID = newStatus.ID
	return db.Save(reservationModel).Error
}

// generateQRCode genera un código QR único para la reserva
func generateQRCode(reservationID uint) string {
	return fmt.Sprintf("RESERVATION-%d-%d", reservationID, time.Now().Unix())
}

// generateAccessCode genera un código de acceso alfanumérico
func generateAccessCode() string {
	return fmt.Sprintf("%06d", time.Now().Unix()%1000000)
}
