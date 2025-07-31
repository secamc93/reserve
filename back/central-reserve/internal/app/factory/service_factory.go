package factory

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
)

// ServiceFactory agrupa la creación de todos los servicios
type ServiceFactory struct {
	EmailService ports.IEmailService
	JWTService   ports.IJWTService
}

// NewServiceFactory crea una nueva instancia del factory de servicios
// ✅ ARQUITECTURA HEXAGONAL: Recibe implementaciones como parámetros
func NewServiceFactory(
	environment env.IConfig,
	logger log.ILogger,
	emailService ports.IEmailService, // Recibido como parámetro
	jwtService ports.IJWTService, // Recibido como parámetro
) *ServiceFactory {
	return &ServiceFactory{
		EmailService: emailService,
		JWTService:   jwtService,
	}
}
