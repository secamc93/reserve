package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// GetCompanionsByVisitID obtiene los acompañantes de una visita
func (uc *visitUseCase) GetCompanionsByVisitID(ctx context.Context, visitID uint) ([]*domain.VisitCompanion, error) {
	ctx = log.WithFunctionCtx(ctx, "GetCompanionsByVisitID")

	companions, err := uc.companionRepo.GetCompanionsByVisitID(ctx, visitID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error obteniendo acompañantes")
		return nil, err
	}

	return companions, nil
}

// CreateCompanion crea un nuevo acompañante para una visita
func (uc *visitUseCase) CreateCompanion(ctx context.Context, visitID uint, dto domain.CreateVisitCompanionDTO) (*domain.VisitCompanion, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateCompanion")

	// Verificar que la visita existe
	visit, err := uc.visitRepo.GetVisitByID(ctx, visitID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error verificando visita para acompañante")
		return nil, err
	}

	if visit == nil {
		return nil, domain.ErrVisitNotFound
	}

	// Crear el acompañante
	companion := &domain.VisitCompanion{
		VisitID:        visitID,
		CompanionName:  dto.CompanionName,
		CompanionDNI:   dto.CompanionDNI,
		CompanionPhone: dto.CompanionPhone,
		IsMinor:        dto.IsMinor,
		Relationship:   dto.Relationship,
		Notes:          dto.Notes,
	}

	result, err := uc.companionRepo.CreateCompanion(ctx, companion)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error creando acompañante")
		return nil, err
	}

	uc.logger.Info(ctx).Uint("visit_id", visitID).Uint("companion_id", result.ID).Msg("Acompañante creado correctamente")
	return result, nil
}

// DeleteCompanion elimina un acompañante
func (uc *visitUseCase) DeleteCompanion(ctx context.Context, companionID uint) error {
	ctx = log.WithFunctionCtx(ctx, "DeleteCompanion")

	err := uc.companionRepo.DeleteCompanion(ctx, companionID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("companion_id", companionID).Msg("Error eliminando acompañante")
		return err
	}

	uc.logger.Info(ctx).Uint("companion_id", companionID).Msg("Acompañante eliminado correctamente")
	return nil
}
