package mappers

import (
	"central_reserve/services/restaurants/customer/internal/domain"
	"central_reserve/services/restaurants/customer/internal/infra/primary/handlers/clienthandler/request"
)

// ClientToDomain convierte un request.Client a domain.Client
func ClientToDomain(c request.Client) domain.Client {
	return domain.Client{
		BusinessID: c.BusinessID,
		Name:       c.Name,
		Email:      c.Email,
		Phone:      c.Phone,
	}
}

// UpdateClientToDomain convierte un request.UpdateClient a domain.Client
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
