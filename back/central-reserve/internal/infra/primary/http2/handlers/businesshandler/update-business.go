package businesshandler

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/infra/primary/http2/handlers/businesshandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/businesshandler/response"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// UpdateBusinessHandler maneja la solicitud de actualizar un negocio
// @Summary Actualizar negocio
// @Description Actualiza un negocio existente con los datos proporcionados. Soporta carga de logo (logoFile).
// @Tags Business
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID del negocio"
// @Param name formData string false "Nombre"
// @Param code formData string false "Código"
// @Param business_type_id formData int false "Tipo de negocio ID"
// @Param timezone formData string false "Zona horaria"
// @Param address formData string false "Dirección"
// @Param description formData string false "Descripción"
// @Param logo_url formData string false "URL del logo (opcional si se usa logoFile)"
// @Param logoFile formData file false "Logo del negocio"
// @Param primary_color formData string false "Color primario"
// @Param secondary_color formData string false "Color secundario"
// @Param custom_domain formData string false "Dominio personalizado"
// @Param is_active formData boolean false "¿Activo?"
// @Param enable_delivery formData boolean false "Habilitar domicilios"
// @Param enable_pickup formData boolean false "Habilitar recoger"
// @Param enable_reservations formData boolean false "Habilitar reservas"
// @Success 200 {object} response.BusinessSuccessResponse "Negocio actualizado exitosamente"
// @Failure 400 {object} response.BusinessErrorResponse "Datos inválidos o ID inválido"
// @Failure 401 {object} response.BusinessErrorResponse "Token de acceso requerido"
// @Failure 404 {object} response.BusinessErrorResponse "Negocio no encontrado"
// @Failure 409 {object} response.BusinessErrorResponse "Código o dominio ya existe"
// @Failure 500 {object} response.BusinessErrorResponse "Error interno del servidor"
// @Router /businesses/{id} [put]
func (h *BusinessHandler) UpdateBusinessHandler(c *gin.Context) {
	// Obtener ID del path parameter
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("id", idStr).Msg("ID inválido")
		c.JSON(http.StatusBadRequest, response.BusinessErrorResponse{
			Success: false,
			Error:   "invalid_id",
			Message: "ID inválido",
		})
		return
	}

	// Leer form multipart con campos opcionales
	var form struct {
		Name               string `form:"name"`
		Code               string `form:"code"`
		BusinessTypeID     uint   `form:"business_type_id"`
		Timezone           string `form:"timezone"`
		Address            string `form:"address"`
		Description        string `form:"description"`
		LogoURL            string `form:"logo_url"`
		PrimaryColor       string `form:"primary_color"`
		SecondaryColor     string `form:"secondary_color"`
		CustomDomain       string `form:"custom_domain"`
		IsActive           *bool  `form:"is_active"`
		EnableDelivery     *bool  `form:"enable_delivery"`
		EnablePickup       *bool  `form:"enable_pickup"`
		EnableReservations *bool  `form:"enable_reservations"`
	}
	if err := c.ShouldBind(&form); err != nil {
		h.logger.Error().Err(err).Msg("Error al validar datos del request")
		c.JSON(http.StatusBadRequest, response.BusinessErrorResponse{
			Success: false,
			Error:   "invalid_data",
			Message: "Datos inválidos: " + err.Error(),
		})
		return
	}

	// Archivo opcional
	file, _ := c.FormFile("logoFile")

	// Construir DTO de actualización con punteros
	upd := dtos.UpdateBusinessRequest{}
	if form.Name != "" {
		upd.Name = &form.Name
	}
	if form.Code != "" {
		upd.Code = &form.Code
	}
	if form.BusinessTypeID != 0 {
		upd.BusinessTypeID = &form.BusinessTypeID
	}
	if form.Timezone != "" {
		upd.Timezone = &form.Timezone
	}
	if form.Address != "" {
		upd.Address = &form.Address
	}
	if form.Description != "" {
		upd.Description = &form.Description
	}
	if form.LogoURL != "" {
		upd.LogoURL = &form.LogoURL
	}
	if form.PrimaryColor != "" {
		upd.PrimaryColor = &form.PrimaryColor
	}
	if form.SecondaryColor != "" {
		upd.SecondaryColor = &form.SecondaryColor
	}
	if form.CustomDomain != "" {
		upd.CustomDomain = &form.CustomDomain
	}
	if form.IsActive != nil {
		upd.IsActive = form.IsActive
	}
	if form.EnableDelivery != nil {
		upd.EnableDelivery = form.EnableDelivery
	}
	if form.EnablePickup != nil {
		upd.EnablePickup = form.EnablePickup
	}
	if form.EnableReservations != nil {
		upd.EnableReservations = form.EnableReservations
	}
	if file != nil {
		upd.LogoFile = file
	}

	ctx := c.Request.Context()

	// Ejecutar caso de uso
	business, err := h.usecase.UpdateBusiness(ctx, uint(id), upd)
	if err != nil {
		h.logger.Error().Err(err).Uint("id", uint(id)).Msg("Error al actualizar negocio")

		// Determinar el código de estado HTTP apropiado
		statusCode := http.StatusInternalServerError
		errorMessage := "Error interno del servidor"

		if err.Error() == "negocio no encontrado" {
			statusCode = http.StatusNotFound
			errorMessage = "Negocio no encontrado"
		} else if strings.Contains(err.Error(), "ya existe") {
			statusCode = http.StatusConflict
		}

		c.JSON(statusCode, response.BusinessErrorResponse{
			Success: false,
			Error:   "update_failed",
			Message: errorMessage,
		})
		return
	}

	businessResponse := mapper.ToBusinessResponse(*business)

	h.logger.Info().Uint("id", uint(id)).Msg("Negocio actualizado exitosamente")
	c.JSON(http.StatusOK, response.BusinessSuccessResponse{
		Success: true,
		Message: "Negocio actualizado exitosamente",
		Data:    businessResponse,
	})
}
