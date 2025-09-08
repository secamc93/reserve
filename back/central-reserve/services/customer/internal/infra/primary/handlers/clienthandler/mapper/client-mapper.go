package mapper

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/primary/http2/handlers/clienthandler/request"
)

// ClientToDomain convierte un request.Client a entities.Client
func ClientToDomain(c request.Client) entities.Client {
	return entities.Client{
		BusinessID: c.BusinessID,
		Name:       c.Name,
		Email:      c.Email,
		Phone:      c.Phone,
	}
}
