package domain

import "context"

// PlayerRepository - Puerto para repositorio de jugadores
type PlayerRepository interface {
	Create(ctx context.Context, player *Player) (*Player, error)
	GetByID(ctx context.Context, id uint, businessID uint) (*Player, error)
	Update(ctx context.Context, player *Player) (*Player, error)
	Delete(ctx context.Context, id uint, businessID uint) error
	List(ctx context.Context, filters PlayerFiltersDTO) (*PaginatedPlayersDTO, error)
}

// PlayerUseCase - Puerto para casos de uso de jugadores
type PlayerUseCase interface {
	CreatePlayer(ctx context.Context, dto CreatePlayerDTO) (*Player, error)
	GetPlayerByID(ctx context.Context, id uint, businessID uint) (*Player, error)
	UpdatePlayer(ctx context.Context, dto UpdatePlayerDTO) (*Player, error)
	DeletePlayer(ctx context.Context, id uint, businessID uint) error
	ListPlayers(ctx context.Context, filters PlayerFiltersDTO) (*PaginatedPlayersDTO, error)
}
