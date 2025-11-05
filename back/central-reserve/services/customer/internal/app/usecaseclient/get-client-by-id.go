package usecaseclient

import (
	"central_reserve/services/customer/internal/domain"
	"context"
	"fmt"
)

// GetClientByID obtiene un cliente por su ID
func (u *ClientUseCase) GetClientByID(ctx context.Context, id uint) (*domain.Client, error) {
	client, err := u.repository.GetClientByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("error al obtener cliente: %w", err)
	}
	return client, nil
}

// GetClientByEmail obtiene un cliente por su email
func (u *ClientUseCase) GetClientByEmail(ctx context.Context, email string) (*domain.Client, error) {
	client, err := u.repository.GetClientByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("error al obtener cliente por email: %w", err)
	}
	return client, nil
}
