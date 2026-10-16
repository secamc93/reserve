package handlercredentials

import (
	"errors"
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// GenerateCredentials godoc
//
//	@Summary		Generar contraseñas de voto del grupo
//	@Description	Genera una contraseña aleatoria para cada unidad activa de la propiedad que aún no tenga una en el grupo. Con regenerate=true reemplaza todas. Desde que el grupo tiene contraseñas, el voto público por QR exige la de la unidad.
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path		int										true	"ID del grupo"
//	@Param			business_id	query		int										false	"Requerido para super admin"
//	@Param			request		body		request.GenerateVotingCredentialsRequest	false	"Opciones"
//	@Success		200			{object}	response.SuccessResponse[response.GenerateVotingCredentialsResponse]
//	@Failure		400			{object}	response.ErrorResponse
//	@Failure		404			{object}	response.ErrorResponse
//	@Failure		500			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/voting-groups/{group_id}/credentials/generate [post]
func (h *CredentialsHandler) GenerateCredentials(c *gin.Context) {
	groupID, err := strconv.ParseUint(c.Param("group_id"), 10, 32)
	if err != nil || groupID == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "group_id inválido", Error: "debe ser numérico y > 0"})
		return
	}
	var req request.GenerateVotingCredentialsRequest
	if c.Request.ContentLength > 0 {
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
			return
		}
	}

	result, err := h.useCase.GenerateCredentials(c.Request.Context(), uint(groupID), req.Regenerate)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrVotingGroupNotFound):
			c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Grupo de votación no encontrado", Error: err.Error()})
		case errors.Is(err, domain.ErrNoUnitsForCredentials):
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "La propiedad no tiene unidades activas", Error: err.Error()})
		default:
			h.logger.Error().Err(err).Uint64("group_id", groupID).Msg("Error generando contraseñas de voto")
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error generando contraseñas", Error: err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse[response.GenerateVotingCredentialsResponse]{
		Success: true,
		Message: "Contraseñas generadas",
		Data:    response.GenerateVotingCredentialsResponse{Generated: result.Generated, Total: result.Total},
	})
}
