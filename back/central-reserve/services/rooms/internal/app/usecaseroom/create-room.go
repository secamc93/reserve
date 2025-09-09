package usecaseroom

import (
	"central_reserve/services/rooms/internal/domain"
	"context"
	"fmt"
	"strings"
)

// CreateRoom crea una nueva sala
func (uc *RoomUseCase) CreateRoom(ctx context.Context, room domain.Room) (string, error) {
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

	// Verificar si ya existe una sala con el mismo código en el mismo negocio
	existingRoom, err := uc.repository.GetRoomByCodeAndBusiness(ctx, room.Code, room.BusinessID)
	if err == nil && existingRoom != nil {
		return "", fmt.Errorf("ya existe una sala con el código %s en este negocio", room.Code)
	}

	// Crear la sala
	result, err := uc.repository.CreateRoom(ctx, room)
	if err != nil {
		return "", fmt.Errorf("error al crear sala: %w", err)
	}

	return result, nil
}
