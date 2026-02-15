package mappers

import (
	"central_reserve/services/sporttraining/player/internal/domain"
	"dbpostgres/app/infra/models"
)

// PlayerToDomain mapea modelo GORM a entidad de dominio
func PlayerToDomain(m *models.STPlayer) *domain.Player {
	player := &domain.Player{
		ID:                  m.ID,
		BusinessID:          m.BusinessID,
		UserID:              m.UserID,
		FirstName:           m.FirstName,
		LastName:            m.LastName,
		DocumentType:        m.DocumentType,
		DocumentNumber:      m.DocumentNumber,
		DateOfBirth:         m.DateOfBirth,
		Gender:              m.Gender,
		Email:               m.Email,
		Phone:               m.Phone,
		Address:             m.Address,
		City:                m.City,
		State:               m.State,
		Country:             m.Country,
		SkillLevelID:        m.SkillLevelID,
		PreferredPosition:   m.PreferredPosition,
		Height:              m.Height,
		Weight:              m.Weight,
		JerseyNumber:        m.JerseyNumber,
		BloodType:           m.BloodType,
		HasAllergies:        m.HasAllergies,
		AllergyDetails:      m.AllergyDetails,
		HasMedicalCondition: m.HasMedicalCondition,
		MedicalDetails:      m.MedicalDetails,
		EmergencyContact:    m.EmergencyContact,
		EmergencyPhone:      m.EmergencyPhone,
		PhotoURL:            m.PhotoURL,
		Notes:               m.Notes,
		IsActive:            m.IsActive,
		IsMinor:             m.IsMinor,
		CreatedAt:           m.CreatedAt,
		UpdatedAt:           m.UpdatedAt,
	}

	if m.SkillLevel != nil {
		player.SkillLevel = &domain.SkillLevel{
			ID:    m.SkillLevel.ID,
			Name:  m.SkillLevel.Name,
			Code:  m.SkillLevel.Code,
			Level: m.SkillLevel.Level,
			Color: m.SkillLevel.Color,
		}
	}

	return player
}
