package app

import (
	"context"

	"central_reserve/services/horizontalproperty/membership/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/membership/internal/domain/errors"
	"central_reserve/shared/log"
)

// Grant activa una membresía sin pasarela: pagada por fuera (manual) o regalada (cortesía). Con el
// plan CUSTOM el super admin fija el tope de propiedades (acuerdos de más de 20 conjuntos).
func (u *useCase) Grant(ctx context.Context, req dtos.GrantRequest) (*entities.Membership, error) {
	ctx = log.WithFunctionCtx(ctx, "Grant")
	if req.Source != entities.SourceManual && req.Source != entities.SourceCourtesy {
		return nil, domainerrors.ErrInvalidSource
	}
	maxProps := req.MaxProperties
	if req.PlanCode != entities.PlanCustom {
		plan, ok := entities.PlanByCode(req.PlanCode)
		if !ok {
			return nil, domainerrors.ErrPlanNotFound
		}
		maxProps = plan.MaxProperties
	}
	ids := entities.UniqueIDs(req.BusinessIDs)
	if len(ids) == 0 || maxProps < len(ids) {
		return nil, domainerrors.ErrInvalidProperties
	}
	start, end := entities.Period(u.now())
	m, err := u.repo.CreateActive(ctx, &entities.Membership{
		PlanCode: req.PlanCode, MaxProperties: maxProps, OwnerUserID: req.OwnerUserID, Status: entities.MembershipActive,
		Source: req.Source, StartsAt: &start, EndsAt: &end, Notes: req.Notes, CreatedByUserID: req.ByUserID, BusinessIDs: ids,
	})
	if err != nil {
		return nil, err
	}
	u.logger.Info(ctx).Str("plan", req.PlanCode).Str("source", req.Source).Int("properties", len(ids)).Msg("Membresía otorgada")
	return m, nil
}
