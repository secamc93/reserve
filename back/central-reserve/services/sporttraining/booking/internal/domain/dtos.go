package domain

import "time"

// CreateBookingDTO - DTO para crear reserva
type CreateBookingDTO struct {
	TrainingSessionID uint
	PlayerID          uint
	BookedByUserID    uint
	BusinessID        uint
	RequestNotes      string
}

// BookingFiltersDTO - Filtros para listar reservas
type BookingFiltersDTO struct {
	BusinessID uint
	Status     string
	PlayerID   *uint
	CoachID    *uint
	StartDate  *time.Time
	EndDate    *time.Time
	Page       int
	PageSize   int
}

// PaginatedBookingsDTO - Resultado paginado de reservas
type PaginatedBookingsDTO struct {
	Bookings   []BookingListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// BookingListDTO - DTO para lista de reservas
type BookingListDTO struct {
	ID                uint
	TrainingSessionID uint
	PlayerID          uint
	PlayerName        string
	SessionDate       time.Time
	SessionMode       string
	Location          string
	StatusName        string
	StatusCode        string
	StatusColor       string
	BookingDate       time.Time
	IsPaid            bool
	Price             *float64
	CreatedAt         time.Time
}

// ApproveBookingDTO - DTO para aprobar reserva
type ApproveBookingDTO struct {
	ID         uint
	BusinessID uint
	CoachID    uint
	Notes      string
}

// RejectBookingDTO - DTO para rechazar reserva
type RejectBookingDTO struct {
	ID         uint
	BusinessID uint
	CoachID    uint
	Notes      string
}

// CancelBookingDTO - DTO para cancelar reserva
type CancelBookingDTO struct {
	ID         uint
	BusinessID uint
	UserID     uint
	Reason     string
}
