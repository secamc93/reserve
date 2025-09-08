package server

import (
	"central_reserve/gateway/internal/routes"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"context"
	"fmt"

	"github.com/gin-gonic/gin"
)

// StartHTTPServer inicia el servidor HTTP con el builder de rutas por URL
func StartHTTPServer(ctx context.Context, logger log.ILogger, environment env.IConfig) error {
	// Forzar ReleaseMode para evitar logs de Gin
	gin.SetMode(gin.ReleaseMode)

	r := gin.New()
	r.Use(gin.Recovery())
	// Configurar proxies de confianza para evitar warning de Gin
	if err := r.SetTrustedProxies(nil); err != nil {
		logger.Warn(ctx).Err(err).Msg("No se pudieron configurar proxies de confianza")
	}

	// Rutas básicas
	r.GET("/", func(c *gin.Context) { c.JSON(200, gin.H{"ok": true}) })
	r.GET("/ping", func(c *gin.Context) { c.JSON(200, gin.H{"message": "pong"}) })
	// 404 JSON explícito
	r.NoRoute(func(c *gin.Context) { c.JSON(404, gin.H{"error": "not_found"}) })

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
