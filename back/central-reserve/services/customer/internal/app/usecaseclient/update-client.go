package usecaseclient

import (
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// UpdateClient actualiza un cliente existente
func (u *ClientUseCase) UpdateClient(ctx context.Context, id uint, client entities.Client) (string, error) {
	// Verificar que el cliente existe
	existingClient, err := u.repository.GetClientByID(ctx, id)
	if err != nil {
		return "", fmt.Errorf("cliente no encontrado: %w", err)
	}

	if existingClient == nil {
		return "", fmt.Errorf("cliente no encontrado")
	}

	// Actualizar el cliente
	result, err := u.repository.UpdateClient(ctx, id, client)
	if err != nil {
		return "", fmt.Errorf("error al actualizar cliente: %w", err)
	}

	return result, nil
}
