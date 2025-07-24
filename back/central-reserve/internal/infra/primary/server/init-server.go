package server

import (
	"central_reserve/internal/app/usecaseauth"
	"central_reserve/internal/app/usecasebusiness"
	"central_reserve/internal/app/usecasebusinesstype"
	"central_reserve/internal/app/usecaseclient"
	"central_reserve/internal/app/usecasepermission"
	"central_reserve/internal/app/usecasereserve"
	"central_reserve/internal/app/usecaserole"
	"central_reserve/internal/app/usecaseroom"
	"central_reserve/internal/app/usecasetables"
	"central_reserve/internal/app/usecaseuser"
	"central_reserve/internal/infra/primary/http2"
	"central_reserve/internal/infra/primary/http2/handlers/authhandler"
	"central_reserve/internal/infra/primary/http2/handlers/businesshandler"
	"central_reserve/internal/infra/primary/http2/handlers/businesstypehandler"
	"central_reserve/internal/infra/primary/http2/handlers/clienthandler"
	"central_reserve/internal/infra/primary/http2/handlers/permissionhandler"
	"central_reserve/internal/infra/primary/http2/handlers/reservehandler"
	"central_reserve/internal/infra/primary/http2/handlers/rolehandler"
	"central_reserve/internal/infra/primary/http2/handlers/roomhandler"
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler"
	"central_reserve/internal/infra/primary/http2/handlers/userhandler"
	"central_reserve/internal/infra/primary/queue/nats"
	"central_reserve/internal/infra/secundary/email"
	"central_reserve/internal/infra/secundary/repository"
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/infra/secundary/storage/s3"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/jwt"
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

	handlers, jwtService := setupDependencies(database, logger, environment)

	httpServer, err := startHttpServer(ctx, logger, handlers, environment, jwtService)
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

func setupDependencies(database db.IDatabase, logger log.ILogger, environment env.IConfig) (*http2.Handlers, *jwt.JWTService) {
	// Repositorios específicos para casos de uso
	clientUseCaseRepo := repository.NewClientRepository(database, logger)             // IClientRepository implementa IClientUseCaseRepository
	tableUseCaseRepo := repository.NewTableRepository(database, logger)               // ITableRepository implementa ITableUseCaseRepository
	authUseCaseRepo := repository.NewAuthRepository(database, logger)                 // IAuthRepository implementa IAuthUseCaseRepository
	businessUseCaseRepo := repository.NewBusinessRepository(database, logger)         // IBusinessRepository implementa IBusinessUseCaseRepository
	businessTypeUseCaseRepo := repository.NewBusinessTypeRepository(database, logger) // IBusinessTypeRepository implementa IBusinessTypeUseCaseRepository
	permissionUseCaseRepo := repository.NewPermissionRepository(database, logger)     // IPermissionRepository implementa IPermissionUseCaseRepository
	reserveUseCaseRepo := repository.NewReserveUseCaseRepository(database, logger)
	roleUseCaseRepo := repository.NewRoleRepository(database, logger)
	userUseCaseRepo := repository.NewUserRepository(database, logger)
	roomUseCaseRepo := repository.NewRoomRepository(database, logger)

	// Servicios
	emailService := email.NewEmailService()

	// Servicio JWT
	jwtSecret := environment.Get("JWT_SECRET")
	if jwtSecret == "" {
		logger.Warn().Msg("JWT_SECRET no configurado, usando valor por defecto")
		jwtSecret = "default-secret-key-change-in-production"
	}
	jwtService := jwt.New(jwtSecret)

	// Casos de uso por dominio
	authUseCase := usecaseauth.NewAuthUseCase(authUseCaseRepo, jwtService, logger)
	clientUseCase := usecaseclient.NewClientUseCase(clientUseCaseRepo)
	tableUseCase := usecasetables.NewTableUseCase(tableUseCaseRepo)
	reserveUseCase := usecasereserve.NewReserveUseCase(reserveUseCaseRepo, emailService, logger)
	businessUseCase := usecasebusiness.NewBusinessUseCase(businessUseCaseRepo, logger)
	businessTypeUseCase := usecasebusinesstype.NewBusinessTypeUseCase(businessTypeUseCaseRepo, logger)
	permissionUseCase := usecasepermission.NewPermissionUseCase(permissionUseCaseRepo, logger)
	roleUseCase := usecaserole.NewRoleUseCase(roleUseCaseRepo, logger)
	userUseCase := usecaseuser.NewUserUseCase(userUseCaseRepo, logger)
	roomUseCase := usecaseroom.NewRoomUseCase(roomUseCaseRepo, logger)

	// Handlers por dominio
	authHandler := authhandler.New(authUseCase, logger)
	clientHandler := clienthandler.New(clientUseCase, logger)
	tableHandler := tablehandler.New(tableUseCase, logger)
	reserveHandler := reservehandler.New(reserveUseCase, logger)
	businessHandler := businesshandler.New(businessUseCase, logger)
	businessTypeHandler := businesstypehandler.New(businessTypeUseCase, logger)
	permissionHandler := permissionhandler.New(permissionUseCase, logger)
	roleHandler := rolehandler.New(roleUseCase, logger)
	userHandler := userhandler.New(userUseCase, logger)
	roomHandler := roomhandler.New(roomUseCase, logger)

	return &http2.Handlers{
		Auth:         authHandler,
		Client:       clientHandler,
		Table:        tableHandler,
		Reserve:      reserveHandler,
		Business:     businessHandler,
		BusinessType: businessTypeHandler,
		Permission:   permissionHandler,
		Role:         roleHandler,
		User:         userHandler,
		Room:         roomHandler,
	}, jwtService
}

func startHttpServer(ctx context.Context, logger log.ILogger, handlers *http2.Handlers, environment env.IConfig, jwtService *jwt.JWTService) (*http2.HTTPServer, error) {
	port := environment.Get("HTTP_PORT")
	httpAddr := fmt.Sprintf(":%s", port)
	httpServer, err := http2.New(httpAddr, logger, handlers, environment, jwtService)
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
