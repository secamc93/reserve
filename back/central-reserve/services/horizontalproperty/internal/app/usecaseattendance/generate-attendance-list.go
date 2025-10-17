package usecaseattendance

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// GenerateAttendanceList - Generar lista de asistencia automáticamente para un grupo de votación
func (uc *AttendanceUseCase) GenerateAttendanceList(ctx context.Context, votingGroupID uint) (*domain.AttendanceListDTO, error) {
	uc.logger.Info().
		Uint("voting_group_id", votingGroupID).
		Msg("Generando lista de asistencia automática")

	// Verificar si ya existe una lista para este grupo de votación
	existingList, err := uc.attendanceRepo.GetAttendanceListByVotingGroup(ctx, votingGroupID)
	if err != nil {
		return nil, err
	}

	var attendanceList *domain.AttendanceListDTO
	if existingList == nil {
		// Crear nueva lista de asistencia
		createDTO := domain.CreateAttendanceListDTO{
			VotingGroupID: votingGroupID,
			Title:         "Lista de Asistencia - Generada Automáticamente",
			Description:   "Lista de asistencia generada automáticamente para el grupo de votación",
			Notes:         "Generada automáticamente por el sistema",
		}

		// Crear la lista
		attendanceList, err = uc.CreateAttendanceList(ctx, createDTO)
		if err != nil {
			uc.logger.Error().Err(err).
				Uint("voting_group_id", votingGroupID).
				Msg("Error creando lista de asistencia")
			return nil, err
		}
		// Generar registros de asistencia para todas las unidades SOLO en nueva lista
		records, err := uc.attendanceRepo.GenerateAttendanceListForVotingGroup(ctx, votingGroupID)
		if err != nil {
			uc.logger.Error().Err(err).
				Uint("voting_group_id", votingGroupID).
				Uint("attendance_list_id", attendanceList.ID).
				Msg("Error generando registros de asistencia")
			return nil, err
		}

		// Crear registros en batch (si hay)
		if len(records) > 0 {
			// Asignar el attendance_list_id recién creado
			for i := range records {
				records[i].AttendanceListID = attendanceList.ID
				records[i].AttendedAsOwner = false
				records[i].AttendedAsProxy = false
				records[i].IsValid = true
			}
			if err := uc.attendanceRepo.CreateAttendanceRecordsInBatch(ctx, records); err != nil {
				uc.logger.Error().Err(err).
					Uint("voting_group_id", votingGroupID).
					Uint("attendance_list_id", attendanceList.ID).
					Msg("Error creando registros de asistencia en batch")
				return nil, err
			}
		}
	} else {
		// Si ya existe, NO modificar ni eliminar registros; retornar tal cual
		attendanceList = &domain.AttendanceListDTO{
			ID:              existingList.ID,
			VotingGroupID:   existingList.VotingGroupID,
			Title:           existingList.Title,
			Description:     existingList.Description,
			IsActive:        existingList.IsActive,
			CreatedByUserID: existingList.CreatedByUserID,
			Notes:           existingList.Notes,
			CreatedAt:       existingList.CreatedAt,
			UpdatedAt:       existingList.UpdatedAt,
		}
	}

	uc.logger.Info().
		Uint("attendance_list_id", attendanceList.ID).
		Uint("voting_group_id", votingGroupID).
		Msg("Lista de asistencia generada/recuperada exitosamente")

	return attendanceList, nil
}
