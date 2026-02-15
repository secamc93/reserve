package usecasevotes

import (
	"context"
	"fmt"
)

// MarkUnitAttendance - ✅ NUEVO: Marca o desmarca la asistencia de una unidad para una votación
func (uc *VotesUseCase) MarkUnitAttendance(ctx context.Context, votingID, propertyUnitID uint, markAttendance bool) error {
	// Log de inicio
	uc.logger.Info().
		Uint("voting_id", votingID).
		Uint("property_unit_id", propertyUnitID).
		Bool("mark_attendance", markAttendance).
		Msg("Marcando asistencia de unidad")

	// Llamar al repositorio para marcar/desmarcar la asistencia
	if err := uc.repo.MarkUnitAttendanceForVoting(ctx, votingID, propertyUnitID, markAttendance); err != nil {
		uc.logger.Error().
			Err(err).
			Uint("voting_id", votingID).
			Uint("property_unit_id", propertyUnitID).
			Bool("mark_attendance", markAttendance).
			Msg("Error marcando asistencia de unidad")
		return fmt.Errorf("error marcando asistencia: %w", err)
	}

	// Log de éxito
	uc.logger.Info().
		Uint("voting_id", votingID).
		Uint("property_unit_id", propertyUnitID).
		Bool("mark_attendance", markAttendance).
		Msg("Asistencia marcada exitosamente")

	return nil
}
