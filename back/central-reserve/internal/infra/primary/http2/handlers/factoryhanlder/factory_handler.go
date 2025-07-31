package factoryhanlder

import (
	"central_reserve/internal/app/usecasefactory"
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
	"central_reserve/internal/infra/primary/http2/routes"
	"central_reserve/internal/pkg/log"
)

// HandlerFactory agrupa la creación de todos los handlers
type HandlerFactory struct {
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

// NewHandlerFactory crea una nueva instancia del factory de handlers
func NewHandlerFactory(useCaseFactory *usecasefactory.UseCaseFactory, logger log.ILogger) *HandlerFactory {
	return &HandlerFactory{
		Auth:         authhandler.New(useCaseFactory.Auth, logger),
		Client:       clienthandler.New(useCaseFactory.Client, logger),
		Table:        tablehandler.New(useCaseFactory.Table, logger),
		Reserve:      reservehandler.New(useCaseFactory.Reserve, logger),
		Business:     businesshandler.New(useCaseFactory.Business, logger),
		BusinessType: businesstypehandler.New(useCaseFactory.BusinessType, logger),
		Permission:   permissionhandler.New(useCaseFactory.Permission, logger),
		Role:         rolehandler.New(useCaseFactory.Role, logger),
		User:         userhandler.New(useCaseFactory.User, logger),
		Room:         roomhandler.New(useCaseFactory.Room, logger),
	}
}

// ToHandlers convierte el factory a la estructura de handlers esperada
func (h *HandlerFactory) ToHandlers() *routes.Handlers {
	return &routes.Handlers{
		Auth:         h.Auth,
		Client:       h.Client,
		Table:        h.Table,
		Reserve:      h.Reserve,
		Business:     h.Business,
		BusinessType: h.BusinessType,
		Permission:   h.Permission,
		Role:         h.Role,
		User:         h.User,
		Room:         h.Room,
	}
}
