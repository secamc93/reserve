package response

import "time"

type SuccessResponse[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error"`
}

type PropertyUnitResponse struct {
	ID          uint      `json:"id" example:"1"`
	BusinessID  uint      `json:"business_id" example:"1"`
	Number      string    `json:"number" example:"101"`
	Floor       *int      `json:"floor,omitempty" example:"1"`
	Block       string    `json:"block" example:"A"`
	UnitType    string    `json:"unit_type" example:"apartment"`
	Area        *float64  `json:"area,omitempty" example:"85.5"`
	Bedrooms    *int      `json:"bedrooms,omitempty" example:"3"`
	Bathrooms   *int      `json:"bathrooms,omitempty" example:"2"`
	Description string    `json:"description" example:"Apartamento esquinero"`
	IsActive    bool      `json:"is_active" example:"true"`
	CreatedAt   time.Time `json:"created_at" example:"2025-01-15T10:30:00Z"`
	UpdatedAt   time.Time `json:"updated_at" example:"2025-01-15T10:30:00Z"`
}

type PropertyUnitListItemResponse struct {
	ID        uint     `json:"id" example:"1"`
	Number    string   `json:"number" example:"101"`
	Floor     *int     `json:"floor,omitempty" example:"1"`
	Block     string   `json:"block" example:"A"`
	UnitType  string   `json:"unit_type" example:"apartment"`
	Area      *float64 `json:"area,omitempty" example:"85.5"`
	Bedrooms  *int     `json:"bedrooms,omitempty" example:"3"`
	Bathrooms *int     `json:"bathrooms,omitempty" example:"2"`
	IsActive  bool     `json:"is_active" example:"true"`
}

type PaginatedPropertyUnitsResponse struct {
	Units      []PropertyUnitListItemResponse `json:"units"`
	Total      int64                          `json:"total" example:"50"`
	Page       int                            `json:"page" example:"1"`
	PageSize   int                            `json:"page_size" example:"10"`
	TotalPages int                            `json:"total_pages" example:"5"`
}

// Aliases para respuestas
type PropertyUnitSuccess = SuccessResponse[PropertyUnitResponse]
type PropertyUnitsSuccess = SuccessResponse[PaginatedPropertyUnitsResponse]
