package routes

import (
	"central_reserve/shared/log"
	"strings"
)

// GinLogger implementa el logger personalizado para Gin
type GinLogger struct {
	logger log.ILogger
}

// NewGinLogger crea una nueva instancia del logger de Gin
func NewGinLogger(logger log.ILogger) *GinLogger {
	return &GinLogger{
		logger: logger,
	}
}

// Write implementa la interfaz io.Writer para el logger de Gin
func (gl *GinLogger) Write(p []byte) (n int, err error) {
	message := strings.TrimSpace(string(p))

	// Filtrar mensajes innecesarios
	if message != "" &&
		!strings.Contains(message, "-->") &&
		!strings.Contains(message, "Running in \"debug\" mode") {
		gl.logger.Info().Msg(message)
	}

	return len(p), nil
}
