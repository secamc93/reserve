package app

import (
	"context"

	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/shared/log"
)

func (uc *coachUseCase) UpdateCoach(ctx context.Context, dto domain.UpdateCoachDTO) (*domain.Coach, error) {
	ctx = log.WithFunctionCtx(ctx, "UpdateCoach")

	coach := &domain.Coach{
		ID:                 dto.ID,
		BusinessID:         dto.BusinessID,
		FirstName:          dto.FirstName,
		LastName:           dto.LastName,
		DocumentType:       dto.DocumentType,
		DocumentNumber:     dto.DocumentNumber,
		Email:              dto.Email,
		Phone:              dto.Phone,
		LicenseNumber:      dto.LicenseNumber,
		YearsOfExperience:  dto.YearsOfExperience,
		Biography:          dto.Biography,
		Certifications:     dto.Certifications,
		IsAvailable:        dto.IsAvailable,
		MaxSessionsPerDay:  dto.MaxSessionsPerDay,
		MaxSessionsPerWeek: dto.MaxSessionsPerWeek,
		HourlyRate:         dto.HourlyRate,
		PhotoURL:           dto.PhotoURL,
		Notes:              dto.Notes,
		IsActive:           dto.IsActive,
	}

	updated, err := uc.repo.Update(ctx, coach)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error actualizando entrenador: %d", dto.ID)
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Entrenador actualizado: %d", updated.ID)
	return updated, nil
}
