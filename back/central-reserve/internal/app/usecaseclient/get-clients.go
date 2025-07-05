package usecaseclient

import (
	"central_reserve/internal/domain"
	"context"
)

func (u *ClientUseCase) GetClients(ctx context.Context) ([]domain.Client, error) {
	response, err := u.repository.GetClients(ctx)
	if err != nil {
		return nil, err
	}
	return response, nil
}
