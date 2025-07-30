package reservehandler

import (
	"central_reserve/internal/app/usecaseauth"
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/jwt"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(v1Group *gin.RouterGroup, handler IReserveHandler, jwtService *jwt.JWTService, authUseCase usecaseauth.IAuthUseCase, logger log.ILogger) {
	reserves := v1Group.Group("/reserves")

	// Crear el builder de autenticación
	auth := middleware.NewAuthBuilder(jwtService, authUseCase, logger)

	// Rutas que requieren JWT obligatoriamente
	reserves.GET("", auth.JWT(), handler.GetReservesHandler)
	reserves.GET("/:id", auth.JWT(), handler.GetReserveByIDHandler)
	reserves.PUT("/:id", auth.JWT(), handler.UpdateReservationHandler)
	reserves.PATCH("/:id/cancel", auth.JWT(), handler.CancelReservationHandler)

	reserves.POST("", auth.Auto(), handler.CreateReserveHandler)

}
