package mapper

import (
	"central_reserve/services/restaurants/rooms/internal/domain"
	"central_reserve/services/restaurants/rooms/internal/infra/primary/controllers/roomhandler/request"
	"central_reserve/services/restaurants/rooms/internal/infra/primary/controllers/roomhandler/response"
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

// RoomToResponse convierte una entidad de dominio a response
func RoomToResponse(r domain.Room) response.RoomResponse {
	return response.RoomResponse{
		ID:          r.ID,
		BusinessID:  r.BusinessID,
		Name:        r.Name,
		Code:        r.Code,
		Description: r.Description,
		Capacity:    r.Capacity,
		IsActive:    r.IsActive,
		MinCapacity: r.MinCapacity,
		MaxCapacity: r.MaxCapacity,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
		DeletedAt:   r.DeletedAt,
	}
}

// RoomPtrToResponse convierte un puntero a entidad de dominio a response
func RoomPtrToResponse(r *domain.Room) response.RoomResponse {
	if r == nil {
		return response.RoomResponse{}
	}
	return RoomToResponse(*r)
}

// RoomsToResponse convierte un slice de entidades de dominio a slice de responses
func RoomsToResponse(rooms []domain.Room) []response.RoomResponse {
	responses := make([]response.RoomResponse, len(rooms))
	for i, room := range rooms {
		responses[i] = RoomToResponse(room)
	}
	return responses
}
