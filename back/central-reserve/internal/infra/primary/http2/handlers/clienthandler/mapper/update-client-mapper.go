package mapper

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/infra/primary/http2/handlers/clienthandler/request"
)

func UpdateClientToDomain(u request.UpdateClient) domain.Client {
	client := domain.Client{}

	if u.RestaurantID != nil {
		client.RestaurantID = *u.RestaurantID
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
