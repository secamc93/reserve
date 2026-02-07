package app

import (
	"context"

	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/shared/log"
)

func (uc *coachUseCase) CreateCoach(ctx context.Context, dto domain.CreateCoachDTO) (*domain.Coach, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateCoach")

	coach := &domain.Coach{
		BusinessID:         dto.BusinessID,
		UserID:             dto.UserID,
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
		IsAvailable:        true,
		MaxSessionsPerDay:  dto.MaxSessionsPerDay,
		MaxSessionsPerWeek: dto.MaxSessionsPerWeek,
		HourlyRate:         dto.HourlyRate,
		PhotoURL:           dto.PhotoURL,
		Notes:              dto.Notes,
		IsActive:           true,
	}

	created, err := uc.repo.Create(ctx, coach)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando entrenador")
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Entrenador creado: %d", created.ID)
	return created, nil
}
