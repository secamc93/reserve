package usecaseclient

import (
	"central_reserve/internal/domain"
	"context"
)

func (u *ClientUseCase) UpdateClient(ctx context.Context, id uint, client domain.Client) (string, error) {
	response, err := u.repository.UpdateClient(ctx, id, client)
	if err != nil {
		return "", err
	}
	return response, nil
}
