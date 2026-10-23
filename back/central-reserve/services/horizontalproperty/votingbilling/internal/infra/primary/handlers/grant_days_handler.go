package handlers

import (
	"net/http"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// GrantDays godoc
//
//	@Summary		Otorgar días de votación (super admin)
//	@Description	manual: pagados por fuera de la pasarela (con su valor). cortesia: regalados (valor 0)
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			business_id	query		int							true	"Propiedad"
//	@Param			body		body		request.GrantDaysRequest	true	"Fechas, origen y notas"
//	@Success		201			{object}	response.Success
//	@Router			/horizontal-properties/voting-billing/days/grant [post]
func (h *handler) GrantDays(c *gin.Context) {
	if !requireSuperAdmin(c) {
		return
	}
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	var req request.GrantDaysRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}
	p, err := h.useCase.GrantDays(c.Request.Context(), dtos.GrantDaysRequest{
		BusinessID: businessID, Dates: req.Dates, Source: req.Source, Notes: req.Notes, UserID: userID(c), Now: time.Now(),
	})
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, response.Success{Success: true, Message: "Días otorgados", Data: mappers.ToDayPayment(*p)})
}
