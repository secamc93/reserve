package domain

import (
	"time"
)

type Reservation struct {
	ID              uint
	RestaurantID    uint
	TableID         uint
	ClientID        uint
	CreatedByUserID *uint
	StartAt         time.Time
	EndAt           time.Time
	NumberOfGuests  int
	Status          string
}

type Client struct {
	ID           uint
	RestaurantID uint
	Name         string
	Email        string
	Phone        string
}

type Table struct {
	ID           uint
	RestaurantID uint
	Number       int
	Capacity     int
}

type RestaurantStaff struct {
	ID           uint
	UserID       uint
	RestaurantID uint
	Role         string
}
