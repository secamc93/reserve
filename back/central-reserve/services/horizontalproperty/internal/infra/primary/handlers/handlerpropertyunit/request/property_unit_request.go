package request

type CreatePropertyUnitRequest struct {
	Number                   string   `json:"number" binding:"required" example:"101"`
	Floor                    *int     `json:"floor" example:"1"`
	Block                    string   `json:"block" example:"A"`
	UnitType                 string   `json:"unit_type" binding:"required" example:"apartment"`
	Area                     *float64 `json:"area" example:"85.5"`
	Bedrooms                 *int     `json:"bedrooms" example:"3"`
	Bathrooms                *int     `json:"bathrooms" example:"2"`
	ParticipationCoefficient *float64 `json:"participation_coefficient" example:"0.008333"`
	Description              string   `json:"description" example:"Apartamento esquinero con vista"`
}

type UpdatePropertyUnitRequest struct {
	Number                   *string  `json:"number" example:"101"`
	Floor                    *int     `json:"floor" example:"1"`
	Block                    *string  `json:"block" example:"A"`
	UnitType                 *string  `json:"unit_type" example:"apartment"`
	Area                     *float64 `json:"area" example:"85.5"`
	Bedrooms                 *int     `json:"bedrooms" example:"3"`
	Bathrooms                *int     `json:"bathrooms" example:"2"`
	ParticipationCoefficient *float64 `json:"participation_coefficient" example:"0.008333"`
	Description              *string  `json:"description" example:"Apartamento esquinero con vista"`
	IsActive                 *bool    `json:"is_active" example:"true"`
}

type PropertyUnitFiltersRequest struct {
	Number   string `form:"number" example:"101"`
	UnitType string `form:"unit_type" example:"apartment"`
	Floor    *int   `form:"floor" example:"1"`
	Block    string `form:"block" example:"A"`
	IsActive *bool  `form:"is_active" example:"true"`
	Page     int    `form:"page" example:"1"`
	PageSize int    `form:"page_size" example:"10"`
}
