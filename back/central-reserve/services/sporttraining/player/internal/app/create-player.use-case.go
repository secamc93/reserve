package app

import (
	"context"
	"time"

	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/shared/log"
)

func (uc *playerUseCase) CreatePlayer(ctx context.Context, dto domain.CreatePlayerDTO) (*domain.Player, error) {
	ctx = log.WithFunctionCtx(ctx, "CreatePlayer")

	// Calcular si es menor de edad
	isMinor := isMinorByDOB(dto.DateOfBirth)

	player := &domain.Player{
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
		IsActive:            true,
		IsMinor:             isMinor,
	}

	created, err := uc.repo.Create(ctx, player)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando jugador")
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Jugador creado: %d", created.ID)
	return created, nil
}

// isMinorByDOB calcula si una persona es menor de 18 años
func isMinorByDOB(dob time.Time) bool {
	now := time.Now()
	age := now.Year() - dob.Year()
	if now.YearDay() < dob.YearDay() {
		age--
	}
	return age < 18
}
