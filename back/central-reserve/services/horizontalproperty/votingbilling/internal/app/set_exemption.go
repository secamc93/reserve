package app

import (
	"context"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/shared/log"
)

// SetExemption marca o desmarca una propiedad como exenta del cobro por día de votación.
func (u *useCase) SetExemption(ctx context.Context, req dtos.ExemptionRequest) error {
	ctx = log.WithFunctionCtx(ctx, "SetExemption")
	if err := u.repo.SetExempt(ctx, req.BusinessID, req.Exempt, req.UserID); err != nil {
		return err
	}
	u.logger.Info(ctx).Uint("business_id", req.BusinessID).Bool("exempt", req.Exempt).Msg("Exención de cobro de votaciones actualizada")
	return nil
}
