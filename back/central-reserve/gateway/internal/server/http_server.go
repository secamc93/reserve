package server

import (
	"central_reserve/gateway/internal/routes"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"context"
	"fmt"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// StartHTTPServer inicia el servidor HTTP con el builder de rutas por URL
func StartHTTPServer(ctx context.Context, logger log.ILogger, environment env.IConfig) error {
	// Forzar ReleaseMode para evitar logs de Gin
	gin.SetMode(gin.ReleaseMode)

	r := gin.New()

	// Logger de Gin con escritor personalizado
	gin.DefaultWriter = routes.NewGinLogger(logger)
	r.Use(gin.Logger())

	// Logger propio sencillo (siempre logea)
	r.Use(func(c *gin.Context) {
		start := time.Now()
		method := c.Request.Method
		path := c.Request.URL.Path
		c.Next()
		status := c.Writer.Status()
		lat := time.Since(start)
		logger.Info(ctx).
			Str("method", method).
			Str("path", path).
			Int("status", status).
			Dur("latency", lat).
			Msg("HTTP")
	})

	r.Use(gin.Recovery())
	// Configurar proxies de confianza para evitar warning de Gin
	if err := r.SetTrustedProxies(nil); err != nil {
		logger.Warn(ctx).Err(err).Msg("No se pudieron configurar proxies de confianza")
	}

	// Middleware de depuración opcional
	if os.Getenv("DEBUG_GATEWAY") == "1" {
		r.Use(func(c *gin.Context) {
			c.String(200, "debug-ok")
			c.Abort()
		})
	}

	// Rutas básicas
	r.GET("/", func(c *gin.Context) { c.JSON(200, gin.H{"ok": true}) })
	r.GET("/ping", func(c *gin.Context) { c.JSON(200, gin.H{"message": "pong"}) })
	// 404 JSON explícito + log
	r.NoRoute(func(c *gin.Context) {
		logger.Warn(ctx).
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Int("status", 404).
			Msg("Ruta no encontrada")
		c.JSON(404, gin.H{"error": "not_found"})
	})

	// Registrar rutas de proxy a servicios
	routes.RegisterAll(r, environment, logger)

	// Logs de inicio personalizados
	LogStartupInfo(ctx, logger, environment)

	port := environment.Get("HTTP_PORT")
	if port == "" {
		port = "8080"
	}
	addr := fmt.Sprintf(":%s", port)

	logger.Info(ctx).Str("addr", addr).Msg("Gateway HTTP iniciado")
	return r.Run(addr)
}
