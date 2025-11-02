package horizontalpropertyhandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// UpdateHorizontalProperty godoc
//
//	@Summary		Actualizar propiedad horizontal
//	@Description	Actualiza una propiedad horizontal existente (actualización parcial, soporta cambio de imágenes)
//	@Tags			Propiedades Horizontales
//	@Accept			multipart/form-data
//	@Produce		json
//	@Security		BearerAuth
//	@Param			name				formData	string	false	"Nombre de la propiedad"
//	@Param			code				formData	string	false	"Código único"
//	@Param			address				formData	string	false	"Dirección"
//	@Param			description			formData	string	false	"Descripción"
//	@Param			timezone			formData	string	false	"Zona horaria"
//	@Param			total_units			formData	int		false	"Total de unidades"
//	@Param			total_floors		formData	int		false	"Total de pisos"
//	@Param			has_elevator		formData	bool	false	"¿Tiene ascensor?"
//	@Param			has_parking			formData	bool	false	"¿Tiene parqueadero?"
//	@Param			has_pool			formData	bool	false	"¿Tiene piscina?"
//	@Param			has_gym				formData	bool	false	"¿Tiene gimnasio?"
//	@Param			has_social_area		formData	bool	false	"¿Tiene área social?"
//	@Param			logo_file			formData	file	false	"Nuevo logo (reemplaza el anterior)"
//	@Param			navbar_image_file	formData	file	false	"Nueva imagen del navbar (reemplaza la anterior)"
//	@Param			primary_color		formData	string	false	"Color primario (hex)"
//	@Param			secondary_color		formData	string	false	"Color secundario (hex)"
//	@Param			tertiary_color		formData	string	false	"Color terciario (hex)"
//	@Param			quaternary_color	formData	string	false	"Color cuaternario (hex)"
//	@Param			custom_domain		formData	string	false	"Dominio personalizado"
//	@Param			is_active			formData	bool	false	"Estado activo"
//	@Success		200					{object}	response.HorizontalPropertySuccessResponse
//	@Failure		400					{object}	object
//	@Failure		404					{object}	object
//	@Failure		409					{object}	object
//	@Failure		500					{object}	object
//	@Router			/horizontal-properties/{business_id} [put]
func (h *HorizontalPropertyHandler) UpdateHorizontalProperty(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "UpdateHorizontalProperty")

	// Get ID from path parameter
	idParam := c.Param("business_id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		h.logger.Error(ctx).Err(err).Str("id_param", idParam).Msg("Error parsing ID parameter")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
			Error:   "El ID debe ser un número válido",
		})
		return
	}

	// Verificar acceso: super admin puede actualizar cualquier propiedad, usuario normal solo la suya
	isSuperAdmin := middleware.IsSuperAdmin(c)
	if !isSuperAdmin {
		tokenBusinessID, exists := middleware.GetBusinessID(c)
		if !exists {
			h.logger.Error(ctx).Msg("Business ID no disponible en token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{
				Success: false,
				Message: "Token inválido",
				Error:   "business_id no disponible",
			})
			return
		}
		if uint(id) != tokenBusinessID {
			h.logger.Error(ctx).Uint("requested_id", uint(id)).Uint("token_business_id", tokenBusinessID).Msg("Acceso denegado: business_id no coincide")
			c.JSON(http.StatusForbidden, response.ErrorResponse{
				Success: false,
				Message: "No tiene acceso a esta propiedad",
				Error:   "El business_id del token no coincide con el solicitado",
			})
			return
		}
	}

	var req request.UpdateHorizontalPropertyRequest

	// Bind multipart/form-data request (incluye archivos)
	if err := c.ShouldBind(&req); err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error binding form-data request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos de entrada inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Validate request
	validate := validator.New()
	if err := validate.Struct(&req); err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error validating update request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Errores de validación",
			Error:   err.Error(),
		})
		return
	}

	// Map request to domain DTO
	dto := mapper.MapUpdateRequestToDTO(&req)

	// Call use case
	result, err := h.horizontalPropertyUseCase.UpdateHorizontalProperty(ctx, uint(id), dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Uint("id", uint(id)).Msg("Error updating horizontal property")

		// Handle specific domain errors
		switch err.Error() {
		case "propiedad horizontal no encontrada":
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Propiedad horizontal no encontrada",
				Error:   err.Error(),
			})
		case "ya existe una propiedad horizontal con este código":
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "El código de la propiedad horizontal ya existe",
				Error:   err.Error(),
			})
		case "el dominio personalizado ya está en uso":
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "El dominio personalizado ya está en uso",
				Error:   err.Error(),
			})
		case "el negocio padre especificado no existe":
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "El negocio padre especificado no existe",
				Error:   err.Error(),
			})
		default:
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{
				Success: false,
				Message: "Error interno del servidor",
				Error:   err.Error(),
			})
		}
		return
	}

	// Map domain DTO to response
	responseData := mapper.MapDTOToResponse(result)

	h.logger.Info(ctx).
		Uint("id", result.ID).
		Str("name", result.Name).
		Str("code", result.Code).
		Bool("is_super_admin", isSuperAdmin).
		Msg("Propiedad horizontal actualizada exitosamente")

	// Return success response
	c.JSON(http.StatusOK, response.HorizontalPropertySuccessResponse{
		Success: true,
		Message: "Propiedad horizontal actualizada exitosamente",
		Data:    *responseData,
	})
}
