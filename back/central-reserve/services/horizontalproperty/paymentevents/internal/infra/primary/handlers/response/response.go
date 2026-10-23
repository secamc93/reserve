package response

// Result es la respuesta del webhook.
type Result struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
