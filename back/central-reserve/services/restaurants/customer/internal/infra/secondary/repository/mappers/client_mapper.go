package mappers

import (
	"central_reserve/services/customer/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// CreateClientModel convierte entities.Client a models.Client
func CreateClientModel(client domain.Client) models.Client {
	return models.Client{
		Model: gorm.Model{
			ID:        client.ID,
			CreatedAt: client.CreatedAt,
			UpdatedAt: client.UpdatedAt,
		},
		Name:       client.Name,
		Email:      client.Email,
		Phone:      client.Phone,
		Dni:        client.Dni,
		BusinessID: client.BusinessID,
	}
}

// ToClientEntity convierte models.Client a entities.Client
func ToClientEntity(client models.Client) domain.Client {
	return domain.Client{
		ID:         client.ID,
		Name:       client.Name,
		Email:      client.Email,
		Phone:      client.Phone,
		Dni:        client.Dni,
		BusinessID: client.BusinessID,
		CreatedAt:  client.CreatedAt,
		UpdatedAt:  client.UpdatedAt,
	}
}

// ToClientEntitySlice convierte []models.Client a []entities.Client
func ToClientEntitySlice(clients []models.Client) []domain.Client {
	var entities []domain.Client
	for _, client := range clients {
		entities = append(entities, ToClientEntity(client))
	}
	return entities
}
