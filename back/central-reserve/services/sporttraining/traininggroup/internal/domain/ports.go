package domain

import "context"

// GroupRepository - Puerto para repositorio de grupos de entrenamiento
type GroupRepository interface {
	Create(ctx context.Context, group *TrainingGroup) (*TrainingGroup, error)
	GetByID(ctx context.Context, id uint, businessID uint) (*TrainingGroup, error)
	Update(ctx context.Context, group *TrainingGroup) (*TrainingGroup, error)
	List(ctx context.Context, filters GroupFiltersDTO) (*PaginatedGroupsDTO, error)
	AddPlayer(ctx context.Context, dto AddPlayerDTO) error
	RemovePlayer(ctx context.Context, groupID uint, playerID uint, businessID uint) error
	GetGroupPlayers(ctx context.Context, groupID uint, businessID uint) ([]GroupPlayerDTO, error)
}

// GroupUseCase - Puerto para casos de uso de grupos de entrenamiento
type GroupUseCase interface {
	CreateGroup(ctx context.Context, dto CreateGroupDTO) (*TrainingGroup, error)
	GetGroupByID(ctx context.Context, id uint, businessID uint) (*TrainingGroup, error)
	UpdateGroup(ctx context.Context, dto UpdateGroupDTO) (*TrainingGroup, error)
	ListGroups(ctx context.Context, filters GroupFiltersDTO) (*PaginatedGroupsDTO, error)
	AddPlayerToGroup(ctx context.Context, dto AddPlayerDTO) error
	RemovePlayerFromGroup(ctx context.Context, groupID uint, playerID uint, businessID uint) error
	GetGroupPlayers(ctx context.Context, groupID uint, businessID uint) ([]GroupPlayerDTO, error)
}
