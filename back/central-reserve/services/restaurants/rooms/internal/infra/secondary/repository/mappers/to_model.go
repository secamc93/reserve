package mappers

import (
	"central_reserve/services/restaurants/rooms/internal/domain"
	"central_reserve/services/restaurants/rooms/internal/infra/secondary/models"
)

// RoomToModel convierte una entidad de dominio a modelo de persistencia
func RoomToModel(r *domain.Room) *models.RoomModel {
	if r == nil {
		return nil
	}

	return &models.RoomModel{
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
