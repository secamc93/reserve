package mappers

import (
	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/services/sporttraining/player/internal/infra/primary/handlers/response"
)

// PlayerToResponse mapea entidad de dominio a respuesta HTTP
func PlayerToResponse(p *domain.Player) response.PlayerData {
	data := response.PlayerData{
		ID:                  p.ID,
		BusinessID:          p.BusinessID,
		FirstName:           p.FirstName,
		LastName:            p.LastName,
		DocumentType:        p.DocumentType,
		DocumentNumber:      p.DocumentNumber,
		DateOfBirth:         p.DateOfBirth,
		Gender:              p.Gender,
		Email:               p.Email,
		Phone:               p.Phone,
		Address:             p.Address,
		City:                p.City,
		State:               p.State,
		Country:             p.Country,
		SkillLevelID:        p.SkillLevelID,
		PreferredPosition:   p.PreferredPosition,
		Height:              p.Height,
		Weight:              p.Weight,
		JerseyNumber:        p.JerseyNumber,
		BloodType:           p.BloodType,
		HasAllergies:        p.HasAllergies,
		AllergyDetails:      p.AllergyDetails,
		HasMedicalCondition: p.HasMedicalCondition,
		MedicalDetails:      p.MedicalDetails,
		EmergencyContact:    p.EmergencyContact,
		EmergencyPhone:      p.EmergencyPhone,
		PhotoURL:            p.PhotoURL,
		Notes:               p.Notes,
		IsActive:            p.IsActive,
		IsMinor:             p.IsMinor,
		CreatedAt:           p.CreatedAt,
		UpdatedAt:           p.UpdatedAt,
	}

	if p.SkillLevel != nil {
		data.SkillLevelName = p.SkillLevel.Name
	}

	return data
}
