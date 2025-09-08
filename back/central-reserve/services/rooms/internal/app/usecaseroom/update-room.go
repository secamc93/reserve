package usecaseroom

import (
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
	"strings"
)

// UpdateRoom actualiza una sala existente
func (uc *RoomUseCase) UpdateRoom(ctx context.Context, id uint, room entities.Room) (string, error) {
	if id == 0 {
		return "", fmt.Errorf("el ID de la sala es requerido")
	}

	// Validaciones básicas
	if strings.TrimSpace(room.Name) == "" {
		return "", fmt.Errorf("el nombre de la sala es requerido")
	}

	if strings.TrimSpace(room.Code) == "" {
		return "", fmt.Errorf("el código de la sala es requerido")
	}

	if room.BusinessID == 0 {
		return "", fmt.Errorf("el ID del negocio es requerido")
	}

	if room.Capacity <= 0 {
		return "", fmt.Errorf("la capacidad debe ser mayor a 0")
	}

	if room.MinCapacity < 1 {
		room.MinCapacity = 1
	}

	if room.MaxCapacity > 0 && room.MaxCapacity < room.MinCapacity {
		return "", fmt.Errorf("la capacidad máxima debe ser mayor o igual a la capacidad mínima")
	}

	// Verificar que la sala existe
	existingRoom, err := uc.repository.GetRoomByID(ctx, id)
	if err != nil {
		return "", fmt.Errorf("error al verificar existencia de la sala: %w", err)
	}

	if existingRoom == nil {
		return "", fmt.Errorf("la sala con ID %d no existe", id)
	}

	// Verificar si ya existe otra sala con el mismo código en el mismo negocio
	roomWithSameCode, err := uc.repository.GetRoomByCodeAndBusiness(ctx, room.Code, room.BusinessID)
	if err == nil && roomWithSameCode != nil && roomWithSameCode.ID != id {
		return "", fmt.Errorf("ya existe otra sala con el código %s en este negocio", room.Code)
	}

	// Actualizar la sala
	result, err := uc.repository.UpdateRoom(ctx, id, room)
	if err != nil {
		return "", fmt.Errorf("error al actualizar sala: %w", err)
	}

	return result, nil
}
