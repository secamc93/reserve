package usecaseclient

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/pkg/log"
	"context"
)

type IUseCaseClient interface {
	GetClients(ctx context.Context) ([]domain.Client, error)
	GetClientByID(ctx context.Context, id uint) (*domain.Client, error)
	CreateClient(ctx context.Context, client domain.Client) (string, error)
	UpdateClient(ctx context.Context, id uint, client domain.Client) (string, error)
	DeleteClient(ctx context.Context, id uint) (string, error)
}

type ClientUseCase struct {
	repository domain.IHolaMundo
	log        log.ILogger
}

func NewClientUseCase(repository domain.IHolaMundo, log log.ILogger) IUseCaseClient {
	return &ClientUseCase{
		repository: repository,
		log:        log,
	}
}
