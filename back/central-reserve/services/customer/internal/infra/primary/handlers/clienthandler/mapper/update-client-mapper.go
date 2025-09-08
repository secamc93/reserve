package mapper

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/primary/http2/handlers/clienthandler/request"
)

// UpdateClientToDomain convierte un request.UpdateClient a entities.Client
func UpdateClientToDomain(u request.UpdateClient) entities.Client {
	client := entities.Client{}

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
