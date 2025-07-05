package usecasetables

import (
	"central_reserve/internal/domain"
	"context"
)

func (u *TableUseCase) UpdateTable(ctx context.Context, id uint, table domain.Table) (string, error) {
	response, err := u.repository.UpdateTable(ctx, id, table)
	if err != nil {
		return "", err
	}
	return response, nil
}
