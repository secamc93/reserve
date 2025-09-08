package usecaseclient

import (
	"central_reserve/internal/domain/entities"
	"context"
)

// GetClients obtiene todos los clientes
func (u *ClientUseCase) GetClients(ctx context.Context) ([]entities.Client, error) {
	clients, err := u.repository.GetClients(ctx)
	if err != nil {
		return nil, err
	}
	return clients, nil
}
