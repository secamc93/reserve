package handlerpropertyunit

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/response"

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
//	@Param			hp_id	path		int									true	"ID de la propiedad horizontal"
//	@Param			unit	body		request.CreatePropertyUnitRequest	true	"Datos de la unidad"
//	@Success		201		{object}	object
//	@Failure		400		{object}	object
//	@Failure		409		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/{hp_id}/property-units [post]
func (h *PropertyUnitHandler) CreatePropertyUnit(c *gin.Context) {
	hpIDParam := c.Param("hp_id")
	hpID, err := strconv.ParseUint(hpIDParam, 10, 32)
	if err != nil {
		fmt.Printf("[ERROR] CreatePropertyUnit - Error parseando ID: hp_id=%s, error=%v\n", hpIDParam, err)
		h.logger.Error().Err(err).Str("hp_id", hpIDParam).Msg("Error parseando ID de propiedad horizontal")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de propiedad horizontal inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	var req request.CreatePropertyUnitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/create-property-unit.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := mapper.MapCreateRequestToDTO(req, uint(hpID))
	created, err := h.useCase.CreatePropertyUnit(c.Request.Context(), dto)
	if err != nil {
		status := http.StatusInternalServerError
		if err == domain.ErrPropertyUnitNumberExists {
			status = http.StatusConflict
		} else if err == domain.ErrPropertyUnitNumberRequired {
			status = http.StatusBadRequest
		}

		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/create-property-unit.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("hp_id", uint(hpID)).Str("number", req.Number).Msg("Error creando unidad de propiedad")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: "No se pudo crear la unidad",
			Error:   err.Error(),
		})
		return
	}

	responseData := mapper.MapDetailDTOToResponse(created)
	c.JSON(http.StatusCreated, response.PropertyUnitSuccess{
		Success: true,
		Message: "Unidad creada exitosamente",
		Data:    responseData,
	})
}
