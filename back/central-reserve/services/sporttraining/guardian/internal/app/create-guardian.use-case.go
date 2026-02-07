package app

import (
	"context"

	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/shared/log"
)

func (uc *guardianUseCase) CreateGuardian(ctx context.Context, dto domain.CreateGuardianDTO) (*domain.Guardian, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateGuardian")

	guardian := &domain.Guardian{
		BusinessID:       dto.BusinessID,
		FirstName:        dto.FirstName,
		LastName:         dto.LastName,
		DocumentType:     dto.DocumentType,
		DocumentNumber:   dto.DocumentNumber,
		Email:            dto.Email,
		Phone:            dto.Phone,
		SecondaryPhone:   dto.SecondaryPhone,
		Address:          dto.Address,
		City:             dto.City,
		State:            dto.State,
		Country:          dto.Country,
		Relationship:     dto.Relationship,
		PhotoURL:         dto.PhotoURL,
		Notes:            dto.Notes,
		CanBookSessions:  dto.CanBookSessions,
		CanAccessRecords: dto.CanAccessRecords,
		IsActive:         true,
	}

	created, err := uc.repo.Create(ctx, guardian)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando tutor")
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Tutor creado: %d", created.ID)
	return created, nil
}
