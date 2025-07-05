package request

type UpdateClient struct {
	RestaurantID *uint   `json:"restaurant_id,omitempty"`
	Name         *string `json:"name,omitempty"`
	Email        *string `json:"email,omitempty"`
	Phone        *string `json:"phone,omitempty"`
}
