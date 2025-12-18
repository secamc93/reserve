package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
)

// ReceivePackage registra la recepción de un paquete
func (uc *packageUseCase) ReceivePackage(ctx context.Context, dto domain.CreatePackageDTO) (*domain.Package, error) {
	ctx = log.WithFunctionCtx(ctx, "ReceivePackage")

	// Validaciones básicas
	if dto.PropertyUnitID == 0 {
		return nil, fmt.Errorf("property_unit_id es requerido")
	}
	if dto.Carrier == "" {
		return nil, fmt.Errorf("carrier es requerido")
	}
	if dto.TrackingNumber == "" {
		return nil, fmt.Errorf("tracking_number es requerido")
	}

	// Obtener estado inicial (received)
	status, err := uc.getPackageStatusByCode(ctx, "received")
	if err != nil {
		return nil, fmt.Errorf("error obteniendo estado received: %w", err)
	}

	// Generar código QR único
	qrCode := generateQRCode(dto.TrackingNumber)

	now := time.Now()

	// Crear entidad de paquete
	pkg := &domain.Package{
		BusinessID:       dto.BusinessID,
		PropertyUnitID:   dto.PropertyUnitID,
		ResidentID:       dto.ResidentID,
		PackageStatusID:  status.ID,
		Carrier:          dto.Carrier,
		TrackingNumber:   dto.TrackingNumber,
		QRCode:           qrCode,
		ReceivedByUserID: &dto.ReceivedByUserID,
		ReceivedAt:       &now,
		Description:      dto.Description,
		Notes:            dto.Notes,
		NotifyResident:   dto.NotifyResident,
	}

	// Crear paquete
	created, err := uc.packageRepo.CreatePackage(ctx, pkg)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando paquete")
		return nil, fmt.Errorf("error creando paquete: %w", err)
	}

	uc.logger.Info(ctx).Uint("package_id", created.ID).Str("tracking_number", dto.TrackingNumber).Msg("Paquete recibido exitosamente")

	return created, nil
}

// generateQRCode genera un código QR único para el paquete
func generateQRCode(trackingNumber string) string {
	return fmt.Sprintf("PKG-%s-%d", trackingNumber, time.Now().Unix())
}
