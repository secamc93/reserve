package server

import (
	_ "central_reserve/cmd/internal/docs"
	"central_reserve/cmd/internal/routes"
	"central_reserve/services/auth"
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"central_reserve/shared/storage"
	"context"
	"fmt"
)

func Init(ctx context.Context) error {
	logger := log.New()
	environment := env.New(logger)

	database := db.New(logger, environment)
	s3 := storage.New(environment, logger)

	middleware.InitFromEnv(environment, logger)
	r := routes.BuildRouter(ctx, logger, environment)

	routes.SetupSwagger(r, environment, logger)
	jwtService := middleware.GetJWTService()

	v1Group := r.Group("/api/v1")
	auth.New(database, environment, logger, s3, v1Group, jwtService)

	LogStartupInfo(ctx, logger, environment)

	port := environment.Get("HTTP_PORT")

	addr := fmt.Sprintf(":%s", port)
	return r.Run(addr)
}
