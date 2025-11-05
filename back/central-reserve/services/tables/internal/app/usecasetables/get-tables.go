package usecasetables

import (
	"central_reserve/services/tables/internal/domain"
	"context"
)

// GetTables obtiene todas las mesas
func (u *TableUseCase) GetTables(ctx context.Context) ([]domain.Table, error) {
	tables, err := u.repository.GetTables(ctx)
	if err != nil {
		return nil, err
	}
	return tables, nil
}
