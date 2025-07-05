package request

type Client struct {
	RestaurantID uint   `json:"restaurant_id" binding:"required"`
	Name         string `json:"name" binding:"required"`
	Email        string `json:"email" binding:"required"`
	Phone        string `json:"phone" binding:"required"`
}
