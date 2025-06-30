package mapper

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/infra/primary/http2/handlers/holamundohandler/request"
)

func ReserveToDomain(r request.Reservation) domain.Reservation {
	return domain.Reservation{
		RestaurantID:   r.RestaurantID,
		TableID:        r.TableID,
		ClientID:       r.ClientID,
		StartAt:        r.StartAt,
		EndAt:          r.EndAt,
		NumberOfGuests: r.NumberOfGuests,
		Status:         "pending",
	}
}
