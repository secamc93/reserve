package request

type UpdateTable struct {
	BusinessID *uint `json:"business_id,omitempty"`
	Number     *int  `json:"number,omitempty"`
	Capacity   *int  `json:"capacity,omitempty"`
}
