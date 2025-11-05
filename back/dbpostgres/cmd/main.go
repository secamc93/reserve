package main

import (
	"context"
	"dbpostgres/app/app/usecases"
	"dbpostgres/app/infra/db"
	"dbpostgres/pkg/env"
	"dbpostgres/pkg/log"
	"time"
)

func main() {
	// Inicializar logger
	logger := log.New()

	// Inicializar configuración
	config, err := env.New(logger)
	if err != nil {
		logger.Fatal().Err(err).Msg("Error al cargar la configuración")
	}

	// Inicializar y conectar a la base de datos
	database := db.New(logger, config)

	// Usamos un contexto con timeout para la conexión inicial
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	if err := database.Connect(ctx); err != nil {
		logger.Fatal().Err(err).Msg("No se pudo conectar a la base de datos")
	}

	// Defer para cerrar la conexión al final de la ejecución de main
	defer func() {
		logger.Info().Msg("Cerrando la conexión de la base de datos.")
		if err := database.Close(); err != nil {
			logger.Error().Err(err).Msg("Error al cerrar la conexión de la base de datos")
		}
	}()

	// Obtener la conexión de GORM
	dbConn := database.Conn(context.Background())

	// Crear caso de uso de migración (solo esquema)
	migrationUseCase := usecases.NewMigrationUseCase(dbConn, logger)

	// Ejecutar migración
	if err := migrationUseCase.MigrateDB(); err != nil {
		logger.Fatal().Err(err).Msg("Error al ejecutar migración")
	}

	logger.Info().Msg("✅ Migración completada exitosamente")
}
