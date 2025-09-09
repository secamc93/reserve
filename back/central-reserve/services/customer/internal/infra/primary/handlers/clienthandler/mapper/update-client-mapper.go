package mapper

import (
	"central_reserve/services/customer/internal/domain"
	"central_reserve/services/customer/internal/infra/primary/handlers/clienthandler/request"
)

// UpdateClientToDomain convierte un request.UpdateClient a entities.Client
func UpdateClientToDomain(u request.UpdateClient) domain.Client {
	client := domain.Client{}

	if u.BusinessID != nil {
		client.BusinessID = *u.BusinessID
	}
	if u.Name != nil {
		client.Name = *u.Name
	}
	if u.Email != nil {
		client.Email = *u.Email
	}
	if u.Phone != nil {
		client.Phone = *u.Phone
	}

	return client
}
