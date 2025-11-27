package usecaseroom

import (
	"context"
	"fmt"
)

// DeleteRoom elimina una sala
func (uc *RoomUseCase) DeleteRoom(ctx context.Context, id uint) (string, error) {
	if id == 0 {
		return "", fmt.Errorf("el ID de la sala es requerido")
	}

	// Verificar que la sala existe
	existingRoom, err := uc.repository.GetRoomByID(ctx, id)
	if err != nil {
		return "", fmt.Errorf("error al verificar existencia de la sala: %w", err)
	}

	if existingRoom == nil {
		return "", fmt.Errorf("la sala con ID %d no existe", id)
	}

	// Eliminar la sala
	result, err := uc.repository.DeleteRoom(ctx, id)
	if err != nil {
		return "", fmt.Errorf("error al eliminar sala: %w", err)
	}

	return result, nil
}
