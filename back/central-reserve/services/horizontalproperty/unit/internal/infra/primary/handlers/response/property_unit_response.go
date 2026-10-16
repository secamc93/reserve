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
	ID                       uint      `json:"id" example:"1"`
	BusinessID               uint      `json:"business_id" example:"1"`
	Number                   string    `json:"number" example:"101"`
	Floor                    *int      `json:"floor" example:"1"`
	Block                    string    `json:"block" example:"A"`
	UnitType                 string    `json:"unit_type" example:"apartment"`
	Area                     *float64  `json:"area" example:"85.5"`
	Bedrooms                 *int      `json:"bedrooms" example:"3"`
	Bathrooms                *int      `json:"bathrooms" example:"2"`
	ParticipationCoefficient *float64  `json:"participation_coefficient" example:"0.008333"`
	Description              string    `json:"description" example:"Apartamento esquinero"`
	IsActive                 bool      `json:"is_active" example:"true"`
	CreatedAt                time.Time `json:"created_at" example:"2025-01-15T10:30:00Z"`
	UpdatedAt                time.Time `json:"updated_at" example:"2025-01-15T10:30:00Z"`
}

type PropertyUnitListItemResponse struct {
	ID                       uint     `json:"id" example:"1"`
	Number                   string   `json:"number" example:"101"`
	Floor                    *int     `json:"floor" example:"1"`
	Block                    string   `json:"block" example:"A"`
	UnitType                 string   `json:"unit_type" example:"apartment"`
	Area                     *float64 `json:"area" example:"85.5"`
	Bedrooms                 *int     `json:"bedrooms" example:"3"`
	Bathrooms                *int     `json:"bathrooms" example:"2"`
	ParticipationCoefficient *float64 `json:"participation_coefficient" example:"0.008333"`
	IsActive                 bool     `json:"is_active" example:"true"`
	ResidentsCount           int      `json:"residents_count" example:"2"`
	MainResidentName         string   `json:"main_resident_name" example:"Juan Pérez"`
}

type PropertyUnitBlockSummaryResponse struct {
	Block          string  `json:"block" example:"Casa"`
	Total          int64   `json:"total" example:"156"`
	Active         int64   `json:"active" example:"156"`
	CoefficientSum float64 `json:"coefficient_sum" example:"78.568"`
}

type PropertyUnitsSummaryResponse struct {
	Total          int64                              `json:"total" example:"194"`
	Active         int64                              `json:"active" example:"194"`
	WithResidents  int64                              `json:"with_residents" example:"180"`
	CoefficientSum float64                            `json:"coefficient_sum" example:"100"`
	Commercial     int64                              `json:"commercial" example:"0"`
	Blocks         []PropertyUnitBlockSummaryResponse `json:"blocks"`
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
type PropertyUnitsSummarySuccess = SuccessResponse[PropertyUnitsSummaryResponse]

type ImportRowResponse struct {
	Row         int      `json:"row" example:"2"`
	Number      string   `json:"number" example:"126"`
	Block       string   `json:"block" example:"Casa"`
	Floor       *int     `json:"floor"`
	UnitType    string   `json:"unit_type" example:"house"`
	Coefficient *float64 `json:"coefficient" example:"0.503"`
	Status      string   `json:"status" example:"ready"`
	Message     string   `json:"message" example:""`
	DuplicateOf int      `json:"duplicate_of,omitempty" example:"0"`
}

type ImportPreviewResponse struct {
	Columns          int                 `json:"columns" example:"5"`
	TotalRows        int                 `json:"total_rows" example:"120"`
	Ready            int                 `json:"ready" example:"117"`
	Existing         int                 `json:"existing" example:"0"`
	Errors           int                 `json:"errors" example:"3"`
	CoefficientTotal float64             `json:"coefficient_total" example:"99.91"`
	Rows             []ImportRowResponse `json:"rows"`
}
