package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// CreateOrGetVisitor crea un visitante o lo obtiene si ya existe
func (uc *visitUseCase) CreateOrGetVisitor(ctx context.Context, businessID *uint, dni string, name string, phone string) (*domain.Visitor, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateOrGetVisitor")

	visitor, err := uc.visitorRepo.CreateOrGetVisitor(ctx, businessID, dni, name, phone)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Str("dni", dni).Msg("Error creando/obteniendo visitante")
		return nil, err
	}

	return visitor, nil
}
