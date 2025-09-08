package usecasetables

import (
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// CreateTable crea una nueva mesa
func (u *TableUseCase) CreateTable(ctx context.Context, table entities.Table) (string, error) {
	// Validar que la mesa tenga los campos requeridos
	if table.Number == 0 {
		return "", fmt.Errorf("el número de mesa es requerido")
	}

	if table.Capacity == 0 {
		return "", fmt.Errorf("la capacidad de la mesa es requerida")
	}

	// Crear la mesa
	result, err := u.repository.CreateTable(ctx, table)
	if err != nil {
		return "", fmt.Errorf("error al crear mesa: %w", err)
	}

	return result, nil
}
