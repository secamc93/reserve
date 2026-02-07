package app

import (
	"context"

	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/shared/log"
)

func (uc *guardianUseCase) UpdateGuardian(ctx context.Context, dto domain.UpdateGuardianDTO) (*domain.Guardian, error) {
	ctx = log.WithFunctionCtx(ctx, "UpdateGuardian")

	guardian := &domain.Guardian{
		ID:               dto.ID,
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
		IsActive:         dto.IsActive,
	}

	updated, err := uc.repo.Update(ctx, guardian)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error actualizando tutor: %d", dto.ID)
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Tutor actualizado: %d", dto.ID)
	return updated, nil
}
