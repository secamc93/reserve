package domain

import "context"

type IHolaMundo interface {
	HolaMundo() string
	CreateReserve(ctx context.Context, reserve Reservation) (string, error)
}
