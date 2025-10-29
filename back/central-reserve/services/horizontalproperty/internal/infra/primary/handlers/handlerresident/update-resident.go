package handlerresident

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
	"central_reserve/shared/log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// UpdateResident godoc
//
//	@Summary		Actualizar residente
//	@Description	Actualiza los datos de un residente existente
//	@Tags			Residents
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			resident_id	path		int								true	"ID del residente"
//	@Param			resident	body		request.UpdateResidentRequest	true	"Datos actualizados"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		404			{object}	object
//	@Failure		409			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/residents/{resident_id} [put]
func (h *ResidentHandler) UpdateResident(c *gin.Context) {
	// Configurar contexto de logging
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "UpdateResident")

	resIDParam := c.Param("resident_id")
	resID, err := strconv.ParseUint(resIDParam, 10, 32)
	if err != nil {
		h.logger.Error(ctx).Err(err).Str("resident_id", resIDParam).Msg("Error parseando ID de residente")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	var req request.UpdateResidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error(ctx).Err(err).Uint("resident_id", uint(resID)).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
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

	h.logger.Info(ctx).Uint("resident_id", uint(resID)).Bool("is_super_admin", isSuperAdmin).Msg("Actualizando residente")

	dto := mapper.MapUpdateRequestToDTO(req)
	updated, err := h.useCase.UpdateResident(ctx, uint(resID), dto)
	if err != nil {
		status := http.StatusInternalServerError
		message := "No se pudo actualizar el residente"

		// Mapear errores específicos del caso de uso
		switch err {
		case domain.ErrResidentNotFound:
			status = http.StatusNotFound
			message = "Residente no encontrado"
		case domain.ErrResidentEmailExists:
			status = http.StatusConflict
			message = "Ya existe un residente con este email"
		case domain.ErrResidentDniExists:
			status = http.StatusConflict
			message = "Ya existe un residente con este DNI"
		}

		h.logger.Error(ctx).Err(err).Uint("resident_id", uint(resID)).Interface("dto", dto).Msg("Error actualizando residente")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: message,
			Error:   err.Error(),
		})
		return
	}

	h.logger.Info(ctx).Uint("resident_id", uint(resID)).Str("email", updated.Email).Str("dni", updated.Dni).Msg("Residente actualizado exitosamente")
	responseData := mapper.MapDetailDTOToResponse(updated)
	c.JSON(http.StatusOK, response.ResidentSuccess{
		Success: true,
		Message: "Residente actualizado exitosamente",
		Data:    responseData,
	})
}
