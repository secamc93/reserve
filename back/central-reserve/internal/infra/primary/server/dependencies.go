package server

import (
	"central_reserve/internal/app/factory"
	"central_reserve/internal/app/usecaseauth"
	"central_reserve/internal/app/usecasefactory"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/primary/http2/handlers/factoryhanlder"
	"central_reserve/internal/infra/primary/http2/routes"
	"central_reserve/internal/infra/secundary/email"
	"central_reserve/internal/infra/secundary/repository"
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/infra/secundary/storage/s3"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/jwt"
	"central_reserve/internal/pkg/log"
)

type Dependencies struct {
	Handlers          *routes.Handlers
	JWTService        ports.IJWTService
	AuthUseCase       usecaseauth.IUseCaseAuth
	ServiceFactory    *factory.ServiceFactory
	RepositoryFactory *repository.RepositoryFactory
	UseCaseFactory    *usecasefactory.UseCaseFactory
	HandlerFactory    *factoryhanlder.HandlerFactory
}

func NewDependencies(database db.IDatabase, logger log.ILogger, environment env.IConfig) *Dependencies {
	emailService := email.New(environment, logger)

	jwtSecret := environment.Get("JWT_SECRET")
	jwtService := jwt.New(jwtSecret)
	s3Service := s3.New(environment, logger)

	serviceFactory := factory.NewServiceFactory(environment, logger, emailService, jwtService)
	repoFactory := repository.NewRepositoryFactory(database, logger)
	useCaseFactory := usecasefactory.NewUseCaseFactory(repoFactory, jwtService, emailService, logger, s3Service, environment)
	handlerFactory := factoryhanlder.NewHandlerFactory(useCaseFactory, logger)

	return &Dependencies{
		Handlers:          handlerFactory.ToHandlers(),
		JWTService:        jwtService,
		AuthUseCase:       useCaseFactory.Auth,
		ServiceFactory:    serviceFactory,
		RepositoryFactory: repoFactory,
		UseCaseFactory:    useCaseFactory,
		HandlerFactory:    handlerFactory,
	}
}
