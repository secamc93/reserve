package usecasetables

import (
	"central_reserve/internal/domain/entities"
	"context"
)

// GetTables obtiene todas las mesas
func (u *TableUseCase) GetTables(ctx context.Context) ([]entities.Table, error) {
	tables, err := u.repository.GetTables(ctx)
	if err != nil {
		return nil, err
	}
	return tables, nil
}
