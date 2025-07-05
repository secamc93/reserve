package mapper

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/infra/primary/http2/handlers/clienthandler/request"
)

func ClientToDomain(c request.Client) domain.Client {
	return domain.Client{
		RestaurantID: c.RestaurantID,
		Name:         c.Name,
		Email:        c.Email,
		Phone:        c.Phone,
	}
}
