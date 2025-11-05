package domain

import "context"

// IClientRepository define las operaciones para clientes
type IClientRepository interface {
	GetClients(ctx context.Context) ([]Client, error)
	GetClientByID(ctx context.Context, id uint) (*Client, error)
	GetClientByEmail(ctx context.Context, email string) (*Client, error)
	GetClientByEmailAndBusiness(ctx context.Context, email string, businessID uint) (*Client, error)
	CreateClient(ctx context.Context, client Client) (string, error)
	UpdateClient(ctx context.Context, id uint, client Client) (string, error)
	DeleteClient(ctx context.Context, id uint) (string, error)
}
