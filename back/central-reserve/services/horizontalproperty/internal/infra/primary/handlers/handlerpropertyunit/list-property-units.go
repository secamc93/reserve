package handlerpropertyunit

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ListPropertyUnits godoc
//
//	@Summary		Listar unidades de propiedad
//	@Description	Obtiene lista paginada de unidades; si el usuario es super admin y no envía business_id, verá todas
//	@Tags			Property Units
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			business_id	query	int	false	"ID del business (opcional; si se omite y es super admin, ve todo)"
//	@Param			number		query	string	false	"Filtrar por número de unidad (búsqueda parcial)"
//	@Param			unit_type	query	string	false	"Tipo de unidad (apartment, house, office)"
//	@Param			floor		query	int	false	"Número de piso"
//	@Param			block		query	string	false	"Bloque/Torre"
//	@Param			is_active	query	bool	false	"Estado activo"
//	@Param			page		query	int	false	"Página"			default(1)
//	@Param			page_size	query	int	false	"Tamaño de página"	default(10)
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/property-units [get]
func (h *PropertyUnitHandler) ListPropertyUnits(c *gin.Context) {
	// Configurar contexto de logging una sola vez para toda la función
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListPropertyUnits")

	// business_id como query opcional
	businessIDParam := c.Query("business_id")

	var businessIDFromQuery uint64
	var err error
	if businessIDParam != "" {
		businessIDFromQuery, err = strconv.ParseUint(businessIDParam, 10, 32)
		if err != nil {
			h.logger.Error(ctx).Err(err).Str("business_id", businessIDParam).Msg("Error parseando business_id (query)")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false, Message: "business_id inválido",
				Error: "Debe ser numérico",
			})
			return
		}
	}

	var req request.PropertyUnitFiltersRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error validando parámetros de búsqueda")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false, Message: "Parámetros de búsqueda inválidos",
			Error: err.Error(),
		})
		return
	}

	// Verificar super admin y decidir businessID (business_id)
	isSuperAdmin := middleware.IsSuperAdmin(c)

	var businessID uint
	if isSuperAdmin {
		// Si no envía business_id, ver todo (business_id = 0)
		businessID = uint(businessIDFromQuery)
	} else {
		// Usuario normal: usar business_id del token y opcionalmente validar si manda business_id distinto
		tokenBusinessID, exists := middleware.GetBusinessID(c)
		if !exists {
			h.logger.Error(ctx).Msg("business_id no disponible en el token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{
				Success: false, Message: "Token inválido",
				Error: "business_id no disponible",
			})
			return
		}
		if businessIDParam != "" && uint(businessIDFromQuery) != tokenBusinessID {
			h.logger.Warn(ctx).Uint("token_business_id", tokenBusinessID).Uint("requested_business_id", uint(businessIDFromQuery)).Msg("Acceso denegado: business_id no coincide")
			c.JSON(http.StatusForbidden, response.ErrorResponse{
				Success: false, Message: "No tiene acceso a este business",
				Error: "El business_id del token no coincide con el business_id solicitado",
			})
			return
		}
		businessID = tokenBusinessID
	}

	// Agregar business_id al contexto
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	// Log de inicio de operación
	h.logger.Info(ctx).Bool("is_super_admin", isSuperAdmin).Str("number", req.Number).Str("unit_type", req.UnitType).Msg("Iniciando listado de unidades de propiedad")

	filters := mapper.MapFiltersRequestToDTO(req, businessID)
	result, err := h.useCase.ListPropertyUnits(ctx, filters)
	if err != nil {
		status := http.StatusInternalServerError
		message := "Error listando unidades"

		// Mapear errores específicos del caso de uso
		switch err {
		case domain.ErrPropertyUnitNotFound:
			status = http.StatusNotFound
			message = "Unidad de propiedad no encontrada"
		case domain.ErrPropertyUnitNumberExists:
			status = http.StatusConflict
			message = "Ya existe una unidad con este número"
		case domain.ErrPropertyUnitNumberRequired:
			status = http.StatusBadRequest
			message = "El número de unidad es requerido"
		case domain.ErrPropertyUnitHasResidents:
			status = http.StatusConflict
			message = "No se puede eliminar una unidad que tiene residentes"
		case domain.ErrPropertyUnitRequired:
			status = http.StatusBadRequest
			message = "La unidad de propiedad es requerida"
		}

		h.logger.Error(ctx).Err(err).Uint("business_id", businessID).Interface("filters", filters).Msg("Error listando unidades")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: message,
			Error:   err.Error(),
		})
		return
	}

	// Log de éxito
	h.logger.Info(ctx).Int64("total_units", result.Total).Int("page", result.Page).Int("page_size", result.PageSize).Msg("Unidades de propiedad listadas exitosamente")

	responseData := mapper.MapPaginatedDTOToResponse(result)
	c.JSON(http.StatusOK, response.PropertyUnitsSuccess{
		Success: true,
		Message: "Unidades obtenidas exitosamente",
		Data:    responseData,
	})
}
