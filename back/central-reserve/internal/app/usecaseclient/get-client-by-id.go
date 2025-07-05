package usecaseclient

import (
	"central_reserve/internal/domain"
	"context"
)

func (u *ClientUseCase) GetClientByID(ctx context.Context, id uint) (*domain.Client, error) {
	response, err := u.repository.GetClientByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return response, nil
}

func (u *ClientUseCase) GetClientByDni(ctx context.Context, dni uint) (*domain.Client, error) {
	return u.repository.GetClientByDni(ctx, dni)
}
