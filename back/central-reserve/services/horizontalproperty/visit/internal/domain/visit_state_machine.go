package domain

import (
	"fmt"
	"time"
)

// VisitStateMachine maneja las transiciones de estado de las visitas (lógica pura)
type VisitStateMachine struct {
	allowedTransitions map[string][]string
}

// NewVisitStateMachine crea una nueva máquina de estados
func NewVisitStateMachine() *VisitStateMachine {
	return &VisitStateMachine{
		allowedTransitions: map[string][]string{
			"pending":     {"authorized", "in_progress", "rejected", "cancelled"},
			"authorized":  {"in_progress", "expired", "cancelled"},
			"in_progress": {"completed", "cancelled"},
		},
	}
}

// ValidateTransition valida si una transición de estado es permitida
func (sm *VisitStateMachine) ValidateTransition(currentStatus *VisitStatus, newStatusCode string) error {
	if currentStatus.IsFinal {
		return fmt.Errorf("no se puede cambiar el estado de una visita en estado final: %s", currentStatus.Code)
	}

	allowed, exists := sm.allowedTransitions[currentStatus.Code]
	if !exists {
		return fmt.Errorf("estado actual desconocido: %s", currentStatus.Code)
	}

	for _, allowedStatus := range allowed {
		if allowedStatus == newStatusCode {
			return nil // Transición permitida
		}
	}

	return fmt.Errorf("transición no permitida: %s → %s", currentStatus.Code, newStatusCode)
}

// ApplyEntryEffects aplica los efectos de registrar entrada (lógica pura)
func (sm *VisitStateMachine) ApplyEntryEffects(visit *Visit, visitType *VisitType, userID uint, gate string, method string) error {
	// Validar estado actual - permitir entrada desde "pending" o "authorized"
	currentStatus := visit.VisitStatusID // Código temporal, se validará con VisitStatus completo
	if currentStatus == 0 {
		return fmt.Errorf("visita sin estado definido")
	}

	now := time.Now()
	visit.ActualEntryTime = &now
	visit.EntryRegisteredByUserID = &userID
	visit.EntryGate = gate
	visit.EntryMethod = method

	return nil
}

// ApplyExitEffects aplica los efectos de registrar salida (lógica pura)
func (sm *VisitStateMachine) ApplyExitEffects(visit *Visit, visitType *VisitType, userID uint, gate string) error {
	// Validar que tiene entrada
	if visit.ActualEntryTime == nil {
		return fmt.Errorf("la visita no tiene entrada registrada")
	}

	now := time.Now()
	visit.ActualExitTime = &now
	visit.ExitRegisteredByUserID = &userID
	visit.ExitGate = gate

	// Calcular duración
	duration := int(now.Sub(*visit.ActualEntryTime).Minutes())
	visit.DurationMinutes = &duration

	// Verificar si excedió duración máxima
	if visitType.DefaultDurationMinutes != nil && duration > *visitType.DefaultDurationMinutes {
		visit.DurationExceeded = true
		visit.DurationExceededAt = &now
	}

	return nil
}
