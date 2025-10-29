package handlerresident

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateResident godoc
//
//	@Summary		Crear residente
//	@Description	Crea un nuevo residente en una propiedad horizontal
//	@Tags			Residents
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			resident	body		request.CreateResidentRequest	true	"Datos del residente"
//	@Success		201			{object}	object
//	@Failure		400			{object}	object
//	@Failure		409			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/residents [post]
func (h *ResidentHandler) CreateResident(c *gin.Context) {
	// Configurar contexto de logging
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CreateResident")

	var req request.CreateResidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
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
				Error:   "Debe tener business_id en el token para crear residentes",
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

	// Agregar business_id al contexto para logging
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	h.logger.Info(ctx).Bool("is_super_admin", isSuperAdmin).Str("email", req.Email).Str("dni", req.Dni).Msg("Creando residente")

	dto := mapper.MapCreateRequestToDTO(req, businessID)
	created, err := h.useCase.CreateResident(ctx, dto)
	if err != nil {
		status := http.StatusInternalServerError
		message := "No se pudo crear el residente"

		// Mapear errores específicos del caso de uso
		switch err {
		case domain.ErrResidentEmailExists:
			status = http.StatusConflict
			message = "Ya existe un residente con este email"
		case domain.ErrResidentDniExists:
			status = http.StatusConflict
			message = "Ya existe un residente con este DNI"
		case domain.ErrResidentNameRequired:
			status = http.StatusBadRequest
			message = "El nombre del residente es requerido"
		case domain.ErrResidentEmailRequired:
			status = http.StatusBadRequest
			message = "El email del residente es requerido"
		case domain.ErrResidentDniRequired:
			status = http.StatusBadRequest
			message = "El DNI del residente es requerido"
		}

		h.logger.Error(ctx).Err(err).Str("email", req.Email).Str("dni", req.Dni).Msg("Error creando residente")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: message,
			Error:   err.Error(),
		})
		return
	}

	h.logger.Info(ctx).Uint("resident_id", created.ID).Str("email", created.Email).Str("dni", created.Dni).Msg("Residente creado exitosamente")
	responseData := mapper.MapDetailDTOToResponse(created)
	c.JSON(http.StatusCreated, response.ResidentSuccess{
		Success: true,
		Message: "Residente creado exitosamente",
		Data:    responseData,
	})
}
