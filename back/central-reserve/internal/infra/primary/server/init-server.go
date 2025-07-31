package server

import (
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
	"context"
	"fmt"
)

// InitServer inicializa y configura todos los servicios de la aplicación
func InitServer(ctx context.Context) (*AppServices, error) {

	logger := log.New()
	environment := env.New(logger)
	database := db.New(logger, environment)

	dependencies := NewDependencies(database, logger, environment)
	httpServer, err := startHttpServer(ctx, logger, dependencies, environment)
	if err != nil {
		return nil, fmt.Errorf("error al iniciar servidor HTTP: %w", err)
	}

	services := &AppServices{
		Env:        environment,
		Logger:     logger,
		DB:         database,
		HTTPServer: httpServer,
	}

	services.logStartupInfo(ctx)
	return services, nil
}
