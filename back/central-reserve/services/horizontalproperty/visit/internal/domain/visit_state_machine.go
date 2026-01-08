package domain

import (
	"fmt"
	"time"

	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// VisitStateMachine maneja las transiciones de estado de las visitas
type VisitStateMachine struct{}

// AllowedTransitions define las transiciones permitidas
var AllowedTransitions = map[string][]string{
	"pending":     {"authorized", "in_progress", "rejected", "cancelled"}, // Permitir transición directa a in_progress para registro de entrada
	"authorized":  {"in_progress", "expired", "cancelled"},
	"in_progress": {"completed", "cancelled"},
}

// ChangeVisitStatus cambia el estado de una visita validando las transiciones permitidas
func ChangeVisitStatus(visitModel *models.Visit, newStatusCode string, db *gorm.DB) error {
	// Obtener el código del estado actual
	var currentStatus models.VisitStatus
	if err := db.First(&currentStatus, visitModel.VisitStatusID).Error; err != nil {
		return fmt.Errorf("error obteniendo estado actual: %w", err)
	}

	// Validar si la transición está permitida
	if currentStatus.IsFinal {
		return fmt.Errorf("no se puede cambiar el estado de una visita en estado final: %s", currentStatus.Code)
	}

	allowed, exists := AllowedTransitions[currentStatus.Code]
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
	var newStatus models.VisitStatus
	if err := db.Where("code = ?", newStatusCode).First(&newStatus).Error; err != nil {
		return fmt.Errorf("estado no encontrado: %s", newStatusCode)
	}

	// Aplicar triggers automáticos según el nuevo estado
	now := time.Now()
	if newStatusCode == "in_progress" && visitModel.ActualEntryTime == nil {
		visitModel.ActualEntryTime = &now
	}
	if newStatusCode == "completed" && visitModel.ActualExitTime == nil {
		visitModel.ActualExitTime = &now
		// Calcular duración si hay entrada registrada
		if visitModel.ActualEntryTime != nil {
			duration := int(now.Sub(*visitModel.ActualEntryTime).Minutes())
			visitModel.DurationMinutes = &duration
			// Verificar si excedió duración máxima (necesita VisitType cargado)
			if visitModel.VisitType.DefaultDurationMinutes != nil && duration > *visitModel.VisitType.DefaultDurationMinutes {
				visitModel.DurationExceeded = true
				visitModel.DurationExceededAt = &now
			}
		}
	}

	visitModel.VisitStatusID = newStatus.ID
	return db.Save(visitModel).Error
}

// RegisterVisitEntry registra la entrada de una visita
func RegisterVisitEntry(visitModel *models.Visit, userID uint, gate string, method string, db *gorm.DB) error {
	// Validar estado actual - permitir entrada desde "pending" o "authorized"
	currentStatus := visitModel.VisitStatus.Code
	if currentStatus != "pending" && currentStatus != "authorized" {
		return fmt.Errorf("solo se puede registrar entrada de visitas pendientes o autorizadas (estado actual: %s)", currentStatus)
	}

	now := time.Now()
	visitModel.ActualEntryTime = &now
	visitModel.EntryRegisteredByUserID = &userID
	visitModel.EntryGate = gate
	visitModel.EntryMethod = method

	// Si está en pending, permitir transición directa a in_progress
	// Si el tipo de visita requiere autorización, auto-autorizar primero
	if currentStatus == "pending" {
		// Verificar si el tipo de visita requiere autorización (ya debería estar preloaded)
		if visitModel.VisitType.ID > 0 && visitModel.VisitType.RequiresAuthorization {
			// Auto-autorizar la visita primero
			if err := ChangeVisitStatus(visitModel, "authorized", db); err != nil {
				return fmt.Errorf("error auto-autorizando visita: %w", err)
			}
			// Recargar el estado después de la autorización
			if err := db.Preload("VisitStatus").Preload("VisitType").First(visitModel, visitModel.ID).Error; err != nil {
				return fmt.Errorf("error recargando visita: %w", err)
			}
		}
	}

	// Cambiar estado a in_progress usando state machine
	return ChangeVisitStatus(visitModel, "in_progress", db)
}

// RegisterVisitExit registra la salida de una visita
func RegisterVisitExit(visitModel *models.Visit, userID uint, gate string, db *gorm.DB) error {
	// Validar estado actual
	if visitModel.VisitStatus.Code != "in_progress" {
		return fmt.Errorf("solo se puede registrar salida de visitas en curso (estado actual: %s)", visitModel.VisitStatus.Code)
	}

	if visitModel.ActualEntryTime == nil {
		return fmt.Errorf("la visita no tiene entrada registrada")
	}

	now := time.Now()
	visitModel.ActualExitTime = &now
	visitModel.ExitRegisteredByUserID = &userID
	visitModel.ExitGate = gate

	// Calcular duración
	duration := int(now.Sub(*visitModel.ActualEntryTime).Minutes())
	visitModel.DurationMinutes = &duration

	// Verificar si excedió duración máxima
	if visitModel.VisitType.DefaultDurationMinutes != nil && duration > *visitModel.VisitType.DefaultDurationMinutes {
		visitModel.DurationExceeded = true
		visitModel.DurationExceededAt = &now
	}

	// Cambiar estado usando state machine
	return ChangeVisitStatus(visitModel, "completed", db)
}
