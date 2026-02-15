package mappers

import (
	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"dbpostgres/app/infra/models"
)

// ParkingZoneToDomain convierte modelo de zona de parqueo a entidad de dominio
func ParkingZoneToDomain(m *models.ParkingZone) *domain.ParkingZone {
	return &domain.ParkingZone{
		ID:          m.ID,
		BusinessID:  m.BusinessID,
		Name:        m.Name,
		Code:        m.Code,
		Description: m.Description,
		Location:    m.Location,
		TotalSlots:  m.TotalSlots,
		IsActive:    m.IsActive,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}

// ParkingOccupancyToDomain convierte modelo de ocupación a entidad de dominio
func ParkingOccupancyToDomain(m *models.ParkingOccupancy) *domain.ParkingOccupancy {
	return &domain.ParkingOccupancy{
		ID:                   m.ID,
		ParkingSlotID:        m.ParkingSlotID,
		ParkingReservationID: m.ParkingReservationID,
		VehiclePlate:         m.VehiclePlate,
		EntryTime:            m.EntryTime,
		ExitTime:             m.ExitTime,
		IsActive:             m.IsActive,
		EntryMethod:          m.EntryMethod,
		EntryGate:            m.EntryGate,
		ExitGate:             m.ExitGate,
		RegisteredByUserID:   m.RegisteredByUserID,
		Notes:                m.Notes,
		CreatedAt:            m.CreatedAt,
		UpdatedAt:            m.UpdatedAt,
	}
}

// ParkingTypeToDomain convierte modelo de tipo de parqueo a entidad de dominio
func ParkingTypeToDomain(m *models.ParkingType) *domain.ParkingType {
	return &domain.ParkingType{
		ID:          m.ID,
		Name:        m.Name,
		Code:        m.Code,
		Description: m.Description,
		IsActive:    m.IsActive,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}

// ParkingReservationToDomain convierte modelo de reserva de parqueo a entidad de dominio
func ParkingReservationToDomain(m *models.ParkingReservation) *domain.ParkingReservation {
	return &domain.ParkingReservation{
		ID:                  m.ID,
		BusinessID:          m.BusinessID,
		ParkingSlotID:       m.ParkingSlotID,
		PropertyUnitID:      m.PropertyUnitID,
		ResidentID:          m.ResidentID,
		VisitorID:           m.VisitorID,
		VisitorVehicleID:    m.VisitorVehicleID,
		ReservationStatusID: m.ReservationStatusID,
		ReservationDate:     m.ReservationDate,
		StartTime:           m.StartTime,
		EndTime:             m.EndTime,
		DurationHours:       m.DurationHours,
		VehiclePlate:        m.VehiclePlate,
		VehicleBrand:        m.VehicleBrand,
		VehicleModel:        m.VehicleModel,
		VehicleColor:        m.VehicleColor,
		QRCode:              m.QRCode,
		AccessCode:          m.AccessCode,
		CheckedInAt:         m.CheckedInAt,
		CheckedOutAt:        m.CheckedOutAt,
		CheckedInByUserID:   m.CheckedInByUserID,
		CheckedOutByUserID:  m.CheckedOutByUserID,
		RequiresApproval:    m.RequiresApproval,
		ApprovedByUserID:    m.ApprovedByUserID,
		ApprovedAt:          m.ApprovedAt,
		RejectedByUserID:    m.RejectedByUserID,
		RejectedAt:          m.RejectedAt,
		RejectionReason:     m.RejectionReason,
		NotifyResident:      m.NotifyResident,
		NotifyAdmin:         m.NotifyAdmin,
		NotificationSentAt:  m.NotificationSentAt,
		ReminderSentAt:      m.ReminderSentAt,
		CancelledAt:         m.CancelledAt,
		CancelledByUserID:   m.CancelledByUserID,
		CancellationReason:  m.CancellationReason,
		Notes:               m.Notes,
		ResidentNotes:       m.ResidentNotes,
		CreatedAt:           m.CreatedAt,
		UpdatedAt:           m.UpdatedAt,
	}
}

// ParkingAssignmentToDomain convierte modelo de asignación de parqueo a entidad de dominio
func ParkingAssignmentToDomain(m *models.ParkingAssignment) *domain.ParkingAssignment {
	return &domain.ParkingAssignment{
		ID:               m.ID,
		BusinessID:       m.BusinessID,
		ParkingSlotID:    m.ParkingSlotID,
		PropertyUnitID:   m.PropertyUnitID,
		ResidentID:       m.ResidentID,
		VehiclePlate:     m.VehiclePlate,
		VehicleBrand:     m.VehicleBrand,
		VehicleModel:     m.VehicleModel,
		VehicleColor:     m.VehicleColor,
		StartDate:        m.StartDate,
		EndDate:          m.EndDate,
		IsActive:         m.IsActive,
		Notes:            m.Notes,
		AssignedByUserID: m.AssignedByUserID,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	}
}

// ParkingSlotToDomain convierte modelo de espacio de parqueo a entidad de dominio
func ParkingSlotToDomain(m *models.ParkingSlot) *domain.ParkingSlot {
	return &domain.ParkingSlot{
		ID:            m.ID,
		ParkingZoneID: m.ParkingZoneID,
		ParkingTypeID: m.ParkingTypeID,
		SlotNumber:    m.SlotNumber,
		IsCovered:     m.IsCovered,
		Width:         m.Width,
		Length:        m.Length,
		Height:        m.Height,
		HasCharger:    m.HasCharger,
		IsActive:      m.IsActive,
		CreatedAt:     m.CreatedAt,
		UpdatedAt:     m.UpdatedAt,
	}
}
