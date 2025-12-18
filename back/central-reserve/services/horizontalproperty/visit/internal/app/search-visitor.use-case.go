package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// SearchVisitor busca un visitante por DNI
func (uc *visitUseCase) SearchVisitor(ctx context.Context, businessID uint, dni string) (*domain.Visitor, error) {
	ctx = log.WithFunctionCtx(ctx, "SearchVisitor")

	if dni == "" {
		uc.logger.Error(ctx).Msg("DNI requerido para búsqueda")
		return nil, domain.ErrVisitorNotFound
	}

	businessIDPtr := &businessID
	visitor, err := uc.visitorRepo.FindByDNI(ctx, businessIDPtr, dni)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", businessID).Str("dni", dni).Msg("Error buscando visitante")
		return nil, err
	}

	if visitor == nil {
		uc.logger.Info(ctx).Uint("business_id", businessID).Str("dni", dni).Msg("Visitante no encontrado")
		return nil, domain.ErrVisitorNotFound
	}

	return visitor, nil
}
