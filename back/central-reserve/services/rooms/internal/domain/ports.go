package domain

import "context"

// IRoomRepository define las operaciones para salas
type IRoomRepository interface {
	CreateRoom(ctx context.Context, room Room) (string, error)
	GetRooms(ctx context.Context) ([]Room, error)
	GetRoomsByBusinessID(ctx context.Context, businessID uint) ([]Room, error)
	GetRoomByID(ctx context.Context, id uint) (*Room, error)
	GetRoomByCodeAndBusiness(ctx context.Context, code string, businessID uint) (*Room, error)
	UpdateRoom(ctx context.Context, id uint, room Room) (string, error)
	DeleteRoom(ctx context.Context, id uint) (string, error)
}
