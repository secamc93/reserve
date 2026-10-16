package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

var restrictionTypes = map[string]bool{"maintenance": true, "event": true, "blocked": true, "holiday": true}

// ListRestrictions lista los bloqueos vigentes o futuros de una zona
func (uc *commonAreaUseCase) ListRestrictions(ctx context.Context, commonAreaID uint, fromDate time.Time) ([]*domain.CommonAreaRestriction, error) {
	ctx = log.WithFunctionCtx(ctx, "ListRestrictions")
	return uc.restrictionRepo.ListRestrictions(ctx, commonAreaID, fromDate)
}

// CreateRestriction bloquea una zona en un rango de fechas (y opcionalmente de horas)
func (uc *commonAreaUseCase) CreateRestriction(ctx context.Context, dto domain.CreateRestrictionDTO) (*domain.CommonAreaRestriction, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateRestriction")

	if !restrictionTypes[dto.RestrictionType] {
		return nil, fmt.Errorf("%w: tipo %q no soportado", domain.ErrInvalidRestriction, dto.RestrictionType)
	}
	if dto.EndDate.Before(dto.StartDate) {
		return nil, fmt.Errorf("%w: la fecha de fin es anterior a la de inicio", domain.ErrInvalidRestriction)
	}
	if (dto.StartTime == nil) != (dto.EndTime == nil) {
		return nil, fmt.Errorf("%w: indique hora de inicio y de fin, o ninguna", domain.ErrInvalidRestriction)
	}
	if dto.StartTime != nil {
		if !clockPattern.MatchString(*dto.StartTime) || !clockPattern.MatchString(*dto.EndTime) || *dto.StartTime >= *dto.EndTime {
			return nil, fmt.Errorf("%w: rango de horas inválido", domain.ErrInvalidRestriction)
		}
	}

	if _, err := uc.commonAreaRepo.GetCommonAreaByID(ctx, dto.CommonAreaID); err != nil {
		return nil, err
	}

	created, err := uc.restrictionRepo.CreateRestriction(ctx, &domain.CommonAreaRestriction{
		CommonAreaID:    dto.CommonAreaID,
		RestrictionType: dto.RestrictionType,
		StartDate:       dto.StartDate,
		EndDate:         dto.EndDate,
		StartTime:       dto.StartTime,
		EndTime:         dto.EndTime,
		Reason:          dto.Reason,
		CreatedByUserID: dto.CreatedByUserID,
		IsActive:        true,
	})
	if err != nil {
		return nil, err
	}
	uc.logger.Info(ctx).Uint("common_area_id", dto.CommonAreaID).Uint("restriction_id", created.ID).Msg("Restricción creada")
	return created, nil
}

// DeleteRestriction elimina un bloqueo de la zona indicada
func (uc *commonAreaUseCase) DeleteRestriction(ctx context.Context, commonAreaID uint, restrictionID uint) error {
	ctx = log.WithFunctionCtx(ctx, "DeleteRestriction")

	restriction, err := uc.restrictionRepo.GetRestrictionByID(ctx, restrictionID)
	if err != nil {
		return err
	}
	if restriction.CommonAreaID != commonAreaID {
		return domain.ErrRestrictionNotFound
	}
	return uc.restrictionRepo.DeleteRestriction(ctx, restrictionID)
}
