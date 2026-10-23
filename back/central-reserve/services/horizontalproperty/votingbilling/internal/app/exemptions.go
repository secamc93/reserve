package app

import (
	"context"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/shared/log"
)

// SetPropertyExemption marca o desmarca una propiedad como exenta del cobro.
func (u *useCase) SetPropertyExemption(ctx context.Context, req dtos.PropertyExemptionRequest) error {
	ctx = log.WithFunctionCtx(ctx, "SetPropertyExemption")
	if err := u.repo.SetPropertyExempt(ctx, req.BusinessID, req.Exempt, req.UserID); err != nil {
		return err
	}
	u.logger.Info(ctx).Uint("business_id", req.BusinessID).Bool("exempt", req.Exempt).Msg("Exención de propiedad actualizada")
	return nil
}

// SetAdminExemption marca o desmarca a un administrador como exento: cubre todas las propiedades
// que administra, también las que agregue después.
func (u *useCase) SetAdminExemption(ctx context.Context, req dtos.AdminExemptionRequest) error {
	ctx = log.WithFunctionCtx(ctx, "SetAdminExemption")
	n, err := u.repo.CountManagedProperties(ctx, req.TargetUserID)
	if err != nil {
		return err
	}
	if n == 0 {
		return domainerrors.ErrUserNotPropertyAdmin
	}
	if err := u.repo.SetUserExempt(ctx, req.TargetUserID, req.Exempt, req.Notes, req.ByUserID); err != nil {
		return err
	}
	u.logger.Info(ctx).Uint("user_id", req.TargetUserID).Bool("exempt", req.Exempt).Msg("Exención de administrador actualizada")
	return nil
}

// ListPropertyAdmins lista los administradores de la propiedad con su exención.
func (u *useCase) ListPropertyAdmins(ctx context.Context, businessID uint) ([]entities.PropertyAdmin, error) {
	return u.repo.ListPropertyAdmins(ctx, businessID)
}
