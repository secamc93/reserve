package usecaseattendance

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// CreateAttendanceList - Crear lista de asistencia
func (uc *AttendanceUseCase) CreateAttendanceList(ctx context.Context, dto domain.CreateAttendanceListDTO) (*domain.AttendanceListDTO, error) {
	uc.logger.Info().
		Uint("voting_group_id", dto.VotingGroupID).
		Str("title", dto.Title).
		Msg("Creando lista de asistencia")

	// Crear entidad
	attendanceList := domain.AttendanceList{
		VotingGroupID:   dto.VotingGroupID,
		Title:           dto.Title,
		Description:     dto.Description,
		IsActive:        true,
		CreatedByUserID: dto.CreatedByUserID,
		Notes:           dto.Notes,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Guardar en repositorio
	created, err := uc.attendanceRepo.CreateAttendanceList(ctx, attendanceList)
	if err != nil {
		uc.logger.Error().Err(err).
			Uint("voting_group_id", dto.VotingGroupID).
			Msg("Error creando lista de asistencia")
		return nil, err
	}

	// Mapear a DTO de respuesta
	response := &domain.AttendanceListDTO{
		ID:              created.ID,
		VotingGroupID:   created.VotingGroupID,
		Title:           created.Title,
		Description:     created.Description,
		IsActive:        created.IsActive,
		CreatedByUserID: created.CreatedByUserID,
		Notes:           created.Notes,
		CreatedAt:       created.CreatedAt,
		UpdatedAt:       created.UpdatedAt,
	}

	uc.logger.Info().
		Uint("attendance_list_id", created.ID).
		Uint("voting_group_id", dto.VotingGroupID).
		Msg("Lista de asistencia creada exitosamente")

	return response, nil
}
