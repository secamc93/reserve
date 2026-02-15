package mappers

import (
	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"dbpostgres/app/infra/models"
)

// PackageToDomain mapea modelo de paquete a entidad de dominio
func PackageToDomain(m *models.Package) *domain.Package {
	pkg := &domain.Package{
		ID:                 m.ID,
		BusinessID:         m.BusinessID,
		PropertyUnitID:     m.PropertyUnitID,
		ResidentID:         m.ResidentID,
		PackageStatusID:    m.PackageStatusID,
		Carrier:            m.Carrier,
		TrackingNumber:     m.TrackingNumber,
		QRCode:             m.QRCode,
		ReceivedByUserID:   m.ReceivedByUserID,
		ReceivedAt:         m.ReceivedAt,
		DeliveredByUserID:  m.DeliveredByUserID,
		DeliveredAt:        m.DeliveredAt,
		Description:        m.Description,
		Notes:              m.Notes,
		NotifyResident:     m.NotifyResident,
		NotificationSentAt: m.NotificationSentAt,
		CreatedAt:          m.CreatedAt,
		UpdatedAt:          m.UpdatedAt,
	}

	// Mapear relaciones si están cargadas
	if m.PropertyUnit.ID != 0 {
		pkg.PropertyUnit = domain.PropertyUnit{
			ID:     m.PropertyUnit.ID,
			Number: m.PropertyUnit.Number,
			Floor:  m.PropertyUnit.Floor,
			Block:  m.PropertyUnit.Block,
		}
	}

	if m.Resident != nil && m.Resident.ID != 0 {
		pkg.Resident = &domain.Resident{
			ID:       m.Resident.ID,
			FullName: m.Resident.Name,
			Email:    m.Resident.Email,
			Phone:    m.Resident.Phone,
		}
	}

	if m.PackageStatus.ID != 0 {
		pkg.PackageStatus = domain.PackageStatus{
			ID:          m.PackageStatus.ID,
			Code:        m.PackageStatus.Code,
			Name:        m.PackageStatus.Name,
			Description: m.PackageStatus.Description,
			IsFinal:     m.PackageStatus.IsFinal,
			IsActive:    m.PackageStatus.IsActive,
		}
	}

	if m.ReceivedByUser != nil && m.ReceivedByUser.ID != 0 {
		pkg.ReceivedByUser = &domain.User{
			ID:    m.ReceivedByUser.ID,
			Name:  m.ReceivedByUser.Name,
			Email: m.ReceivedByUser.Email,
		}
	}

	if m.DeliveredByUser != nil && m.DeliveredByUser.ID != 0 {
		pkg.DeliveredByUser = &domain.User{
			ID:    m.DeliveredByUser.ID,
			Name:  m.DeliveredByUser.Name,
			Email: m.DeliveredByUser.Email,
		}
	}

	return pkg
}
