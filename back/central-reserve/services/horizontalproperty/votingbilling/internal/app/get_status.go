package app

import (
	"context"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
)

// GetStatus devuelve cuántos días de votación debe un grupo de la propiedad y cuánto ha pagado.
func (u *useCase) GetStatus(ctx context.Context, businessID, groupID uint) (*dtos.BillingStatus, error) {
	group, err := u.ownedGroup(ctx, businessID, groupID)
	if err != nil {
		return nil, err
	}
	return u.status(ctx, group)
}

// ownedGroup trae el grupo solo si es de la propiedad; uno ajeno se trata como inexistente.
func (u *useCase) ownedGroup(ctx context.Context, businessID, groupID uint) (*entities.VotingGroup, error) {
	group, err := u.repo.GetVotingGroup(ctx, groupID)
	if err != nil {
		return nil, err
	}
	if group == nil || group.BusinessID != businessID {
		return nil, domainerrors.ErrVotingGroupNotFound
	}
	return group, nil
}

func (u *useCase) status(ctx context.Context, group *entities.VotingGroup) (*dtos.BillingStatus, error) {
	exempt, err := u.repo.IsExempt(ctx, group.BusinessID)
	if err != nil {
		return nil, err
	}
	paidDays, err := u.repo.SumApprovedDays(ctx, group.ID)
	if err != nil {
		return nil, err
	}
	payments, err := u.repo.ListPaymentsByGroup(ctx, group.ID)
	if err != nil {
		return nil, err
	}

	required := entities.VotingDays(group.VotingStartDate, group.VotingEndDate)
	due := required - paidDays
	if due < 0 || exempt {
		due = 0
	}
	return &dtos.BillingStatus{
		VotingGroupID:    group.ID,
		BusinessID:       group.BusinessID,
		RequiredDays:     required,
		PaidDays:         paidDays,
		DueDays:          due,
		PricePerDayCOP:   u.pricePerDayCOP,
		AmountDueInCents: int64(due) * u.pricePerDayCOP * 100,
		Exempt:           exempt,
		Paid:             due == 0,
		GatewayEnabled:   u.gateway.Enabled(),
		Payments:         payments,
	}, nil
}
