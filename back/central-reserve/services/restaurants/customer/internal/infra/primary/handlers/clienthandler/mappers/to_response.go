package mappers

import (
	"central_reserve/services/restaurants/customer/internal/domain"
	"central_reserve/services/restaurants/customer/internal/infra/primary/handlers/clienthandler/response"
)

// ClientToResponse convierte entidad de dominio a DTO de respuesta
func ClientToResponse(client *domain.Client) response.ClientData {
	return response.ClientData{
		ID:         client.ID,
		BusinessID: client.BusinessID,
		Name:       client.Name,
		Email:      client.Email,
		Phone:      client.Phone,
		Dni:        client.Dni,
		CreatedAt:  client.CreatedAt,
		UpdatedAt:  client.UpdatedAt,
	}
}

// ClientsToResponse convierte lista de entidades a DTOs de respuesta
func ClientsToResponse(clients []domain.Client) []response.ClientData {
	result := make([]response.ClientData, len(clients))
	for i := range clients {
		result[i] = ClientToResponse(&clients[i])
	}
	return result
}
