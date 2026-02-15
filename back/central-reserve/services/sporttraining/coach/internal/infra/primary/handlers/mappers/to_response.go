package mappers

import (
	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/response"
)

// CoachToResponse mapea entidad de dominio a respuesta HTTP
func CoachToResponse(c *domain.Coach) response.CoachData {
	data := response.CoachData{
		ID:                 c.ID,
		BusinessID:         c.BusinessID,
		UserID:             c.UserID,
		FirstName:          c.FirstName,
		LastName:           c.LastName,
		DocumentType:       c.DocumentType,
		DocumentNumber:     c.DocumentNumber,
		Email:              c.Email,
		Phone:              c.Phone,
		LicenseNumber:      c.LicenseNumber,
		YearsOfExperience:  c.YearsOfExperience,
		Biography:          c.Biography,
		Certifications:     c.Certifications,
		IsAvailable:        c.IsAvailable,
		MaxSessionsPerDay:  c.MaxSessionsPerDay,
		MaxSessionsPerWeek: c.MaxSessionsPerWeek,
		HourlyRate:         c.HourlyRate,
		PhotoURL:           c.PhotoURL,
		Notes:              c.Notes,
		IsActive:           c.IsActive,
		CreatedAt:          c.CreatedAt,
		UpdatedAt:          c.UpdatedAt,
	}

	if c.Specialties != nil && len(c.Specialties) > 0 {
		data.Specialties = make([]response.SpecialtyAssignmentData, len(c.Specialties))
		for i, s := range c.Specialties {
			data.Specialties[i] = response.SpecialtyAssignmentData{
				ID:               s.ID,
				SpecialtyID:      s.SpecialtyID,
				SpecialtyName:    s.SpecialtyName,
				SpecialtyCode:    s.SpecialtyCode,
				ProficiencyLevel: s.ProficiencyLevel,
				CreatedAt:        s.CreatedAt,
			}
		}
	}

	return data
}
