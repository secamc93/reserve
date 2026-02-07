package app

import (
	"context"

	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/shared/log"
)

func (uc *playerUseCase) UpdatePlayer(ctx context.Context, dto domain.UpdatePlayerDTO) (*domain.Player, error) {
	ctx = log.WithFunctionCtx(ctx, "UpdatePlayer")

	// Recalcular IsMinor
	isMinor := isMinorByDOB(dto.DateOfBirth)

	player := &domain.Player{
		ID:                  dto.ID,
		BusinessID:          dto.BusinessID,
		FirstName:           dto.FirstName,
		LastName:            dto.LastName,
		DocumentType:        dto.DocumentType,
		DocumentNumber:      dto.DocumentNumber,
		DateOfBirth:         dto.DateOfBirth,
		Gender:              dto.Gender,
		Email:               dto.Email,
		Phone:               dto.Phone,
		Address:             dto.Address,
		City:                dto.City,
		State:               dto.State,
		Country:             dto.Country,
		SkillLevelID:        dto.SkillLevelID,
		PreferredPosition:   dto.PreferredPosition,
		Height:              dto.Height,
		Weight:              dto.Weight,
		JerseyNumber:        dto.JerseyNumber,
		BloodType:           dto.BloodType,
		HasAllergies:        dto.HasAllergies,
		AllergyDetails:      dto.AllergyDetails,
		HasMedicalCondition: dto.HasMedicalCondition,
		MedicalDetails:      dto.MedicalDetails,
		EmergencyContact:    dto.EmergencyContact,
		EmergencyPhone:      dto.EmergencyPhone,
		PhotoURL:            dto.PhotoURL,
		Notes:               dto.Notes,
		IsActive:            dto.IsActive,
		IsMinor:             isMinor,
	}

	updated, err := uc.repo.Update(ctx, player)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error actualizando jugador %d", dto.ID)
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Jugador actualizado: %d", dto.ID)
	return updated, nil
}
