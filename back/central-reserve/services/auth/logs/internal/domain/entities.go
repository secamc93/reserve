package domain

import "time"

// LogEntry representa una entrada de log en tiempo real
type LogEntry struct {
	Timestamp  time.Time              `json:"timestamp"`
	Level      string                 `json:"level"`
	Service    string                 `json:"service,omitempty"`
	Module     string                 `json:"module,omitempty"`
	Function   string                 `json:"function,omitempty"`
	Message    string                 `json:"message"`
	Fields     map[string]interface{} `json:"fields,omitempty"`
	BusinessID *uint                  `json:"business_id,omitempty"`
	UserID     *uint                  `json:"user_id,omitempty"`
}

// LogFilter representa los filtros para logs en tiempo real
type LogFilter struct {
	Level      *string
	Service    *string
	Module     *string
	Function   *string
	BusinessID *uint
	UserID     *uint
	Search     *string // Buscar en mensaje
}
