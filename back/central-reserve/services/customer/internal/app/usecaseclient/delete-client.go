package usecaseclient

import (
	"context"
)

func (u *ClientUseCase) DeleteClient(ctx context.Context, id uint) (string, error) {
	response, err := u.repository.DeleteClient(ctx, id)
	if err != nil {
		return "", err
	}
	return response, nil
}
