package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// GetVisitByQRCode obtiene una visita por código QR
func (uc *visitUseCase) GetVisitByQRCode(ctx context.Context, qrCode string) (*domain.Visit, error) {
	ctx = log.WithFunctionCtx(ctx, "GetVisitByQRCode")

	if qrCode == "" {
		return nil, domain.ErrVisitNotFound
	}

	visit, err := uc.visitRepo.GetVisitByQRCode(ctx, qrCode)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Str("qr_code", qrCode).Msg("Error obteniendo visita por QR")
		return nil, err
	}

	// Validar que el QR no haya expirado
	if visit.QRCodeExpiresAt != nil {
		// La validación de expiración debería hacerse en el handler o aquí
		// Por ahora, solo retornamos la visita
	}

	return visit, nil
}
