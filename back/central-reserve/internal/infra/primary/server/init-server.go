package server

import (
	"central_reserve/internal/app/usecaseclient"
	"central_reserve/internal/app/usecasereserve"
	"central_reserve/internal/app/usecasetables"
	"central_reserve/internal/infra/primary/http2"
	"central_reserve/internal/infra/primary/http2/handlers/clienthandler"
	"central_reserve/internal/infra/primary/http2/handlers/reservehandler"
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler"
	"central_reserve/internal/infra/primary/queue/nats"
	"central_reserve/internal/infra/secundary/repository"
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/infra/secundary/storage/s3"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
	"context"
	"fmt"
)

type AppServices struct {
	Env        env.IConfig
	Logger     log.ILogger
	DB         db.IDatabase
	Nats       nats.INatsClient
	S3         s3.IS3
	HTTPServer *http2.HTTPServer
}

func InitServer(ctx context.Context) (*AppServices, error) {
	logger := log.New()

	environment, err := env.New(logger)
	if err != nil {
		return nil, err
	}

	database := db.New(logger, environment)
	if err := database.Connect(ctx); err != nil {
		return nil, err
	}

	handlers := setupDependencies(database, logger)

	httpServer, err := startHttpServer(ctx, logger, handlers, environment)
	if err != nil {
		return nil, err
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

func setupDependencies(database db.IDatabase, logger log.ILogger) *http2.Handlers {
	// Repository compartido
	repo := repository.New(database, logger)

	// Casos de uso por dominio
	clientUseCase := usecaseclient.NewClientUseCase(repo, logger)
	tableUseCase := usecasetables.NewTableUseCase(repo, logger)
	reserveUseCase := usecasereserve.NewReserveUseCase(repo, logger)

	// Handlers por dominio
	clientHandler := clienthandler.New(clientUseCase, logger)
	tableHandler := tablehandler.New(tableUseCase, logger)
	reserveHandler := reservehandler.New(reserveUseCase, logger)

	return &http2.Handlers{
		Client:  clientHandler,
		Table:   tableHandler,
		Reserve: reserveHandler,
	}
}

func startHttpServer(ctx context.Context, logger log.ILogger, handlers *http2.Handlers, environment env.IConfig) (*http2.HTTPServer, error) {
	port := environment.Get("HTTP_PORT")
	httpAddr := fmt.Sprintf(":%s", port)
	httpServer, err := http2.New(httpAddr, logger, handlers, environment)
	if err != nil {
		return nil, err
	}
	httpServer.Routers()

	go func() {
		if err := httpServer.Start(); err != nil {
			logger.Error(ctx).Err(err).Msg("Error al iniciar el servidor HTTP")
		}
	}()

	return httpServer, nil
}

func (s *AppServices) Shutdown(ctx context.Context) {
	s.Logger.Info(ctx).Msg("")
	s.Logger.Info(ctx).Msg("🛑 Iniciando apagado de servidores...")
	s.Logger.Info(ctx).Msg("")

	if err := s.HTTPServer.Stop(); err != nil {
		s.Logger.Error(ctx).Err(err).Msg("Error al detener el servidor HTTP")
	} else {
		s.Logger.Info(ctx).Msg("    ✅ Servidor HTTP detenido correctamente")
	}

	if err := s.DB.Close(); err != nil {
		s.Logger.Error(ctx).Err(err).Msg("Error al cerrar la conexión a la base de datos")
	} else {
		s.Logger.Info(ctx).Msg("    ✅ Conexión a base de datos cerrada correctamente")
	}

	s.Logger.Info(ctx).Msg("")
	s.Logger.Info(ctx).Msg("✅ Apagado completo exitoso")
	s.Logger.Info(ctx).Msg("")
}

func (s *AppServices) logStartupInfo(ctx context.Context) {
	port := s.Env.Get("HTTP_PORT")
	serverURL := fmt.Sprintf("http://localhost:%s", port)
	coloredURL := fmt.Sprintf("\033[34;4m%s\033[0m", serverURL)

	swaggerBaseURL := s.Env.Get("URL_BASE_SWAGGER")
	docsURL := fmt.Sprintf("%s/docs/index.html", swaggerBaseURL)
	coloredDocsURL := fmt.Sprintf("\033[33;4m%s\033[0m", docsURL)

	s.Logger.Info(ctx).Msg("")
	s.Logger.Info(ctx).Msg("")
	s.Logger.Info(ctx).Msgf("    🚀 Servidor HTTP iniciado correctamente")
	s.Logger.Info(ctx).Msgf("    📍 Disponible en: %s", coloredURL)
	s.Logger.Info(ctx).Msgf("    📖 Documentación: %s", coloredDocsURL)
	s.Logger.Info(ctx).Msg("")

	dbHost := s.Env.Get("DB_HOST")
	dbPort := s.Env.Get("DB_PORT")
	dbName := s.Env.Get("DB_NAME")
	dbURL := fmt.Sprintf("postgres://%s:%s/%s", dbHost, dbPort, dbName)
	coloredDBURL := fmt.Sprintf("\033[36;4m%s\033[0m", dbURL)

	s.Logger.Info(ctx).Msgf("    🗄️  Conexión PostgreSQL establecida")
	s.Logger.Info(ctx).Msgf("    📍 Base de datos: %s", coloredDBURL)
	s.Logger.Info(ctx).Msg("")
}
