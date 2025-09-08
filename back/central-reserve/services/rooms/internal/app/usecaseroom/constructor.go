package usecaseroom

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"
	"context"
)

type IUseCaseRoom interface {
	CreateRoom(ctx context.Context, room entities.Room) (string, error)
	GetRooms(ctx context.Context) ([]entities.Room, error)
	GetRoomsByBusinessID(ctx context.Context, businessID uint) ([]entities.Room, error)
	GetRoomByID(ctx context.Context, id uint) (*entities.Room, error)
	GetRoomByCodeAndBusiness(ctx context.Context, code string, businessID uint) (*entities.Room, error)
	UpdateRoom(ctx context.Context, id uint, room entities.Room) (string, error)
	DeleteRoom(ctx context.Context, id uint) (string, error)
}

type RoomUseCase struct {
	repository ports.IRoomRepository
	logger     log.ILogger
}

func NewRoomUseCase(repository ports.IRoomRepository, logger log.ILogger) IUseCaseRoom {
	return &RoomUseCase{
		repository: repository,
		logger:     logger,
	}
}
