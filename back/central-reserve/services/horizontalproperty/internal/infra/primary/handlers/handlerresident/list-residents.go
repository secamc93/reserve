package handlerresident

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
	"central_reserve/shared/log"
	"net/http"
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
//	@Param			business_id				query		int		false	"ID del business (opcional para super admin)"
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
//	@Router			/horizontal-properties/residents [get]
func (h *ResidentHandler) ListResidents(c *gin.Context) {
	// Configurar contexto de logging
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListResidents")

	var req request.ResidentFiltersRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error validando parámetros de búsqueda")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Parámetros inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Verificar super admin y decidir businessID
	isSuperAdmin := middleware.IsSuperAdmin(c)
	var businessID uint

	if isSuperAdmin {
		// Super admin: puede usar business_id del query param o ver todo (0)
		businessIDParam := c.Query("business_id")
		if businessIDParam != "" {
			businessIDFromQuery, err := strconv.ParseUint(businessIDParam, 10, 32)
			if err != nil {
				h.logger.Error(ctx).Err(err).Str("business_id", businessIDParam).Msg("Error parseando business_id del query")
				c.JSON(http.StatusBadRequest, response.ErrorResponse{
					Success: false,
					Message: "business_id inválido",
					Error:   "Debe ser numérico",
				})
				return
			}
			businessID = uint(businessIDFromQuery)
		} else {
			// Si no envía business_id, ver todo (business_id = 0)
			businessID = 0
		}
	} else {
		// Usuario normal: usar business_id del token
		tokenBusinessID, exists := middleware.GetBusinessID(c)
		if !exists {
			h.logger.Error(ctx).Msg("business_id no disponible en el token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{
				Success: false,
				Message: "Token inválido",
				Error:   "business_id no disponible en el token",
			})
			return
		}
		businessID = tokenBusinessID
	}

	// Agregar business_id al contexto para logging
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	h.logger.Info(ctx).Bool("is_super_admin", isSuperAdmin).Interface("filters", req).Msg("Listando residentes")

	filters := mapper.MapFiltersRequestToDTO(req, businessID)
	result, err := h.useCase.ListResidents(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Interface("filters", filters).Msg("Error listando residentes")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando residentes",
			Error:   err.Error(),
		})
		return
	}

	h.logger.Info(ctx).Int64("total_residents", result.Total).Int("page", result.Page).Int("page_size", result.PageSize).Msg("Residentes listados exitosamente")
	responseData := mapper.MapPaginatedDTOToResponse(result)
	c.JSON(http.StatusOK, response.ResidentsSuccess{
		Success: true,
		Message: "Residentes obtenidos exitosamente",
		Data:    responseData,
	})
}
