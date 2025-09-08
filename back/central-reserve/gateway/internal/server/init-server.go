package server

import (
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"context"
)

// Init arranca el servidor HTTP con las rutas de proxy por URL
func Init(ctx context.Context) error {
	logger := log.New()
	environment := env.New(logger)
	return StartHTTPServer(ctx, logger, environment)
}
