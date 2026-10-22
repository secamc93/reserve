package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/shared/log"
)

// RegisterManualPayment registra como aprobado el pago de los días pendientes de un grupo recibido
// por fuera de la pasarela (p. ej. una transferencia). Lo usa el super admin.
func (u *useCase) RegisterManualPayment(ctx context.Context, req dtos.ManualPaymentRequest) (*entities.Payment, error) {
	ctx = log.WithFunctionCtx(ctx, "RegisterManualPayment")

	group, err := u.ownedGroup(ctx, req.BusinessID, req.VotingGroupID)
	if err != nil {
		return nil, err
	}
	st, err := u.status(ctx, group)
	if err != nil {
		return nil, err
	}
	if st.Paid {
		return nil, domainerrors.ErrNothingDue
	}

	now := u.now()
	payment, err := u.repo.CreatePayment(ctx, &entities.Payment{
		BusinessID:      group.BusinessID,
		VotingGroupID:   group.ID,
		Reference:       fmt.Sprintf("MANUAL-%d-%d", group.ID, now.UnixNano()),
		Provider:        entities.ProviderManual,
		Days:            st.DueDays,
		AmountInCents:   st.AmountDueInCents,
		Currency:        currencyCOP,
		Status:          entities.StatusApproved,
		PaidAt:          &now,
		CreatedByUserID: req.UserID,
		Notes:           req.Notes,
	})
	if err != nil {
		return nil, err
	}
	u.logger.Info(ctx).Uint("voting_group_id", group.ID).Int("days", payment.Days).Msg("Pago manual de días de votación registrado")
	return payment, nil
}
