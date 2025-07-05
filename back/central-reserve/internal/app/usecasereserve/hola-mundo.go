package usecasereserve

import (
	"context"
)

func (u *ReserveUseCase) HolaMundo(ctx context.Context) (string, error) {
	return u.repository.HolaMundo(), nil
}
