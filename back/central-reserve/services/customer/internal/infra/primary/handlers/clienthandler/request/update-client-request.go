package request

type UpdateClient struct {
	BusinessID *uint   `json:"business_id,omitempty"`
	Name       *string `json:"name,omitempty"`
	Email      *string `json:"email,omitempty"`
	Phone      *string `json:"phone,omitempty"`
}
