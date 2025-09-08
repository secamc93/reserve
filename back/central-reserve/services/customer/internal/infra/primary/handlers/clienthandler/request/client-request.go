package request

type Client struct {
	BusinessID uint   `json:"business_id" binding:"required"`
	Name       string `json:"name" binding:"required"`
	Email      string `json:"email" binding:"required"`
	Phone      string `json:"phone" binding:"required"`
	Dni        string `json:"dni" binding:""`
}
