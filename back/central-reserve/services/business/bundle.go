package business

import (
	"central_reserve/services/business/internal/app/usecasebusiness"
	"central_reserve/services/business/internal/app/usecasebusinesstype"
	"central_reserve/services/business/internal/app/usecasebusinesstyperesource"
	"central_reserve/services/business/internal/domain"
	"central_reserve/services/business/internal/infra/primary/controllers/businesresourcehandler"
	"central_reserve/services/business/internal/infra/primary/controllers/businesshandler"
	"central_reserve/services/business/internal/infra/primary/controllers/businesstypehandler"
	"central_reserve/services/business/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, env env.IConfig, logger log.ILogger, s3 domain.IS3Service, v1Group *gin.RouterGroup) {
	repository := repository.New(db, logger)

	usecasebusiness := usecasebusiness.New(repository, logger, s3, env)
	usecasebusinesstype := usecasebusinesstype.New(repository, logger)
	usecasebusinesstyperesource := usecasebusinesstyperesource.New(repository, logger)

	businessHandler := businesshandler.New(usecasebusiness, logger)
	businesstypeHandler := businesstypehandler.New(usecasebusinesstype, logger)
	businessResourceHandler := businesresourcehandler.New(usecasebusinesstyperesource, logger)

	businessHandler.RegisterRoutes(v1Group, businessHandler)
	businesstypehandler.RegisterRoutes(v1Group, businesstypeHandler)
	businessResourceHandler.RegisterRoutes(v1Group, businessResourceHandler)
}
