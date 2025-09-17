package usecaseroom

import (
	"central_reserve/services/rooms/internal/domain"
	"central_reserve/shared/log"
	"context"
)

type IUseCaseRoom interface {
	CreateRoom(ctx context.Context, room domain.Room) (string, error)
	GetRooms(ctx context.Context) ([]domain.Room, error)
	GetRoomsByBusinessID(ctx context.Context, businessID uint) ([]domain.Room, error)
	GetRoomByID(ctx context.Context, id uint) (*domain.Room, error)
	GetRoomByCodeAndBusiness(ctx context.Context, code string, businessID uint) (*domain.Room, error)
	UpdateRoom(ctx context.Context, id uint, room domain.Room) (string, error)
	DeleteRoom(ctx context.Context, id uint) (string, error)
}

type RoomUseCase struct {
	repository domain.IRoomRepository
	logger     log.ILogger
}

func New(repository domain.IRoomRepository, logger log.ILogger) IUseCaseRoom {
	return &RoomUseCase{
		repository: repository,
		logger:     logger,
	}
}
