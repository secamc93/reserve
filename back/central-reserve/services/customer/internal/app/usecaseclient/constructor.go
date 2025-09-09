package usecaseclient

import (
	"central_reserve/services/customer/internal/domain"
	"context"
)

type IUseCaseClient interface {
	GetClients(ctx context.Context) ([]domain.Customer, error)
	GetClientByID(ctx context.Context, id uint) (*domain.Client, error)
	CreateClient(ctx context.Context, client domain.Client) (string, error)
	UpdateClient(ctx context.Context, id uint, client domain.Client) (string, error)
	DeleteClient(ctx context.Context, id uint) (string, error)
}

type ClientUseCase struct {
	repository domain.IClientRepository
}

func NewClientUseCase(repository domain.IClientRepository) *ClientUseCase {
	return &ClientUseCase{
		repository: repository,
	}
}
