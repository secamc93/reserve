package usecasetables

import (
	"central_reserve/internal/domain"
	"context"
)

func (u *TableUseCase) GetTableByID(ctx context.Context, id uint) (*domain.Table, error) {
	response, err := u.repository.GetTableByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return response, nil
}
