package handlerpropertyunit

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/response"

	"github.com/gin-gonic/gin"
)

// ListPropertyUnits godoc
//
//	@Summary		Listar unidades de propiedad
//	@Description	Obtiene lista paginada de unidades de una propiedad horizontal con filtros opcionales
//	@Tags			Property Units
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			hp_id		path		int		true	"ID de la propiedad horizontal"
//	@Param			number		query		string	false	"Filtrar por número de unidad (búsqueda parcial)"
//	@Param			unit_type	query		string	false	"Tipo de unidad (apartment, house, office)"
//	@Param			floor		query		int		false	"Número de piso"
//	@Param			block		query		string	false	"Bloque/Torre"
//	@Param			is_active	query		bool	false	"Estado activo"
//	@Param			page		query		int		false	"Página"			default(1)
//	@Param			page_size	query		int		false	"Tamaño de página"	default(10)
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/{hp_id}/property-units [get]
func (h *PropertyUnitHandler) ListPropertyUnits(c *gin.Context) {
	hpIDParam := c.Param("hp_id")
	hpID, err := strconv.ParseUint(hpIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/list-property-units.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("hp_id", hpIDParam).Msg("Error parseando ID de propiedad horizontal")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de propiedad horizontal inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	var req request.PropertyUnitFiltersRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/list-property-units.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Msg("Error validando parámetros de búsqueda")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Parámetros de búsqueda inválidos",
			Error:   err.Error(),
		})
		return
	}

	filters := mapper.MapFiltersRequestToDTO(req, uint(hpID))
	result, err := h.useCase.ListPropertyUnits(c.Request.Context(), filters)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/list-property-units.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("hp_id", uint(hpID)).Interface("filters", filters).Msg("Error listando unidades")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando unidades",
			Error:   err.Error(),
		})
		return
	}

	responseData := mapper.MapPaginatedDTOToResponse(result)
	c.JSON(http.StatusOK, response.PropertyUnitsSuccess{
		Success: true,
		Message: "Unidades obtenidas exitosamente",
		Data:    responseData,
	})
}
