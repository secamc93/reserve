package http2

import (
	"central_reserve/internal/infra/primary/http2/docs"
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
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/jwt"
	"central_reserve/internal/pkg/log"
	"context"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Handlers struct {
	Auth         authhandler.IAuthHandler
	Client       clienthandler.IClientHandler
	Table        tablehandler.ITableHandler
	Reserve      reservehandler.IReserveHandler
	Business     businesshandler.IBusinessHandler
	BusinessType businesstypehandler.IBusinessTypeHandler
	Permission   permissionhandler.IPermissionHandler
	Role         rolehandler.IRoleHandler
	User         userhandler.IUserHandler
	Room         roomhandler.IRoomHandler
}

type HTTPServer struct {
	server     *http.Server
	router     *gin.Engine
	logger     log.ILogger
	handlers   *Handlers
	listener   net.Listener
	env        env.IConfig
	jwtService *jwt.JWTService
}

func New(
	address string,
	logger log.ILogger,
	handlers *Handlers,
	env env.IConfig,
	jwtService *jwt.JWTService,
) (*HTTPServer, error) {
	lis, err := net.Listen("tcp", address)
	if err != nil {
		return nil, err
	}

	if env.Get("LOG_LEVEL") == "debug" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	gin.DefaultWriter = &ginLogger{logger: logger}

	router := gin.New()

	router.Use(gin.Recovery())
	router.Use(middleware.CorsMiddleware())
	router.Use(middleware.LoggingMiddleware(logger, env))

	httpServer := &HTTPServer{
		router:     router,
		logger:     logger,
		handlers:   handlers,
		listener:   lis,
		jwtService: jwtService,
		server: &http.Server{
			Handler:      router,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
		env: env,
	}

	return httpServer, nil
}

func (s *HTTPServer) Routers() {
	// Configuración estándar de Swagger
	docs.SwaggerInfo.Title = "Restaurant Reservation API"
	docs.SwaggerInfo.Description = "Servicio REST para la gestión de reservas multi-restaurante."
	docs.SwaggerInfo.Version = "1.0"
	docs.SwaggerInfo.Host = fmt.Sprintf("localhost:%s", s.env.Get("HTTP_PORT"))
	docs.SwaggerInfo.BasePath = "/api/v1"
	docs.SwaggerInfo.Schemes = []string{"http", "https"}

	// Ruta para la documentación de Swagger UI
	s.router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Redirigir /docs/ a /docs/index.html
	s.router.GET("/docs", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/docs/index.html")
	})

	v1Group := s.router.Group("/api/v1")

	// Registrar rutas por dominio
	authhandler.RegisterRoutes(v1Group, s.handlers.Auth, s.jwtService, s.logger)
	clienthandler.RegisterRoutes(v1Group, s.handlers.Client, s.jwtService, s.logger)
	tablehandler.RegisterRoutes(v1Group, s.handlers.Table, s.jwtService, s.logger)
	reservehandler.RegisterRoutes(v1Group, s.handlers.Reserve, s.jwtService, s.logger)
	businesshandler.RegisterRoutes(v1Group, s.handlers.Business, s.jwtService, s.logger)
	businesstypehandler.RegisterRoutes(v1Group, s.handlers.BusinessType, s.jwtService, s.logger)
	permissionhandler.RegisterRoutes(v1Group, s.handlers.Permission, s.jwtService, s.logger)
	rolehandler.RegisterRoutes(v1Group, s.handlers.Role, s.jwtService, s.logger)
	userhandler.RegisterRoutes(v1Group, s.handlers.User, s.jwtService, s.logger)
	roomhandler.RegisterRoutes(v1Group, s.handlers.Room, s.jwtService, s.logger)
}

func (s *HTTPServer) Start() error {
	return s.server.Serve(s.listener)
}

func (s *HTTPServer) Stop() error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	return s.server.Shutdown(ctx)
}

type ginLogger struct {
	logger log.ILogger
}

func (g *ginLogger) Write(p []byte) (n int, err error) {
	message := strings.TrimSpace(string(p))
	if message != "" && !strings.Contains(message, "-->") && !strings.Contains(message, "Running in \"debug\" mode") {
		g.logger.Info().Msg(message)
	}
	return len(p), nil
}
