package mappers

import (
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"dbpostgres/app/infra/models"
)

// GroupToDomain mapea modelo GORM a entidad de dominio
func GroupToDomain(m *models.TrainingGroup) *domain.TrainingGroup {
	group := &domain.TrainingGroup{
		ID:                m.ID,
		BusinessID:        m.BusinessID,
		CoachID:           m.CoachID,
		Name:              m.Name,
		Code:              m.Code,
		Category:          m.Category,
		Description:       m.Description,
		MaxCapacity:       m.MaxCapacity,
		CurrentCapacity:   m.CurrentCapacity,
		AgeMin:            m.AgeMin,
		AgeMax:            m.AgeMax,
		SkillLevelID:      m.SkillLevelID,
		RecurringSchedule: m.RecurringSchedule,
		PhotoURL:          m.PhotoURL,
		IsActive:          m.IsActive,
		CreatedAt:         m.CreatedAt,
		UpdatedAt:         m.UpdatedAt,
	}

	if m.Coach.ID != 0 {
		group.Coach = &domain.CoachRef{
			ID:        m.Coach.ID,
			FirstName: m.Coach.FirstName,
			LastName:  m.Coach.LastName,
		}
	}

	if m.SkillLevel != nil {
		group.SkillLevel = &domain.SkillLevelRef{
			ID:    m.SkillLevel.ID,
			Name:  m.SkillLevel.Name,
			Code:  m.SkillLevel.Code,
			Level: m.SkillLevel.Level,
			Color: m.SkillLevel.Color,
		}
	}

	return group
}
