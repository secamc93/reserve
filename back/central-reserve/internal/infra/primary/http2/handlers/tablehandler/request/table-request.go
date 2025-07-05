package request

type Table struct {
	RestaurantID uint `json:"restaurant_id" binding:"required"`
	Number       int  `json:"number" binding:"required"`
	Capacity     int  `json:"capacity" binding:"required"`
}
