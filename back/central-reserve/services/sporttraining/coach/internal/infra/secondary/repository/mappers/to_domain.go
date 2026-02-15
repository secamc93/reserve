package mappers

import (
	"central_reserve/services/sporttraining/coach/internal/domain"
	"dbpostgres/app/infra/models"
)

// CoachToDomain mapea modelo GORM a entidad de dominio
func CoachToDomain(m *models.Coach) *domain.Coach {
	coach := &domain.Coach{
		ID:                 m.ID,
		BusinessID:         m.BusinessID,
		UserID:             m.UserID,
		FirstName:          m.FirstName,
		LastName:           m.LastName,
		DocumentType:       m.DocumentType,
		DocumentNumber:     m.DocumentNumber,
		Email:              m.Email,
		Phone:              m.Phone,
		LicenseNumber:      m.LicenseNumber,
		YearsOfExperience:  m.YearsOfExperience,
		Biography:          m.Biography,
		Certifications:     m.Certifications,
		IsAvailable:        m.IsAvailable,
		MaxSessionsPerDay:  m.MaxSessionsPerDay,
		MaxSessionsPerWeek: m.MaxSessionsPerWeek,
		HourlyRate:         m.HourlyRate,
		PhotoURL:           m.PhotoURL,
		Notes:              m.Notes,
		IsActive:           m.IsActive,
		CreatedAt:          m.CreatedAt,
		UpdatedAt:          m.UpdatedAt,
	}

	if m.CoachSpecialtyAssignments != nil && len(m.CoachSpecialtyAssignments) > 0 {
		coach.Specialties = make([]domain.SpecialtyAssignment, len(m.CoachSpecialtyAssignments))
		for i, a := range m.CoachSpecialtyAssignments {
			coach.Specialties[i] = domain.SpecialtyAssignment{
				ID:               a.ID,
				CoachID:          a.CoachID,
				SpecialtyID:      a.CoachSpecialtyID,
				SpecialtyName:    a.CoachSpecialty.Name,
				SpecialtyCode:    a.CoachSpecialty.Code,
				ProficiencyLevel: a.ProficiencyLevel,
				CreatedAt:        a.CreatedAt,
			}
		}
	}

	return coach
}
