package response

import "central_reserve/services/horizontalproperty/internal/domain"

type SuccessResponse[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error"`
}

type VotingGroupSuccess = SuccessResponse[domain.VotingGroupDTO]
type VotingGroupsSuccess = SuccessResponse[[]domain.VotingGroupDTO]
type VotingSuccess = SuccessResponse[domain.VotingDTO]
type VotingsSuccess = SuccessResponse[[]domain.VotingDTO]
type VotingOptionSuccess = SuccessResponse[domain.VotingOptionDTO]
type VotingOptionsSuccess = SuccessResponse[[]domain.VotingOptionDTO]
type VoteSuccess = SuccessResponse[domain.VoteDTO]
