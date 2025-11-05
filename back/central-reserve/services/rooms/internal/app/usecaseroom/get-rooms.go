package usecaseroom

import (
	"central_reserve/services/rooms/internal/domain"
	"context"
	"fmt"
)

// GetRooms obtiene todas las salas
func (uc *RoomUseCase) GetRooms(ctx context.Context) ([]domain.Room, error) {
	rooms, err := uc.repository.GetRooms(ctx)
	if err != nil {
		return nil, fmt.Errorf("error al obtener salas: %w", err)
	}
	return rooms, nil
}

// GetRoomsByBusinessID obtiene todas las salas de un negocio específico
func (uc *RoomUseCase) GetRoomsByBusinessID(ctx context.Context, businessID uint) ([]domain.Room, error) {
	if businessID == 0 {
		return nil, fmt.Errorf("el ID del negocio es requerido")
	}

	rooms, err := uc.repository.GetRoomsByBusinessID(ctx, businessID)
	if err != nil {
		return nil, fmt.Errorf("error al obtener salas del negocio: %w", err)
	}
	return rooms, nil
}

// GetRoomByID obtiene una sala por su ID
func (uc *RoomUseCase) GetRoomByID(ctx context.Context, id uint) (*domain.Room, error) {
	if id == 0 {
		return nil, fmt.Errorf("el ID de la sala es requerido")
	}

	room, err := uc.repository.GetRoomByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("error al obtener sala por ID: %w", err)
	}
	return room, nil
}

// GetRoomByCodeAndBusiness obtiene una sala por su código y negocio
func (uc *RoomUseCase) GetRoomByCodeAndBusiness(ctx context.Context, code string, businessID uint) (*domain.Room, error) {
	if code == "" {
		return nil, fmt.Errorf("el código de la sala es requerido")
	}

	if businessID == 0 {
		return nil, fmt.Errorf("el ID del negocio es requerido")
	}

	room, err := uc.repository.GetRoomByCodeAndBusiness(ctx, code, businessID)
	if err != nil {
		return nil, fmt.Errorf("error al obtener sala por código y negocio: %w", err)
	}
	return room, nil
}
