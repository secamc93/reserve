package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/shared/log"
)

// CheckUnitAttendanceForVoting - Verifica si una unidad tiene asistencia marcada para una votación
func (u *votingUseCase) CheckUnitAttendanceForVoting(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "CheckUnitAttendanceForVoting")

	// Validar parámetros
	if votingID == 0 {
		u.logger.Error(ctx).Uint("voting_id", votingID).Msg("voting_id es requerido")
		return false, fmt.Errorf("voting_id es requerido")
	}
	if propertyUnitID == 0 {
		u.logger.Error(ctx).Uint("property_unit_id", propertyUnitID).Msg("property_unit_id es requerido")
		return false, fmt.Errorf("property_unit_id es requerido")
	}

	// Verificar asistencia en el repositorio
	hasAttendance, err := u.repo.CheckUnitAttendanceForVoting(ctx, votingID, propertyUnitID)
	if err != nil {
		u.logger.Error(ctx).Err(err).
			Uint("voting_id", votingID).
			Uint("property_unit_id", propertyUnitID).
			Msg("Error verificando asistencia de la unidad desde repositorio")
		return false, fmt.Errorf("error verificando asistencia: %w", err)
	}

	return hasAttendance, nil
}
