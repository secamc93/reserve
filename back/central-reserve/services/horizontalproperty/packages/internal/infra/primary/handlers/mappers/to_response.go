package mappers

import (
	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/response"
)

// PackageToResponse mapea entidad de dominio a respuesta HTTP
func PackageToResponse(pkg *domain.Package) response.PackageData {
	data := response.PackageData{
		ID:                 pkg.ID,
		BusinessID:         pkg.BusinessID,
		PropertyUnitID:     pkg.PropertyUnitID,
		ResidentID:         pkg.ResidentID,
		PackageStatusID:    pkg.PackageStatusID,
		Carrier:            pkg.Carrier,
		TrackingNumber:     pkg.TrackingNumber,
		QRCode:             pkg.QRCode,
		ReceivedByUserID:   pkg.ReceivedByUserID,
		ReceivedAt:         pkg.ReceivedAt,
		DeliveredByUserID:  pkg.DeliveredByUserID,
		DeliveredAt:        pkg.DeliveredAt,
		Description:        pkg.Description,
		Notes:              pkg.Notes,
		NotifyResident:     pkg.NotifyResident,
		NotificationSentAt: pkg.NotificationSentAt,
		CreatedAt:          pkg.CreatedAt,
		UpdatedAt:          pkg.UpdatedAt,
	}

	if pkg.PropertyUnit.ID != 0 {
		data.PropertyUnitNumber = pkg.PropertyUnit.Number
		data.PropertyUnitBlock = pkg.PropertyUnit.Block
	}
	if pkg.ReceivedByUser != nil {
		data.ReceivedByName = pkg.ReceivedByUser.Name
	}
	if pkg.DeliveredByUser != nil {
		data.DeliveredByName = pkg.DeliveredByUser.Name
	}
	if pkg.Resident != nil {
		data.ResidentName = pkg.Resident.FullName
	}
	if pkg.PackageStatus.ID != 0 {
		data.StatusName = pkg.PackageStatus.Name
		data.StatusCode = pkg.PackageStatus.Code
	}

	return data
}
