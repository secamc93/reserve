package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// GeneratePublicVotingURLRequest - Request para generar URL pública
type GeneratePublicVotingURLRequest struct {
	DurationHours int    `json:"duration_hours" example:"24"`                                           // Duración del token en horas
	FrontendURL   string `json:"frontend_url,omitempty" example:"https://votacion.miconjunto.com/vote"` // URL base del frontend (opcional, usa URL_BASE_SWAGGER + /public/vote si está vacío)
}

// GeneratePublicVotingURL godoc
//
//	@Summary		Generar URL pública para votación con QR
//	@Description	Genera una URL con token especial para compartir vía QR y permitir votación pública. La URL se construye usando: 1) frontend_url del request, o 2) URL_BASE_SWAGGER + /public/vote
//	@Tags			Votaciones
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			hp_id		path		int									true	"ID de la propiedad horizontal"
//	@Param			group_id	path		int									true	"ID del grupo de votación"
//	@Param			voting_id	path		int									true	"ID de la votación"
//	@Param			request		body		GeneratePublicVotingURLRequest	true	"Configuración de la URL"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/generate-public-url [post]
func (h *VotingHandler) GeneratePublicVotingURL(c *gin.Context) {
	votingIDParam := c.Param("voting_id")
	votingID, err := strconv.ParseUint(votingIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/generate-public-voting-url.go - Error parseando ID: %v\n", err)
		h.logger.Error().Err(err).Str("voting_id", votingIDParam).Msg("Error parseando ID de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de votación inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	hpIDParam := c.Param("hp_id")
	hpID, err := strconv.ParseUint(hpIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/generate-public-voting-url.go - Error parseando HP ID: %v\n", err)
		h.logger.Error().Err(err).Str("hp_id", hpIDParam).Msg("Error parseando ID de propiedad horizontal")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de propiedad horizontal inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	groupIDParam := c.Param("group_id")
	groupID, err := strconv.ParseUint(groupIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/generate-public-voting-url.go - Error parseando group ID: %v\n", err)
		h.logger.Error().Err(err).Str("group_id", groupIDParam).Msg("Error parseando ID de grupo de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de grupo de votación inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	var req GeneratePublicVotingURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/generate-public-voting-url.go - Error validando request: %v\n", err)
		h.logger.Error().Err(err).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
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

	// Generar token de votación pública
	jwtService := sharedjwt.New(h.jwtSecret)
	token, err := jwtService.GeneratePublicVotingToken(uint(votingID), uint(groupID), uint(hpID), req.DurationHours)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/generate-public-voting-url.go - Error generando token: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", uint(votingID)).Msg("Error generando token de votación pública")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error generando URL de votación",
			Error:   err.Error(),
		})
		return
	}

	// Construir URL completa (solo token, toda la info está dentro)
	publicURL := fmt.Sprintf("%s?token=%s", req.FrontendURL, token)

	// Log detallado
	tokenPreview := token
	if len(token) > 20 {
		tokenPreview = token[:20] + "..."
	}
	h.logger.Info().
		Uint("hp_id", uint(hpID)).
		Uint("voting_group_id", uint(groupID)).
		Uint("voting_id", uint(votingID)).
		Int("duration_hours", req.DurationHours).
		Str("frontend_url", req.FrontendURL).
		Str("token_preview", tokenPreview).
		Str("public_url", publicURL).
		Msg("✅ [VOTACION PUBLICA] URL y token generados exitosamente")

	fmt.Printf("\n🔗 [VOTACION PUBLICA - GENERACION URL]\n")
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Grupo de Votación ID: %d\n", groupID)
	fmt.Printf("   Votación ID: %d\n", votingID)
	fmt.Printf("   Duración: %d horas\n", req.DurationHours)
	fmt.Printf("   URL Pública: %s\n", publicURL)
	fmt.Printf("   Token (preview): %s\n\n", tokenPreview)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "URL de votación pública generada exitosamente",
		"data": gin.H{
			"public_url":       publicURL,
			"token":            token,
			"voting_id":        votingID,
			"voting_group_id":  groupID,
			"hp_id":            hpID,
			"expires_in_hours": req.DurationHours,
		},
	})
}
