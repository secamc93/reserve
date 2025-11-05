package handlerpropertyunit

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// DeletePropertyUnit godoc
//
//	@Summary		Eliminar unidad de propiedad
//	@Description	Elimina (soft delete) una unidad de propiedad
//	@Tags			Property Units
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			unit_id	path		int	true	"ID de la unidad"
//	@Success		200		{object}	object
//	@Failure		404		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/property-units/{unit_id} [delete]
func (h *PropertyUnitHandler) DeletePropertyUnit(c *gin.Context) {
	// Configurar contexto de logging una sola vez para toda la función
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "DeletePropertyUnit")

	unitIDParam := c.Param("unit_id")
	unitID, err := strconv.ParseUint(unitIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/delete-property-unit.go - Error en handler: %v\n", err)
		h.logger.Error(ctx).Err(err).Str("unit_id", unitIDParam).Msg("Error parseando ID de unidad")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de unidad inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	// Verificar acceso según business_id del token
	isSuperAdmin := middleware.IsSuperAdmin(c)
	if !isSuperAdmin {
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
		// Agregar business_id al contexto para filtrado
		ctx = log.WithBusinessIDCtx(ctx, tokenBusinessID)
	}

	// Log de inicio de operación
	h.logger.Info(ctx).Uint("unit_id", uint(unitID)).Msg("Iniciando eliminación de unidad de propiedad")

	err = h.useCase.DeletePropertyUnit(ctx, uint(unitID))
	if err != nil {
		status := http.StatusInternalServerError
		message := "No se pudo eliminar la unidad"

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

		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/delete-property-unit.go - Error en handler: %v\n", err)
		h.logger.Error(ctx).Err(err).Uint("unit_id", uint(unitID)).Msg("Error eliminando unidad de propiedad")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: message,
			Error:   err.Error(),
		})
		return
	}

	// Log de éxito
	h.logger.Info(ctx).Uint("unit_id", uint(unitID)).Msg("Unidad de propiedad eliminada exitosamente")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Unidad eliminada exitosamente",
	})
}
