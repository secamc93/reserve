package mapper

import (
	"central_reserve/services/rooms/internal/domain"
	"central_reserve/services/rooms/internal/infra/primary/controllers/roomhandler/request"
)

// RoomToDomain convierte un request.Room a entities.Room
func RoomToDomain(r request.Room) domain.Room {
	return domain.Room{
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
func UpdateRoomToDomain(r request.UpdateRoom) domain.Room {
	return domain.Room{
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
