package request

type Table struct {
	BusinessID uint `json:"business_id" binding:"required"`
	Number     int  `json:"number" binding:"required"`
	Capacity   int  `json:"capacity" binding:"required"`
}
