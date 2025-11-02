package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	sharedjwt "central_reserve/shared/jwt"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GeneratePublicVotingURLRequest - Request para generar URL pública
type GeneratePublicVotingURLRequest struct {
	DurationHours int    `json:"duration_hours" example:"24"`                                           // Duración del token en horas
	FrontendURL   string `json:"frontend_url,omitempty" example:"https://votacion.miconjunto.com/vote"` // URL base del frontend (opcional, usa URL_BASE_SWAGGER + /public/vote si está vacío)
	BusinessID    *uint  `json:"business_id,omitempty" example:"19"`                                    // ID del business (solo para super admin, opcional en body)
}

// GeneratePublicVotingURL godoc
//
//	@Summary		Generar URL pública para votación con QR
//	@Description	Genera una URL con token especial para compartir vía QR y permitir votación pública. La URL se construye usando: 1) frontend_url del request, o 2) URL_BASE_SWAGGER + /public/vote
//	@Tags			Votaciones
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			group_id		path		int									true	"ID del grupo de votación"
//	@Param			voting_id		path		int									true	"ID de la votación"
//	@Param			business_id		query		int									false	"ID del business (opcional para super admin, alternativo a body)"
//	@Param			request			body		GeneratePublicVotingURLRequest	true	"Configuración de la URL (business_id opcional en body para super admin)"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/generate-public-url [post]
func (h *VotingHandler) GeneratePublicVotingURL(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GeneratePublicVotingURL")

	// Primero parsear el body para ver si viene business_id
	var req GeneratePublicVotingURLRequest
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

	votingIDParam := c.Param("voting_id")
	votingID, err := strconv.ParseUint(votingIDParam, 10, 32)
	if err != nil {
		h.logger.Error(ctx).Err(err).Str("voting_id", votingIDParam).Msg("Error parseando ID de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de votación inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

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

	// Generar token de votación pública
	jwtService := sharedjwt.New(h.jwtSecret)
	token, err := jwtService.GeneratePublicVotingToken(uint(votingID), uint(groupID), businessID, req.DurationHours)
	if err != nil {
		h.logger.Error(ctx).Err(err).Uint("voting_id", uint(votingID)).Msg("Error generando token de votación pública")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error generando URL de votación",
			Error:   err.Error(),
		})
		return
	}

	// Construir URL completa (solo token, toda la info está dentro)
	publicURL := fmt.Sprintf("%s?token=%s", req.FrontendURL, token)

	h.logger.Info(ctx).
		Uint("business_id", businessID).
		Uint("voting_group_id", uint(groupID)).
		Uint("voting_id", uint(votingID)).
		Int("duration_hours", req.DurationHours).
		Str("public_url", publicURL).
		Msg("✅ URL de votación pública generada")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "URL de votación pública generada exitosamente",
		"data": gin.H{
			"public_url":       publicURL,
			"token":            token,
			"voting_id":        votingID,
			"voting_group_id":  groupID,
			"hp_id":            businessID,
			"expires_in_hours": req.DurationHours,
		},
	})
}
