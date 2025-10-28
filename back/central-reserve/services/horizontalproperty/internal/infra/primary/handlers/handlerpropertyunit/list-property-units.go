package handlerpropertyunit

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/auth/middleware"
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

	// Verificar si es super admin para manejar business_id
	isSuperAdmin := middleware.IsSuperAdmin(c)

	// Para super admin, hp_id puede ser 0 para ver todas las properties
	// Para usuarios normales, usa solo el hp_id del path o del token
	var businessID uint = uint(hpID)

	if !isSuperAdmin {
		// Usuario normal: verificar que tenga acceso a este business
		tokenBusinessID, exists := middleware.GetBusinessID(c)
		if exists && tokenBusinessID != uint(hpID) {
			c.JSON(http.StatusForbidden, response.ErrorResponse{
				Success: false,
				Message: "No tiene acceso a este business",
				Error:   "El business_id del token no coincide con el hp_id solicitado",
			})
			return
		}
	}

	filters := mapper.MapFiltersRequestToDTO(req, businessID)
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

// ListPropertyUnitsQuery godoc
//
//	@Summary		Listar unidades de propiedad (hp_id opcional)
//	@Description	Obtiene lista paginada de unidades; si el usuario es super admin y no envía hp_id, verá todas
//	@Tags			Property Units
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			hp_id		query	int	false	"ID de la propiedad horizontal (opcional; si se omite y es super admin, ve todo)"
//	@Param			number		query	string	false	"Filtrar por número de unidad (búsqueda parcial)"
//	@Param			unit_type	query	string	false	"Tipo de unidad (apartment, house, office)"
//	@Param			floor		query	int	false	"Número de piso"
//	@Param			block		query	string	false	"Bloque/Torre"
//	@Param			is_active	query	bool	false	"Estado activo"
//	@Param			page		query	int	false	"Página"\t\t\tdefault(1)
//	@Param			page_size	query	int	false	"Tamaño de página"\tdefault(10)
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/property-units [get]
func (h *PropertyUnitHandler) ListPropertyUnitsQuery(c *gin.Context) {
	// hp_id como query opcional
	hpIDParam := c.Query("hp_id")

	var hpID uint64
	var err error
	if hpIDParam != "" {
		hpID, err = strconv.ParseUint(hpIDParam, 10, 32)
		if err != nil {
			h.logger.Error().Err(err).Str("hp_id", hpIDParam).Msg("Error parseando hp_id (query)")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "hp_id inválido", Error: "Debe ser numérico"})
			return
		}
	}

	var req request.PropertyUnitFiltersRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error validando parámetros de búsqueda")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Parámetros de búsqueda inválidos", Error: err.Error()})
		return
	}

	// Verificar super admin y decidir businessID (hp_id)
	isSuperAdmin := middleware.IsSuperAdmin(c)

	var businessID uint
	if isSuperAdmin {
		// Si no envía hp_id, ver todo (business_id = 0)
		businessID = uint(hpID)
	} else {
		// Usuario normal: usar business_id del token y opcionalmente validar si manda hp_id distinto
		tokenBusinessID, exists := middleware.GetBusinessID(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "Token inválido", Error: "business_id no disponible"})
			return
		}
		if hpIDParam != "" && uint(hpID) != tokenBusinessID {
			c.JSON(http.StatusForbidden, response.ErrorResponse{Success: false, Message: "No tiene acceso a este business", Error: "El business_id del token no coincide con el hp_id solicitado"})
			return
		}
		businessID = tokenBusinessID
	}

	filters := mapper.MapFiltersRequestToDTO(req, businessID)
	result, err := h.useCase.ListPropertyUnits(c.Request.Context(), filters)
	if err != nil {
		h.logger.Error().Err(err).Uint("business_id", businessID).Interface("filters", filters).Msg("Error listando unidades")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando unidades", Error: err.Error()})
		return
	}

	responseData := mapper.MapPaginatedDTOToResponse(result)
	c.JSON(http.StatusOK, response.PropertyUnitsSuccess{Success: true, Message: "Unidades obtenidas exitosamente", Data: responseData})
}
