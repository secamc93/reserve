package usecasefactory

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
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/secundary/repository"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
)

// UseCaseFactory agrupa todos los casos de uso
type UseCaseFactory struct {
	Auth         usecaseauth.IUseCaseAuth
	Client       usecaseclient.IUseCaseClient
	Table        usecasetables.IUseCaseTable
	Reserve      usecasereserve.IUseCaseReserve
	Business     usecasebusiness.IUseCaseBusiness
	BusinessType usecasebusinesstype.IUseCaseBusinessType
	Permission   usecasepermission.IUseCasePermission
	Role         usecaserole.IUseCaseRole
	User         usecaseuser.IUseCaseUser
	Room         usecaseroom.IUseCaseRoom
}

// NewUseCaseFactory crea una nueva instancia del factory de casos de uso
func NewUseCaseFactory(
	repoFactory *repository.RepositoryFactory,
	jwtService ports.IJWTService,
	emailService ports.IEmailService,
	logger log.ILogger,
	s3Service ports.IS3Service,
	env env.IConfig,
) *UseCaseFactory {
	return &UseCaseFactory{
		Auth:         usecaseauth.NewAuthUseCase(repoFactory.AuthRepository, jwtService, logger),
		Client:       usecaseclient.NewClientUseCase(repoFactory.ClientRepository),
		Table:        usecasetables.NewTableUseCase(repoFactory.TableRepository),
		Reserve:      usecasereserve.NewReserveUseCase(repoFactory.ReservationRepository, emailService, logger),
		Business:     usecasebusiness.NewBusinessUseCase(repoFactory.BusinessRepository, logger),
		BusinessType: usecasebusinesstype.NewBusinessTypeUseCase(repoFactory.BusinessTypeRepository, logger),
		Permission:   usecasepermission.NewPermissionUseCase(repoFactory.PermissionRepository, logger),
		Role:         usecaserole.NewRoleUseCase(repoFactory.RoleRepository, logger),
		User:         usecaseuser.NewUserUseCase(repoFactory.UserRepository, logger, s3Service, env),
		Room:         usecaseroom.NewRoomUseCase(repoFactory.RoomRepository, logger),
	}
}
