package usecaseclient

import (
	"central_reserve/services/customer/internal/domain"
	"context"
)

// GetClients obtiene todos los clientes
func (u *ClientUseCase) GetClients(ctx context.Context) ([]domain.Client, error) {
	clients, err := u.repository.GetClients(ctx)
	if err != nil {
		return nil, err
	}
	return clients, nil
}
