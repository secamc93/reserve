package app

import (
	"context"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/shared/log"
)

// GrantDays registra fechas pagadas por fuera de la pasarela (manual, con su valor) o regaladas
// (cortesía, valor 0). Las fechas ya compradas se ignoran. Lo usa el super admin.
func (u *useCase) GrantDays(ctx context.Context, req dtos.GrantDaysRequest) (*entities.DayPayment, error) {
	ctx = log.WithFunctionCtx(ctx, "GrantDays")
	if req.Source != entities.SourceManual && req.Source != entities.SourceCourtesy {
		return nil, domainerrors.ErrInvalidSource
	}
	dates, ok := validFutureDates(req.Dates, req.Now)
	if !ok {
		return nil, domainerrors.ErrInvalidDates
	}
	cov, _, err := u.loadCoverage(ctx, req.BusinessID, req.Now)
	if err != nil {
		return nil, err
	}
	var newDates []string
	for _, d := range dates {
		if !cov.purchased[d] {
			newDates = append(newDates, d)
		}
	}
	if len(newDates) == 0 {
		return nil, domainerrors.ErrNothingDue
	}

	amount := int64(0)
	if req.Source == entities.SourceManual {
		amount = int64(len(newDates)) * u.pricePerDayCOP * 100
	}
	now := u.now()
	payment, err := u.repo.CreateGrantedDays(ctx, &entities.DayPayment{
		BusinessID:      req.BusinessID,
		Reference:       fmt.Sprintf("%s-%d-%d", strings.ToUpper(req.Source), req.BusinessID, now.UnixNano()),
		Source:          req.Source,
		Dates:           newDates,
		AmountInCents:   amount,
		Currency:        currencyCOP,
		Status:          entities.StatusApproved,
		PaidAt:          &now,
		CreatedByUserID: req.UserID,
		Notes:           req.Notes,
	})
	if err != nil {
		return nil, err
	}
	u.logger.Info(ctx).Uint("business_id", req.BusinessID).Str("source", req.Source).Strs("dates", newDates).Msg("Días de votación otorgados")
	return payment, nil
}
