//go:build legacy

package routes

import (
	"central_reserve/internal/app/app"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/primary/http2/handlers/businesshandler"
	"central_reserve/internal/infra/primary/http2/handlers/businesstypehandler"
	"central_reserve/internal/infra/primary/http2/handlers/clienthandler"
	"central_reserve/internal/infra/primary/http2/handlers/handlers"
	"central_reserve/internal/infra/primary/http2/handlers/reservehandler"
	"central_reserve/internal/infra/primary/http2/handlers/roomhandler"
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// APIRoutes maneja las rutas de la API v1
type APIRoutes struct {
	router      *gin.Engine
	handlers    *Handlers
	jwtService  ports.IJWTService
	authUseCase app.Iapp
	logger      log.ILogger
}

// Handlers contiene todos los handlers de la aplicación
type Handlers struct {
	Auth         handlers.Ihandlers
	Client       clienthandler.IClientHandler
	Table        tablehandler.ITableHandler
	Reserve      reservehandler.IReserveHandler
	Business     businesshandler.IBusinessHandler
	BusinessType businesstypehandler.IBusinessTypeHandler
	Permission   handlers.Ihandlers
	Role         handlers.Ihandlers
	User         handlers.Ihandlers
	Room         roomhandler.IRoomHandler
}

// NewAPIRoutes crea una nueva instancia de rutas de la API
func NewAPIRoutes(
	router *gin.Engine,
	handlers *Handlers,
	jwtService ports.IJWTService,
	authUseCase app.Iapp,
	logger log.ILogger,
) *APIRoutes {
	return &APIRoutes{
		router:      router,
		handlers:    handlers,
		jwtService:  jwtService,
		authUseCase: authUseCase,
		logger:      logger,
	}
}

// Setup configura todas las rutas de la API v1
func (ar *APIRoutes) Setup() {
	v1Group := ar.router.Group("/api/v1")

	// Registrar todas las rutas de handlers
	ar.registerHandlerRoutes(v1Group)
}

// registerHandlerRoutes registra las rutas de todos los handlers
func (ar *APIRoutes) registerHandlerRoutes(v1Group *gin.RouterGroup) {
	// Autenticación
	handlers.RegisterRoutes(v1Group, ar.handlers.Auth, ar.jwtService, ar.logger)

	// Gestión de clientes
	clienthandler.RegisterRoutes(v1Group, ar.handlers.Client, ar.jwtService, ar.logger)

	// Gestión de mesas
	tablehandler.RegisterRoutes(v1Group, ar.handlers.Table, ar.jwtService, ar.logger)

	// Gestión de reservas
	reservehandler.RegisterRoutes(v1Group, ar.handlers.Reserve, ar.jwtService, ar.authUseCase, ar.logger)

	// Gestión de negocios
	businesshandler.RegisterRoutes(v1Group, ar.handlers.Business, ar.jwtService, ar.logger)

	// Gestión de tipos de negocio
	businesstypehandler.RegisterRoutes(v1Group, ar.handlers.BusinessType, ar.jwtService, ar.logger)

	// Gestión de permisos
	handlers.RegisterRoutes(v1Group, ar.handlers.Permission, ar.jwtService, ar.logger)

	// Gestión de roles
	handlers.RegisterRoutes(v1Group, ar.handlers.Role, ar.jwtService, ar.logger)

	// Gestión de usuarios
	handlers.RegisterRoutes(v1Group, ar.handlers.User, ar.jwtService, ar.logger)

	// Gestión de salas
	roomhandler.RegisterRoutes(v1Group, ar.handlers.Room, ar.jwtService, ar.logger)
}
