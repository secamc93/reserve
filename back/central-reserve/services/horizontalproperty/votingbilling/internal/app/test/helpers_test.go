package app_test

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/app"
	"central_reserve/services/horizontalproperty/votingbilling/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/ports"
)

const (
	businessID = uint(7)
	groupID    = uint(42)
	price      = int64(50000)
)

var cot = time.FixedZone("COT", -5*60*60)

// group crea un grupo de la propiedad 7 que dura `days` días calendario (hora de Colombia).
func group(days int) *entities.VotingGroup {
	start := time.Date(2026, 3, 14, 8, 0, 0, 0, cot)
	return &entities.VotingGroup{
		ID:              groupID,
		BusinessID:      businessID,
		Name:            "Asamblea ordinaria 2026",
		VotingStartDate: start,
		VotingEndDate:   start.AddDate(0, 0, days-1).Add(10 * time.Hour),
	}
}

// repoWith arma un repositorio con el grupo, la exención y los días ya pagados.
func repoWith(g *entities.VotingGroup, exempt bool, paidDays int) *mocks.RepositoryMock {
	return &mocks.RepositoryMock{
		GetVotingGroupFn:  func(context.Context, uint) (*entities.VotingGroup, error) { return g, nil },
		IsExemptFn:        func(context.Context, uint) (bool, error) { return exempt, nil },
		SumApprovedDaysFn: func(context.Context, uint) (int, error) { return paidDays, nil },
	}
}

func enabledGateway() *mocks.GatewayMock {
	return &mocks.GatewayMock{
		EnabledFn:     func() bool { return true },
		CheckoutURLFn: func(p dtos.CheckoutParams) (string, error) { return "https://checkout.wompi.co/p/?reference=" + p.Reference, nil },
	}
}

func newUseCase(repo ports.IRepository, gw ports.IPaymentGateway) ports.IUseCase {
	return app.New(repo, gw, price, &mocks.MockLogger{})
}

func newUseCaseWithPrice(repo ports.IRepository, pricePerDay int64) ports.IUseCase {
	return app.New(repo, &mocks.GatewayMock{}, pricePerDay, &mocks.MockLogger{})
}
