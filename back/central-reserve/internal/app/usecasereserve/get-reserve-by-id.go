package usecasereserve

import (
	"central_reserve/internal/domain"
	"context"
)

func (u *ReserveUseCase) GetReserveByID(ctx context.Context, id uint) (*domain.ReserveDetailDTO, error) {
	reserve, err := u.repository.GetReserveByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return reserve, nil
}
