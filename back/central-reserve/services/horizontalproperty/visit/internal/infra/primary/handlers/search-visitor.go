package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// SearchVisitor busca un visitante por DNI
// @Summary Buscar visitante por DNI
// @Description Busca un visitante en el sistema por su número de documento
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param dni query string true "DNI del visitante"
// @Success 200 {object} response.VisitorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/search-visitor [get]
func (h *VisitHandler) SearchVisitor(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "SearchVisitor")

	dni := c.Query("dni")
	if dni == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "DNI es requerido",
		})
		return
	}

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	visitor, err := h.useCase.SearchVisitor(ctx, businessID, dni)
	if err != nil {
		if err.Error() == "visitante no encontrado" {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Visitante no encontrado",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Str("dni", dni).Msg("Error buscando visitante")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error buscando visitante",
		})
		return
	}

	c.JSON(http.StatusOK, response.VisitorResponse{
		Success: true,
		Data: response.VisitorData{
			ID:           visitor.ID,
			BusinessID:   visitor.BusinessID,
			DNI:          visitor.DNI,
			FullName:     visitor.FullName,
			Phone:        visitor.Phone,
			Email:        visitor.Email,
			PhotoURL:     visitor.PhotoURL,
			HasBlacklist: visitor.HasBlacklist,
			IsVerified:   visitor.IsVerified,
			TotalVisits:  visitor.TotalVisits,
		},
	})
}
