package usecasetables

import (
	"central_reserve/internal/domain"
	"context"
)

func (u *TableUseCase) GetTables(ctx context.Context) ([]domain.Table, error) {
	response, err := u.repository.GetTables(ctx)
	if err != nil {
		return nil, err
	}
	return response, nil
}
