package server

import (
	"central_reserve/internal/infra/primary/http2"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
	"context"
	"fmt"
)

// startHttpServer inicia el servidor HTTP
func startHttpServer(ctx context.Context, logger log.ILogger, dependencies *Dependencies, environment env.IConfig) (*http2.HTTPServer, error) {
	port := environment.Get("HTTP_PORT")
	httpAddr := fmt.Sprintf(":%s", port)

	httpServer, err := http2.New(httpAddr, logger, dependencies.Handlers, environment, dependencies.JWTService, dependencies.AuthUseCase)
	if err != nil {
		return nil, fmt.Errorf("error al crear servidor HTTP: %w", err)
	}

	httpServer.Routers()

	go func() {
		if err := httpServer.Start(); err != nil {
			logger.Error(ctx).Err(err).Msg("Error al iniciar el servidor HTTP")
		}
	}()

	return httpServer, nil
}
