package usecasetables

import (
	"central_reserve/services/tables/internal/domain"
	"context"
	"fmt"
)

// GetTableByID obtiene una mesa por su ID
func (u *TableUseCase) GetTableByID(ctx context.Context, id uint) (*domain.Table, error) {
	table, err := u.repository.GetTableByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("error al obtener mesa: %w", err)
	}
	return table, nil
}
