package usecasevote

import (
	"context"
	"fmt"
)

// CheckUnitAttendanceForVoting - Verifica si una unidad tiene asistencia marcada para una votación
func (u *votingUseCase) CheckUnitAttendanceForVoting(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
	// Validar parámetros
	if votingID == 0 {
		return false, fmt.Errorf("voting_id es requerido")
	}
	if propertyUnitID == 0 {
		return false, fmt.Errorf("property_unit_id es requerido")
	}

	// Verificar asistencia en el repositorio
	hasAttendance, err := u.repo.CheckUnitAttendanceForVoting(ctx, votingID, propertyUnitID)
	if err != nil {
		u.logger.Error().Err(err).
			Uint("voting_id", votingID).
			Uint("property_unit_id", propertyUnitID).
			Msg("Error verificando asistencia de la unidad")
		return false, fmt.Errorf("error verificando asistencia: %w", err)
	}

	u.logger.Info().
		Uint("voting_id", votingID).
		Uint("property_unit_id", propertyUnitID).
		Bool("has_attendance", hasAttendance).
		Msg("Verificación de asistencia completada")

	return hasAttendance, nil
}
