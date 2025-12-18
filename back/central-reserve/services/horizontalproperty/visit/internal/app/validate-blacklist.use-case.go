package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// ValidateBlacklist valida si un visitante está en lista negra
func (uc *visitUseCase) ValidateBlacklist(ctx context.Context, businessID uint, visitorID uint) (bool, error) {
	ctx = log.WithFunctionCtx(ctx, "ValidateBlacklist")

	isBlacklisted, err := uc.blacklistRepo.IsVisitorBlacklisted(ctx, businessID, visitorID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", businessID).Uint("visitor_id", visitorID).Msg("Error validando lista negra")
		return false, err
	}

	if isBlacklisted {
		uc.logger.Warn(ctx).Uint("business_id", businessID).Uint("visitor_id", visitorID).Msg("Visitante está en lista negra")
		return true, domain.ErrVisitorBlacklisted
	}

	return false, nil
}
