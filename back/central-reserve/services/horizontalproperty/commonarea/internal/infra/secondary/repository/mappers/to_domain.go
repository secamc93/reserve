package mappers

import (
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"dbpostgres/app/infra/models"
)

// NormalizeClock recorta una hora de Postgres ("08:00:00") a "HH:MM".
func NormalizeClock(v string) string {
	if len(v) >= 5 && v[2] == ':' {
		return v[:5]
	}
	return v
}

func normalizeClockPtr(v *string) *string {
	if v == nil {
		return nil
	}
	n := NormalizeClock(*v)
	return &n
}

// ReservationToDomain mapea modelo de reserva a entidad de dominio
func ReservationToDomain(m *models.CommonAreaReservation) *domain.CommonAreaReservation {
	r := &domain.CommonAreaReservation{
		ID:                  m.ID,
		BusinessID:          m.BusinessID,
		CommonAreaID:        m.CommonAreaID,
		PropertyUnitID:      m.PropertyUnitID,
		ResidentID:          m.ResidentID,
		ReservationStatusID: m.ReservationStatusID,
		ReservationDate:     m.ReservationDate,
		StartTime:           NormalizeClock(m.StartTime),
		EndTime:             NormalizeClock(m.EndTime),
		DurationHours:       m.DurationHours,
		RequiresApproval:    m.RequiresApproval,
		ApprovedByUserID:    m.ApprovedByUserID,
		ApprovedAt:          m.ApprovedAt,
		RejectedByUserID:    m.RejectedByUserID,
		RejectedAt:          m.RejectedAt,
		RejectionReason:     m.RejectionReason,
		NumberOfGuests:      m.NumberOfGuests,
		Purpose:             m.Purpose,
		SpecialRequests:     m.SpecialRequests,
		IsRecurring:         m.IsRecurring,
		RecurringPatternID:  m.RecurringPatternID,
		ParentReservationID: m.ParentReservationID,
		TotalAmount:         m.TotalAmount,
		DepositAmount:       m.DepositAmount,
		DepositPaid:         m.DepositPaid,
		DepositPaidAt:       m.DepositPaidAt,
		FullPaymentPaid:     m.FullPaymentPaid,
		FullPaymentPaidAt:   m.FullPaymentPaidAt,
		QRCode:              m.QRCode,
		AccessCode:          m.AccessCode,
		CheckedInAt:         m.CheckedInAt,
		CheckedOutAt:        m.CheckedOutAt,
		CheckedInByUserID:   m.CheckedInByUserID,
		CheckedOutByUserID:  m.CheckedOutByUserID,
		NotifyResident:      m.NotifyResident,
		NotifyAdmin:         m.NotifyAdmin,
		NotificationSentAt:  m.NotificationSentAt,
		ReminderSentAt:      m.ReminderSentAt,
		CancelledAt:         m.CancelledAt,
		CancelledByUserID:   m.CancelledByUserID,
		CancellationReason:  m.CancellationReason,
		RefundAmount:        m.RefundAmount,
		Notes:               m.Notes,
		ResidentNotes:       m.ResidentNotes,
		CreatedAt:           m.CreatedAt,
		UpdatedAt:           m.UpdatedAt,
	}
	if m.CommonArea.ID != 0 {
		r.CommonAreaName = m.CommonArea.Name
	}
	if m.PropertyUnit.ID != 0 {
		r.PropertyUnitNumber = m.PropertyUnit.Number
		r.PropertyUnitBlock = m.PropertyUnit.Block
	}
	if m.Resident != nil {
		r.ResidentName = m.Resident.Name
	}
	if m.ReservationStatus.ID != 0 {
		r.StatusCode = m.ReservationStatus.Code
		r.StatusName = m.ReservationStatus.Name
	}
	return r
}

// CommonAreaToDomain mapea modelo a entidad de dominio
func CommonAreaToDomain(m *models.CommonArea) *domain.CommonArea {
	a := &domain.CommonArea{
		ID:                   m.ID,
		BusinessID:           m.BusinessID,
		CommonAreaTypeID:     m.CommonAreaTypeID,
		Name:                 m.Name,
		Description:          m.Description,
		Location:             m.Location,
		MaxCapacity:          m.MaxCapacity,
		AreaSqm:              m.AreaSqm,
		HasEquipment:         m.HasEquipment,
		EquipmentDescription: m.EquipmentDescription,
		HourlyRate:           m.HourlyRate,
		RequiresApproval:     m.RequiresApproval,
		RequiresDeposit:      m.RequiresDeposit,
		DepositAmount:        m.DepositAmount,
		AllowsRecurring:      m.AllowsRecurring,
		IsActive:             m.IsActive,
		ImageURLs:            m.ImageURLs,
		CreatedAt:            m.CreatedAt,
		UpdatedAt:            m.UpdatedAt,
	}
	if m.CommonAreaType.ID != 0 {
		a.TypeName = m.CommonAreaType.Name
		a.TypeCode = m.CommonAreaType.Code
	}
	return a
}

// CommonAreaTypeToDomain mapea modelo de tipo a entidad de dominio
func CommonAreaTypeToDomain(m *models.CommonAreaType) *domain.CommonAreaType {
	return &domain.CommonAreaType{
		ID:                 m.ID,
		Name:               m.Name,
		Code:               m.Code,
		Description:        m.Description,
		Icon:               m.Icon,
		DefaultMaxCapacity: m.DefaultMaxCapacity,
		RequiresApproval:   m.RequiresApproval,
		AllowsRecurring:    m.AllowsRecurring,
		IsActive:           m.IsActive,
	}
}

// RestrictionToDomain mapea modelo a entidad de dominio
func RestrictionToDomain(m *models.CommonAreaRestriction) *domain.CommonAreaRestriction {
	return &domain.CommonAreaRestriction{
		ID:              m.ID,
		CommonAreaID:    m.CommonAreaID,
		RestrictionType: m.RestrictionType,
		StartDate:       m.StartDate,
		EndDate:         m.EndDate,
		StartTime:       normalizeClockPtr(m.StartTime),
		EndTime:         normalizeClockPtr(m.EndTime),
		Reason:          m.Reason,
		CreatedByUserID: m.CreatedByUserID,
		IsActive:        m.IsActive,
		CreatedAt:       m.CreatedAt,
		UpdatedAt:       m.UpdatedAt,
	}
}

// ScheduleToDomain mapea modelo a entidad de dominio
func ScheduleToDomain(m *models.CommonAreaSchedule) *domain.CommonAreaSchedule {
	return &domain.CommonAreaSchedule{
		ID:           m.ID,
		CommonAreaID: m.CommonAreaID,
		DayOfWeek:    m.DayOfWeek,
		StartTime:    NormalizeClock(m.StartTime),
		EndTime:      NormalizeClock(m.EndTime),
		IsActive:     m.IsActive,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
	}
}
