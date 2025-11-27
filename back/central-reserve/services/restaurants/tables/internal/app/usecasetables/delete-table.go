package usecasetables

import (
	"context"
)

func (u *TableUseCase) DeleteTable(ctx context.Context, id uint) (string, error) {
	response, err := u.repository.DeleteTable(ctx, id)
	if err != nil {
		return "", err
	}
	return response, nil
}
