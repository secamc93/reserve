package usecasecredentials

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// ListCredentials ver ICredentialsUseCase. page/pageSize ya vienen validados (1..200).
func (uc *CredentialsUseCase) ListCredentials(ctx context.Context, groupID uint, page, pageSize int) (*domain.PaginatedVotingCredentialsDTO, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	if pageSize > 200 {
		pageSize = 200
	}
	items, total, err := uc.repo.ListVotingCredentials(ctx, groupID, page, pageSize)
	if err != nil {
		return nil, err
	}
	totalPages := int(total) / pageSize
	if int(total)%pageSize != 0 {
		totalPages++
	}
	return &domain.PaginatedVotingCredentialsDTO{
		Credentials: items,
		Total:       total,
		Page:        page,
		PageSize:    pageSize,
		TotalPages:  totalPages,
	}, nil
}
