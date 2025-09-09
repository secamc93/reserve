package routes

import (
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"context"

	"github.com/gin-gonic/gin"
)

// BuildRouter construye y configura el *gin.Engine del monolito en un solo lugar
func BuildRouter(ctx context.Context, logger log.ILogger, environment env.IConfig) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)

	r := gin.New()

	// Logging centralizado
	SetupGinLogging(r, logger)

	// Recovery
	r.Use(gin.Recovery())

	// 404 JSON explícito + log WARN
	r.NoRoute(func(c *gin.Context) {
		logger.Warn(ctx).
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Int("status", 404).
			Msg("Ruta no encontrada")
		c.JSON(404, gin.H{"error": "not_found"})
	})

	return r
}
