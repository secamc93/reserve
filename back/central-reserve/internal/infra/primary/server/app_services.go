package server

import (
	"central_reserve/internal/infra/primary/http2"
	"central_reserve/internal/infra/primary/queue/nats"
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/infra/secundary/storage/s3"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
	"context"
	"fmt"
)

// AppServices contiene todos los servicios de la aplicación
type AppServices struct {
	Env        env.IConfig
	Logger     log.ILogger
	DB         db.IDatabase
	Nats       nats.INatsClient
	S3         s3.IS3
	HTTPServer *http2.HTTPServer
}

// Shutdown maneja el apagado ordenado de todos los servicios
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

// logStartupInfo muestra información de inicio del servidor
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
