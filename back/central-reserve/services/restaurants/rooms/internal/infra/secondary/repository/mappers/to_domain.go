package mappers

import (
	"central_reserve/services/restaurants/rooms/internal/domain"
	"central_reserve/services/restaurants/rooms/internal/infra/secondary/models"
)

// RoomToDomain convierte un modelo de persistencia a entidad de dominio
func RoomToDomain(m *models.RoomModel) *domain.Room {
	if m == nil {
		return nil
	}

	return &domain.Room{
		ID:          m.ID,
		BusinessID:  m.BusinessID,
		Name:        m.Name,
		Code:        m.Code,
		Description: m.Description,
		Capacity:    m.Capacity,
		IsActive:    m.IsActive,
		MinCapacity: m.MinCapacity,
		MaxCapacity: m.MaxCapacity,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
		DeletedAt:   m.DeletedAt,
	}
}

// RoomsToDomain convierte un slice de modelos a slice de entidades de dominio
func RoomsToDomain(models []*models.RoomModel) []*domain.Room {
	rooms := make([]*domain.Room, 0, len(models))
	for _, m := range models {
		rooms = append(rooms, RoomToDomain(m))
	}
	return rooms
}
