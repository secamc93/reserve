package mapper

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/primary/http2/handlers/roomhandler/request"
)

// RoomToDomain convierte un request.Room a entities.Room
func RoomToDomain(r request.Room) entities.Room {
	return entities.Room{
		BusinessID:  r.BusinessID,
		Name:        r.Name,
		Code:        r.Code,
		Description: r.Description,
		Capacity:    r.Capacity,
		MinCapacity: r.MinCapacity,
		MaxCapacity: r.MaxCapacity,
		IsActive:    r.IsActive,
	}
}

// UpdateRoomToDomain convierte un request.UpdateRoom a entities.Room
func UpdateRoomToDomain(r request.UpdateRoom) entities.Room {
	return entities.Room{
		BusinessID:  r.BusinessID,
		Name:        r.Name,
		Code:        r.Code,
		Description: r.Description,
		Capacity:    r.Capacity,
		MinCapacity: r.MinCapacity,
		MaxCapacity: r.MaxCapacity,
		IsActive:    r.IsActive,
	}
}
