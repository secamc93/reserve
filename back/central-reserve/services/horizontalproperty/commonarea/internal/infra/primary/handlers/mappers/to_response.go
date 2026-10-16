package mappers

import (
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
)

// ReservationToResponse mapea dominio a response
func ReservationToResponse(r *domain.CommonAreaReservation) response.ReservationResponse {
	return response.ReservationResponse{
		ID:                  r.ID,
		BusinessID:          r.BusinessID,
		CommonAreaID:        r.CommonAreaID,
		CommonAreaName:      r.CommonAreaName,
		PropertyUnitID:      r.PropertyUnitID,
		PropertyUnitNumber:  r.PropertyUnitNumber,
		PropertyUnitBlock:   r.PropertyUnitBlock,
		ResidentID:          r.ResidentID,
		ResidentName:        r.ResidentName,
		ReservationStatusID: r.ReservationStatusID,
		StatusCode:          r.StatusCode,
		StatusName:          r.StatusName,
		ReservationDate:     r.ReservationDate,
		StartTime:           r.StartTime,
		EndTime:             r.EndTime,
		DurationHours:       r.DurationHours,
		RequiresApproval:    r.RequiresApproval,
		ApprovedAt:          r.ApprovedAt,
		RejectedAt:          r.RejectedAt,
		RejectionReason:     r.RejectionReason,
		NumberOfGuests:      r.NumberOfGuests,
		Purpose:             r.Purpose,
		SpecialRequests:     r.SpecialRequests,
		IsRecurring:         r.IsRecurring,
		TotalAmount:         r.TotalAmount,
		DepositAmount:       r.DepositAmount,
		DepositPaid:         r.DepositPaid,
		DepositPaidAt:       r.DepositPaidAt,
		FullPaymentPaid:     r.FullPaymentPaid,
		FullPaymentPaidAt:   r.FullPaymentPaidAt,
		QRCode:              r.QRCode,
		AccessCode:          r.AccessCode,
		CheckedInAt:         r.CheckedInAt,
		CheckedOutAt:        r.CheckedOutAt,
		CancelledAt:         r.CancelledAt,
		CancellationReason:  r.CancellationReason,
		Notes:               r.Notes,
		ResidentNotes:       r.ResidentNotes,
		CreatedAt:           r.CreatedAt,
		UpdatedAt:           r.UpdatedAt,
	}
}

// ReservationListToResponse mapea un ítem de la lista de reservas
func ReservationListToResponse(r domain.ReservationListDTO) response.ReservationListResponse {
	return response.ReservationListResponse{
		ID:                 r.ID,
		CommonAreaID:       r.CommonAreaID,
		CommonAreaName:     r.CommonAreaName,
		PropertyUnitID:     r.PropertyUnitID,
		PropertyUnitNumber: r.PropertyUnitNumber,
		PropertyUnitBlock:  r.PropertyUnitBlock,
		ResidentName:       r.ResidentName,
		StatusCode:         r.StatusCode,
		StatusName:         r.StatusName,
		ReservationDate:    r.ReservationDate,
		StartTime:          r.StartTime,
		EndTime:            r.EndTime,
		NumberOfGuests:     r.NumberOfGuests,
		Purpose:            r.Purpose,
		RequiresApproval:   r.RequiresApproval,
		TotalAmount:        r.TotalAmount,
		DepositAmount:      r.DepositAmount,
		DepositPaid:        r.DepositPaid,
		FullPaymentPaid:    r.FullPaymentPaid,
		CheckedInAt:        r.CheckedInAt,
		CreatedAt:          r.CreatedAt,
	}
}

// CommonAreaToResponse mapea una zona común completa
func CommonAreaToResponse(a *domain.CommonArea) response.CommonAreaResponse {
	return response.CommonAreaResponse{
		ID:                   a.ID,
		BusinessID:           a.BusinessID,
		CommonAreaTypeID:     a.CommonAreaTypeID,
		Name:                 a.Name,
		Description:          a.Description,
		Location:             a.Location,
		MaxCapacity:          a.MaxCapacity,
		AreaSqm:              a.AreaSqm,
		HasEquipment:         a.HasEquipment,
		EquipmentDescription: a.EquipmentDescription,
		HourlyRate:           a.HourlyRate,
		RequiresApproval:     a.RequiresApproval,
		RequiresDeposit:      a.RequiresDeposit,
		DepositAmount:        a.DepositAmount,
		AllowsRecurring:      a.AllowsRecurring,
		IsActive:             a.IsActive,
		ImageURLs:            a.ImageURLs,
		TypeName:             a.TypeName,
		TypeCode:             a.TypeCode,
		CreatedAt:            a.CreatedAt,
		UpdatedAt:            a.UpdatedAt,
	}
}

// CommonAreaListToResponse mapea un ítem de la lista de zonas
func CommonAreaListToResponse(a domain.CommonAreaListDTO) response.CommonAreaListResponse {
	schedules := make([]response.ScheduleResponse, len(a.Schedules))
	for i := range a.Schedules {
		schedules[i] = ScheduleToResponse(&a.Schedules[i])
	}
	restrictions := make([]response.RestrictionResponse, len(a.Restrictions))
	for i := range a.Restrictions {
		restrictions[i] = RestrictionToResponse(&a.Restrictions[i])
	}
	return response.CommonAreaListResponse{
		ID:                   a.ID,
		Name:                 a.Name,
		TypeName:             a.TypeName,
		TypeCode:             a.TypeCode,
		Description:          a.Description,
		Location:             a.Location,
		MaxCapacity:          a.MaxCapacity,
		AreaSqm:              a.AreaSqm,
		HasEquipment:         a.HasEquipment,
		EquipmentDescription: a.EquipmentDescription,
		HourlyRate:           a.HourlyRate,
		RequiresDeposit:      a.RequiresDeposit,
		DepositAmount:        a.DepositAmount,
		AllowsRecurring:      a.AllowsRecurring,
		IsActive:             a.IsActive,
		RequiresApproval:     a.RequiresApproval,
		ImageURLs:            a.ImageURLs,
		Schedules:            schedules,
		Restrictions:         restrictions,
	}
}

// ScheduleToResponse mapea un horario
func ScheduleToResponse(s *domain.CommonAreaSchedule) response.ScheduleResponse {
	return response.ScheduleResponse{
		ID:        s.ID,
		DayOfWeek: s.DayOfWeek,
		StartTime: s.StartTime,
		EndTime:   s.EndTime,
		IsActive:  s.IsActive,
	}
}

// RestrictionToResponse mapea un bloqueo
func RestrictionToResponse(r *domain.CommonAreaRestriction) response.RestrictionResponse {
	return response.RestrictionResponse{
		ID:              r.ID,
		CommonAreaID:    r.CommonAreaID,
		RestrictionType: r.RestrictionType,
		StartDate:       r.StartDate.Format("2006-01-02"),
		EndDate:         r.EndDate.Format("2006-01-02"),
		StartTime:       r.StartTime,
		EndTime:         r.EndTime,
		Reason:          r.Reason,
		IsActive:        r.IsActive,
	}
}
