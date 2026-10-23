package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/membership/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// SyncTransaction godoc
//
//	@Summary	Confirmar una membresía al volver del pago
//	@Tags		Membresías
//	@Security	BearerAuth
//	@Accept		json
//	@Produce	json
//	@Param		body	body		request.SyncRequest	true	"Id de la transacción de Wompi"
//	@Success	200		{object}	response.Success
//	@Router		/horizontal-properties/memberships/sync [post]
func (h *handler) SyncTransaction(c *gin.Context) {
	userID, ok := currentUser(c)
	if !ok {
		return
	}
	var req request.SyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}
	m, err := h.useCase.SyncTransaction(c.Request.Context(), dtos.SyncRequest{UserID: userID, IsSuperAdmin: middleware.IsSuperAdmin(c), TransactionID: req.TransactionID})
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Membresía confirmada con la pasarela", Data: mappers.ToMembership(*m)})
}
