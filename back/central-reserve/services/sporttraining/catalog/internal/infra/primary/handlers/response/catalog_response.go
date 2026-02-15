package response

// ErrorResponse - Respuesta de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// CatalogListResponse - Respuesta genérica para listas de catálogo
type CatalogListResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
}

// SkillLevelData - Datos de nivel de habilidad
type SkillLevelData struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Level       int    `json:"level"`
	Color       string `json:"color"`
}

// CoachSpecialtyData - Datos de especialidad de entrenador
type CoachSpecialtyData struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
}

// SessionTypeData - Datos de tipo de sesión
type SessionTypeData struct {
	ID               uint     `json:"id"`
	Name             string   `json:"name"`
	Code             string   `json:"code"`
	Description      string   `json:"description"`
	DefaultDuration  int      `json:"default_duration"`
	DefaultPrice     *float64 `json:"default_price"`
	AllowsIndividual bool     `json:"allows_individual"`
	AllowsGroup      bool     `json:"allows_group"`
	Icon             string   `json:"icon"`
	Color            string   `json:"color"`
}

// StatusData - Datos de estado genérico
type StatusData struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Color       string `json:"color"`
	Icon        string `json:"icon"`
	IsFinal     bool   `json:"is_final,omitempty"`
}
