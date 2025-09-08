package domain

import "context"

// IClientRepository define las operaciones para clientes
type IClientRepository interface {
	GetClients(ctx context.Context) ([]entities.Client, error)
	GetClientByID(ctx context.Context, id uint) (*entities.Client, error)
	GetClientByEmail(ctx context.Context, email string) (*entities.Client, error)
	GetClientByEmailAndBusiness(ctx context.Context, email string, businessID uint) (*entities.Client, error)
	CreateClient(ctx context.Context, client entities.Client) (string, error)
	UpdateClient(ctx context.Context, id uint, client entities.Client) (string, error)
	DeleteClient(ctx context.Context, id uint) (string, error)
}
