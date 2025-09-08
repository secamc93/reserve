package usecaseclient

import (
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// CreateClient crea un nuevo cliente
func (u *ClientUseCase) CreateClient(ctx context.Context, client entities.Client) (string, error) {
	// Validar que el cliente tenga los campos requeridos
	if client.Name == "" {
		return "", fmt.Errorf("el nombre del cliente es requerido")
	}

	if client.Email == "" {
		return "", fmt.Errorf("el email del cliente es requerido")
	}

	// Verificar si ya existe un cliente con el mismo email
	existingClient, err := u.repository.GetClientByEmail(ctx, client.Email)
	if err == nil && existingClient != nil {
		return "", fmt.Errorf("ya existe un cliente con el email %s", client.Email)
	}

	// Crear el cliente
	result, err := u.repository.CreateClient(ctx, client)
	if err != nil {
		return "", fmt.Errorf("error al crear cliente: %w", err)
	}

	return result, nil
}
