package handlercredentials

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// ListCredentials godoc
//
//	@Summary		Listar contraseñas de voto del grupo
//	@Description	Lista, por número de unidad, la contraseña de cada unidad con su tipo/bloque y su propietario (residente principal). Se usa para imprimir las credenciales (PDF).
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Produce		json
//	@Param			group_id	path		int	true	"ID del grupo"
//	@Param			business_id	query		int	false	"Requerido para super admin"
//	@Param			page		query		int	false	"Página (default 1)"
//	@Param			page_size	query		int	false	"Tamaño de página (default 10, máximo 200)"
//	@Success		200			{object}	response.SuccessResponse[response.PaginatedVotingCredentialsResponse]
//	@Failure		400			{object}	response.ErrorResponse
//	@Failure		404			{object}	response.ErrorResponse
//	@Failure		500			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/voting-groups/{group_id}/credentials [get]
func (h *CredentialsHandler) ListCredentials(c *gin.Context) {
	groupID, err := strconv.ParseUint(c.Param("group_id"), 10, 32)
	if err != nil || groupID == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "group_id inválido", Error: "debe ser numérico y > 0"})
		return
	}
	var req request.ListVotingCredentialsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Parámetros inválidos", Error: err.Error()})
		return
	}

	page, err := h.useCase.ListCredentials(c.Request.Context(), uint(groupID), req.Page, req.PageSize)
	if err != nil {
		h.logger.Error().Err(err).Uint64("group_id", groupID).Msg("Error listando contraseñas de voto")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando contraseñas", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse[response.PaginatedVotingCredentialsResponse]{
		Success: true,
		Message: "Contraseñas obtenidas",
		Data:    mappers.MapVotingCredentialsToResponse(page),
	})
}
