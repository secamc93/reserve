package domain

import "context"

// BookingRepository - Puerto para repositorio de reservas
type BookingRepository interface {
	Create(ctx context.Context, booking *Booking) (*Booking, error)
	GetByID(ctx context.Context, id uint, businessID uint) (*Booking, error)
	Update(ctx context.Context, booking *Booking) (*Booking, error)
	List(ctx context.Context, filters BookingFiltersDTO) (*PaginatedBookingsDTO, error)
	GetBookingStatusByCode(ctx context.Context, code string) (*StatusRef, error)
}

// BookingUseCase - Puerto para casos de uso de reservas
type BookingUseCase interface {
	CreateBooking(ctx context.Context, dto CreateBookingDTO) (*Booking, error)
	GetBookingByID(ctx context.Context, id uint, businessID uint) (*Booking, error)
	ListBookings(ctx context.Context, filters BookingFiltersDTO) (*PaginatedBookingsDTO, error)
	ApproveBooking(ctx context.Context, dto ApproveBookingDTO) (*Booking, error)
	RejectBooking(ctx context.Context, dto RejectBookingDTO) (*Booking, error)
	CancelBooking(ctx context.Context, dto CancelBookingDTO) (*Booking, error)
}
