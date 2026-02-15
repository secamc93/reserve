package handlerpublic

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"
	sharedjwt "central_reserve/shared/jwt"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GeneratePublicGroupURLRequest - Request para generar URL pública de grupo
type GeneratePublicGroupURLRequest struct {
	DurationHours int    `json:"duration_hours" example:"24"`                                           // Duración del token en horas
	FrontendURL   string `json:"frontend_url,omitempty" example:"https://votacion.miconjunto.com/vote"` // URL base del frontend (opcional, usa URL_BASE_SWAGGER + /public/vote si está vacío)
	BusinessID    *uint  `json:"business_id,omitempty" example:"19"`                                    // ID del business (solo para super admin, opcional en body)
}

// GeneratePublicGroupURL godoc
//
//	@Summary		Generar URL pública para grupo de votación con QR
//	@Description	Genera una URL con token especial para compartir vía QR y permitir votación en todas las votaciones del grupo. La URL se construye usando: 1) frontend_url del request, o 2) URL_BASE_SWAGGER + /public/vote
//	@Tags			Votaciones
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			group_id		path		int									true	"ID del grupo de votación"
//	@Param			business_id		query		int									false	"ID del business (opcional para super admin, alternativo a body)"
//	@Param			request			body		GeneratePublicGroupURLRequest	true	"Configuración de la URL (business_id opcional en body para super admin)"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/voting-groups/{group_id}/generate-public-url [post]
func (h *PublicHandler) GeneratePublicGroupURL(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GeneratePublicGroupURL")

	// Parsear el body
	var req GeneratePublicGroupURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Obtener business_id: del body (si existe y es super admin), del query (super admin) o del token (usuarios normales)
	isSuperAdmin := middleware.IsSuperAdmin(c)
	var businessID uint

	if isSuperAdmin {
		// Super admin: puede venir en body o query param
		if req.BusinessID != nil && *req.BusinessID > 0 {
			businessID = *req.BusinessID
		} else {
			q := c.Query("business_id")
			if q == "" {
				h.logger.Error(ctx).Msg("business_id requerido para super admin")
				c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id requerido", Error: "Proporcione business_id en body o query param"})
				return
			}
			id64, err := strconv.ParseUint(q, 10, 32)
			if err != nil || id64 == 0 {
				h.logger.Error(ctx).Str("business_id", q).Msg("Business ID inválido")
				c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id inválido", Error: "Debe ser numérico y > 0"})
				return
			}
			businessID = uint(id64)
		}
	} else {
		// Usuario normal: del token
		bid, ok := middleware.GetBusinessID(c)
		if !ok || bid == 0 {
			h.logger.Error(ctx).Msg("Business ID no disponible en token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "token inválido", Error: "business_id no encontrado"})
			return
		}
		businessID = bid
	}

	// Obtener y validar group_id
	groupIDParam := c.Param("group_id")
	groupID, err := strconv.ParseUint(groupIDParam, 10, 32)
	if err != nil {
		h.logger.Error(ctx).Err(err).Str("group_id", groupIDParam).Msg("Error parseando ID de grupo de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de grupo de votación inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	// Verificar que el grupo existe y pertenece al business
	group, err := h.votingGroupsUseCase.GetVotingGroupByID(ctx, uint(groupID))
	if err != nil {
		h.logger.Error(ctx).Err(err).Uint("group_id", uint(groupID)).Msg("Error obteniendo grupo de votación")
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Grupo de votación no encontrado",
			Error:   err.Error(),
		})
		return
	}

	// Validar que el grupo pertenece al business
	if group.BusinessID != businessID {
		h.logger.Error(ctx).
			Uint("group_id", uint(groupID)).
			Uint("group_business_id", group.BusinessID).
			Uint("requested_business_id", businessID).
			Msg("Grupo no pertenece al business")
		c.JSON(http.StatusForbidden, response.ErrorResponse{
			Success: false,
			Message: "No autorizado para este grupo",
			Error:   "El grupo no pertenece al business especificado",
		})
		return
	}

	// Contar votaciones del grupo
	votings, err := h.votingsUseCase.ListVotingsByGroup(ctx, uint(groupID))
	if err != nil {
		h.logger.Error(ctx).Err(err).Uint("group_id", uint(groupID)).Msg("Error obteniendo votaciones del grupo")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo votaciones del grupo",
			Error:   err.Error(),
		})
		return
	}

	// Defaults
	if req.DurationHours <= 0 {
		req.DurationHours = 24
	}
	if req.FrontendURL == "" {
		// Usar URL_BASE_SWAGGER como base
		baseURL := os.Getenv("URL_BASE_SWAGGER")
		if baseURL == "" {
			baseURL = "http://localhost:3050" // Default para desarrollo
		}
		req.FrontendURL = baseURL + "/public/vote"
	}

	// Generar token de grupo de votación pública
	jwtService := sharedjwt.New(h.jwtSecret)
	token, err := jwtService.GeneratePublicGroupVotingToken(uint(groupID), businessID, req.DurationHours)
	if err != nil {
		h.logger.Error(ctx).Err(err).Uint("group_id", uint(groupID)).Msg("Error generando token de grupo de votación")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error generando URL de grupo de votación",
			Error:   err.Error(),
		})
		return
	}

	// Construir URL completa
	publicURL := fmt.Sprintf("%s?token=%s", req.FrontendURL, token)

	h.logger.Info(ctx).
		Uint("business_id", businessID).
		Uint("voting_group_id", uint(groupID)).
		Int("votings_count", len(votings)).
		Int("duration_hours", req.DurationHours).
		Str("public_url", publicURL).
		Msg("✅ URL de grupo de votación pública generada")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "URL de grupo de votación pública generada exitosamente",
		"data": gin.H{
			"public_url":       publicURL,
			"token":            token,
			"voting_group_id":  groupID,
			"hp_id":            businessID,
			"expires_in_hours": req.DurationHours,
			"votings_count":    len(votings),
			"group_name":       group.Name,
		},
	})
}
