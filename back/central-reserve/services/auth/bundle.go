package auth

import (
	"central_reserve/services/auth/internal/app/usecaseauth"
	"central_reserve/services/auth/internal/app/usecasepermission"
	"central_reserve/services/auth/internal/app/usecaseresource"
	"central_reserve/services/auth/internal/app/usecaserole"
	"central_reserve/services/auth/internal/app/usecaseuser"
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/primary/controllers/authhandler"
	"central_reserve/services/auth/internal/infra/primary/controllers/permissionhandler"
	"central_reserve/services/auth/internal/infra/primary/controllers/resources"
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler"
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler"
	"central_reserve/services/auth/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, env env.IConfig, logger log.ILogger, s3 domain.IS3Service, v1Group *gin.RouterGroup, jwtService domain.IJWTService) {

	repository := repository.New(db, logger)

	usecaseauth := usecaseauth.New(repository, jwtService, logger, env)
	usecaseuser := usecaseuser.New(repository, logger, s3, env)
	usecaserole := usecaserole.New(repository, logger)
	usecasepermission := usecasepermission.New(repository, logger)
	usecaseresource := usecaseresource.New(repository, logger)

	authhandler := authhandler.New(usecaseauth, logger)
	userhandler := userhandler.New(usecaseuser, logger)
	rolehandler := rolehandler.New(usecaserole, logger)
	permhandler := permissionhandler.New(usecasepermission, logger)
	resourcehandler := resources.New(usecaseresource, logger)

	authhandler.RegisterRoutes(v1Group, authhandler, logger)
	userhandler.RegisterRoutes(v1Group, userhandler, logger)
	rolehandler.RegisterRoutes(v1Group, rolehandler, logger)
	permhandler.RegisterRoutes(v1Group, permhandler, logger)
	resources.RegisterRoutes(v1Group, resourcehandler, logger)
}
