package handlerresident

import (
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ListResidents godoc
//
//	@Summary		Listar residentes
//	@Description	Obtiene lista paginada de residentes de una propiedad horizontal
//	@Tags			Residents
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			hp_id					path		int		true	"ID de la propiedad horizontal"
//	@Param			property_unit_number	query		string	false	"Filtrar por número de unidad (búsqueda parcial)"
//	@Param			name					query		string	false	"Filtrar por nombre del residente (búsqueda parcial)"
//	@Param			property_unit_id		query		int		false	"Filtrar por ID de unidad"
//	@Param			resident_type_id		query		int		false	"Filtrar por tipo de residente"
//	@Param			is_active				query		bool	false	"Filtrar por estado activo"
//	@Param			is_main_resident		query		bool	false	"Filtrar por residente principal"
//	@Param			page					query		int		false	"Página"			default(1)
//	@Param			page_size				query		int		false	"Tamaño de página"	default(10)
//	@Success		200						{object}	object
//	@Failure		400						{object}	object
//	@Failure		500						{object}	object
//	@Router			/horizontal-properties/{hp_id}/residents [get]
func (h *ResidentHandler) ListResidents(c *gin.Context) {
	hpIDParam := c.Param("hp_id")
	hpID, err := strconv.ParseUint(hpIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/list-residents.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("hp_id", hpIDParam).Msg("Error parseando ID de propiedad horizontal")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID inválido", Error: "Debe ser numérico"})
		return
	}
	var req request.ResidentFiltersRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/list-residents.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Msg("Error validando parámetros de búsqueda")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Parámetros inválidos", Error: err.Error()})
		return
	}
	filters := mapper.MapFiltersRequestToDTO(req, uint(hpID))
	result, err := h.useCase.ListResidents(c.Request.Context(), filters)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/list-residents.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("hp_id", uint(hpID)).Interface("filters", filters).Msg("Error listando residentes")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando residentes", Error: err.Error()})
		return
	}
	responseData := mapper.MapPaginatedDTOToResponse(result)
	c.JSON(http.StatusOK, response.ResidentsSuccess{Success: true, Message: "Residentes obtenidos exitosamente", Data: responseData})
}
