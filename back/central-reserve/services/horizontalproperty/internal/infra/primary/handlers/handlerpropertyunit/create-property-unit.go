package handlerpropertyunit

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CreatePropertyUnit godoc
//
//	@Summary		Crear unidad de propiedad
//	@Description	Crea una nueva unidad de propiedad (apartamento/casa) en una propiedad horizontal
//	@Tags			Property Units
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			unit	body		request.CreatePropertyUnitRequest	true	"Datos de la unidad"
//	@Success		201		{object}	object
//	@Failure		400		{object}	object
//	@Failure		409		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/property-units [post]
func (h *PropertyUnitHandler) CreatePropertyUnit(c *gin.Context) {
	// Configurar contexto de logging una sola vez para toda la función
	ctx := c.Request.Context()

	// Agregar función específica al contexto (una sola vez)
	ctx = log.WithFunctionCtx(ctx, "CreatePropertyUnit")

	var req request.CreatePropertyUnitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/create-property-unit.go - Error en handler: %v\n", err)
		h.logger.Error(ctx).Err(err).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Determinar business_id según token y rol (super admin)
	isSuperAdmin := middleware.IsSuperAdmin(c)
	tokenBusinessID, exists := middleware.GetBusinessID(c)

	var businessID uint
	if isSuperAdmin {
		// Super admin: puede usar el business_id del token o debe especificarlo en el body
		if exists && tokenBusinessID != 0 {
			businessID = tokenBusinessID
		} else {
			h.logger.Error(ctx).Msg("business_id requerido para super admin")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "business_id requerido",
				Error:   "Debe tener business_id en el token para crear unidades",
			})
			return
		}
	} else {
		// Usuario normal: business_id siempre del token
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

	// Agregar business_id al contexto
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	// Log de inicio de operación
	h.logger.Info(ctx).Str("number", req.Number).Str("unit_type", req.UnitType).Msg("Iniciando creación de unidad de propiedad")

	dto := mapper.MapCreateRequestToDTO(req, businessID)
	created, err := h.useCase.CreatePropertyUnit(ctx, dto)
	if err != nil {
		status := http.StatusInternalServerError
		message := "No se pudo crear la unidad"

		// Mapear errores específicos del caso de uso
		switch err {
		case domain.ErrPropertyUnitNumberExists:
			status = http.StatusConflict
			message = "Ya existe una unidad con este número"
		case domain.ErrPropertyUnitNumberRequired:
			status = http.StatusBadRequest
			message = "El número de unidad es requerido"
		case domain.ErrPropertyUnitNotFound:
			status = http.StatusNotFound
			message = "Unidad de propiedad no encontrada"
		case domain.ErrPropertyUnitHasResidents:
			status = http.StatusConflict
			message = "No se puede eliminar una unidad que tiene residentes"
		case domain.ErrPropertyUnitRequired:
			status = http.StatusBadRequest
			message = "La unidad de propiedad es requerida"
		}

		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/create-property-unit.go - Error en handler: %v\n", err)
		h.logger.Error(ctx).Err(err).Str("number", req.Number).Uint("business_id", businessID).Msg("Error creando unidad de propiedad")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: message,
			Error:   err.Error(),
		})
		return
	}

	// Log de éxito
	h.logger.Info(ctx).Uint("created_unit_id", created.ID).Str("number", req.Number).Msg("Unidad de propiedad creada exitosamente")

	responseData := mapper.MapDetailDTOToResponse(created)
	c.JSON(http.StatusCreated, response.PropertyUnitSuccess{
		Success: true,
		Message: "Unidad creada exitosamente",
		Data:    responseData,
	})
}
