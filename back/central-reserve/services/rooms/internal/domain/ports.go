package domain

import "context"

// IRoomRepository define las operaciones para salas
type IRoomRepository interface {
	CreateRoom(ctx context.Context, room entities.Room) (string, error)
	GetRooms(ctx context.Context) ([]entities.Room, error)
	GetRoomsByBusinessID(ctx context.Context, businessID uint) ([]entities.Room, error)
	GetRoomByID(ctx context.Context, id uint) (*entities.Room, error)
	GetRoomByCodeAndBusiness(ctx context.Context, code string, businessID uint) (*entities.Room, error)
	UpdateRoom(ctx context.Context, id uint, room entities.Room) (string, error)
	DeleteRoom(ctx context.Context, id uint) (string, error)
}
