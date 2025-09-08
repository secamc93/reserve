package usecasetables

import (
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// UpdateTable actualiza una mesa existente
func (u *TableUseCase) UpdateTable(ctx context.Context, id uint, table entities.Table) (string, error) {
	// Verificar que la mesa existe
	existingTable, err := u.repository.GetTableByID(ctx, id)
	if err != nil {
		return "", fmt.Errorf("mesa no encontrada: %w", err)
	}

	if existingTable == nil {
		return "", fmt.Errorf("mesa no encontrada")
	}

	// Actualizar la mesa
	result, err := u.repository.UpdateTable(ctx, id, table)
	if err != nil {
		return "", fmt.Errorf("error al actualizar mesa: %w", err)
	}

	return result, nil
}
