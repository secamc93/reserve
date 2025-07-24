package request

type UpdateRoom struct {
	BusinessID  uint   `json:"business_id" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Code        string `json:"code" binding:"required"`
	Description string `json:"description"`
	Capacity    int    `json:"capacity" binding:"required"`
	MinCapacity int    `json:"min_capacity"`
	MaxCapacity int    `json:"max_capacity"`
	IsActive    bool   `json:"is_active"`
}
