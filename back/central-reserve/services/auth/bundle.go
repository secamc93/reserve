package auth

import (
	"central_reserve/services/auth/actions"
	"central_reserve/services/auth/business"
	"central_reserve/services/auth/login"
	"central_reserve/services/auth/permisions"
	"central_reserve/services/auth/resources"
	"central_reserve/services/auth/roles"
	"central_reserve/services/auth/users"

	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/jwt"
	"central_reserve/shared/log"
	"central_reserve/shared/storage"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, env env.IConfig, logger log.ILogger, s3 storage.IS3Service, v1Group *gin.RouterGroup, jwtService jwt.IJWTService) {
	actions.New(db, logger, v1Group)
	business.New(db, env, logger, s3, v1Group)
	login.New(db, logger, jwtService, v1Group)
	permisions.New(db, logger, v1Group)
	resources.New(db, logger, v1Group)
	roles.New(db, logger, v1Group)
	users.New(db, env, logger, s3, v1Group)
}
