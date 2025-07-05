package usecasetables

import (
	"central_reserve/internal/domain"
	"context"
)

func (u *TableUseCase) CreateTable(ctx context.Context, table domain.Table) (string, error) {
	response, err := u.repository.CreateTable(ctx, table)
	if err != nil {
		return "", err
	}
	return response, nil
}
