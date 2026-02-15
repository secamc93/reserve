package mappers

import (
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/response"
)

// GroupToResponse mapea entidad de dominio a respuesta HTTP
func GroupToResponse(g *domain.TrainingGroup) response.GroupData {
	data := response.GroupData{
		ID:                g.ID,
		BusinessID:        g.BusinessID,
		CoachID:           g.CoachID,
		Name:              g.Name,
		Code:              g.Code,
		Category:          g.Category,
		Description:       g.Description,
		MaxCapacity:       g.MaxCapacity,
		CurrentCapacity:   g.CurrentCapacity,
		AgeMin:            g.AgeMin,
		AgeMax:            g.AgeMax,
		SkillLevelID:      g.SkillLevelID,
		RecurringSchedule: g.RecurringSchedule,
		PhotoURL:          g.PhotoURL,
		IsActive:          g.IsActive,
		CreatedAt:         g.CreatedAt,
		UpdatedAt:         g.UpdatedAt,
	}

	if g.Coach != nil {
		data.CoachName = g.Coach.FirstName + " " + g.Coach.LastName
	}

	if g.SkillLevel != nil {
		data.SkillLevelName = g.SkillLevel.Name
	}

	return data
}
