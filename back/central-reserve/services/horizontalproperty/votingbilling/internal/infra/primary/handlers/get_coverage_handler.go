package handlers

import (
	"net/http"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// GetCoverage godoc
//
//	@Summary		Cobertura de días de votación de la propiedad
//	@Description	Exención, membresía vigente, días comprados y fechas sin cubrir de las asambleas próximas
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Produce		json
//	@Param			business_id	query		int	false	"Obligatorio para super admin"
//	@Success		200			{object}	response.Success
//	@Router			/horizontal-properties/voting-billing/coverage [get]
func (h *handler) GetCoverage(c *gin.Context) {
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	cov, err := h.useCase.GetCoverage(c.Request.Context(), businessID, time.Now())
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Cobertura obtenida", Data: mappers.ToCoverage(cov)})
}
