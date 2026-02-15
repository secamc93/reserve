package response

import "time"

// RoomResponse representa la respuesta de una sala
type RoomResponse struct {
	ID          uint       `json:"id"`
	BusinessID  uint       `json:"business_id"`
	Name        string     `json:"name"`
	Code        string     `json:"code"`
	Description string     `json:"description"`
	Capacity    int        `json:"capacity"`
	IsActive    bool       `json:"is_active"`
	MinCapacity int        `json:"min_capacity"`
	MaxCapacity int        `json:"max_capacity"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

// RoomsListResponse representa la respuesta de una lista de salas
type RoomsListResponse struct {
	Rooms []RoomResponse `json:"rooms"`
	Total int            `json:"total"`
}
