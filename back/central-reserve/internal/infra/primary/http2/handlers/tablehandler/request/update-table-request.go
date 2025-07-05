package request

type UpdateTable struct {
	RestaurantID *uint `json:"restaurant_id,omitempty"`
	Number       *int  `json:"number,omitempty"`
	Capacity     *int  `json:"capacity,omitempty"`
}
