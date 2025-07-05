package usecaseclient

import (
	"central_reserve/internal/domain"
	"context"
)

func (u *ClientUseCase) CreateClient(ctx context.Context, client domain.Client) (string, error) {
	response, err := u.repository.CreateClient(ctx, client)
	if err != nil {
		return "", err
	}
	return response, nil
}
