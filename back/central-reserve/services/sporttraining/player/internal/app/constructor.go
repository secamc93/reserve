package app

import (
	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/shared/log"
)

type playerUseCase struct {
	repo   domain.PlayerRepository
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de jugadores
func New(repo domain.PlayerRepository, logger log.ILogger) domain.PlayerUseCase {
	return &playerUseCase{
		repo:   repo,
		logger: logger.WithModule("jugadores"),
	}
}
