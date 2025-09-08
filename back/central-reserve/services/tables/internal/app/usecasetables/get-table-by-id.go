package usecasetables

import (
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// GetTableByID obtiene una mesa por su ID
func (u *TableUseCase) GetTableByID(ctx context.Context, id uint) (*entities.Table, error) {
	table, err := u.repository.GetTableByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("error al obtener mesa: %w", err)
	}
	return table, nil
}
