package handlers

import "github.com/gin-gonic/gin"

func (h *handler) RegisterRoutes(router *gin.RouterGroup) {
	// Público: se autentica con la firma del evento.
	router.POST("/payments/wompi/events", h.WompiEvents)
}
