package reservehandler

import (
	"central_reserve/internal/app/usecaseauth"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(v1Group *gin.RouterGroup, handler IReserveHandler, jwtService ports.IJWTService, authUseCase usecaseauth.IAuthUseCase, logger log.ILogger) {
	reserves := v1Group.Group("/reserves")
	auth := middleware.NewAuthBuilder(jwtService, authUseCase, logger)

	reserves.GET("", auth.JWT(), handler.GetReservesHandler)
	reserves.GET("/:id", auth.JWT(), handler.GetReserveByIDHandler)
	reserves.PUT("/:id", auth.JWT(), handler.UpdateReservationHandler)
	reserves.PATCH("/:id/cancel", auth.JWT(), handler.CancelReservationHandler)

	reserves.POST("", auth.Auto(), handler.CreateReserveHandler)

}
