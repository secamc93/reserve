package handlervote

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// GetPublicVotingStats godoc
//
//	@Summary		Obtener estadísticas de votación (público)
//	@Description	Obtiene las estadísticas completas de la votación: resultados por opción, total de votos, porcentajes. Toda la información viene del token.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			Authorization	header	string	true	"Token de autenticación de votación (Bearer token)"
//	@Success		200				{object}	object
//	@Failure		401				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/voting-stats [get]
func (h *VotingHandler) GetPublicVotingStats(c *gin.Context) {

	// Obtener y validar token de autenticación de votación
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-voting-stats.go - Token no proporcionado\n")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de autenticación requerido",
			Error:   "Debe proporcionar el token de autenticación de votación",
		})
		return
	}

	// Extraer token (remover "Bearer ")
	tokenString := authHeader
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	}

	jwtService := sharedjwt.New(h.jwtSecret)
	authClaims, err := jwtService.ValidateVotingAuthToken(tokenString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-voting-stats.go - Token inválido: %v\n", err)
		h.logger.Error().Err(err).Msg("Token de autenticación de votación inválido")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de autenticación inválido",
			Error:   err.Error(),
		})
		return
	}

	// Extraer información del token
	votingID := authClaims.VotingID
	residentID := authClaims.ResidentID
	hpID := authClaims.HPID

	fmt.Printf("\n📊 [VOTACION PUBLICA - OBTENIENDO DETALLE POR UNIDAD]\n")
	fmt.Printf("   Votación ID: %d\n", votingID)
	fmt.Printf("   Residente ID: %d\n", residentID)
	fmt.Printf("   HP ID: %d\n\n", hpID)

	// Obtener detalle por unidad (TODAS las unidades con su estado de votación)
	unitDetails, err := h.votingUseCase.GetVotingDetailsByUnit(c.Request.Context(), votingID, hpID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-voting-stats.go - Error obteniendo detalles: voting_id=%d, hp_id=%d, error=%v\n", votingID, hpID, err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Uint("hp_id", hpID).Msg("Error obteniendo detalles por unidad")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo detalles de votación",
			Error:   err.Error(),
		})
		return
	}

	// Obtener resumen de resultados (para el dashboard)
	results, err := h.votingUseCase.GetVotingResults(c.Request.Context(), votingID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-voting-stats.go - Error obteniendo resultados: voting_id=%d, error=%v\n", votingID, err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo estadísticas de votación")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo estadísticas",
			Error:   err.Error(),
		})
		return
	}

	// Calcular totales
	totalUnits := len(unitDetails)
	totalVoted := 0
	for _, detail := range unitDetails {
		if detail.HasVoted {
			totalVoted++
		}
	}
	totalVotes := 0
	for _, result := range results {
		totalVotes += result.VoteCount
	}

	resultsResponse := mapper.MapVotingResultsToResponses(results)
	unitsResponse := mapper.MapVotingDetailsByUnitToResponses(unitDetails)

	fmt.Printf("✅ [VOTACION PUBLICA - DETALLE OBTENIDO]\n")
	fmt.Printf("   Total de unidades: %d\n", totalUnits)
	fmt.Printf("   Unidades que votaron: %d\n", totalVoted)
	fmt.Printf("   Unidades pendientes: %d\n", totalUnits-totalVoted)
	fmt.Printf("   Total de votos: %d\n", totalVotes)
	fmt.Printf("   Opciones: %d\n", len(results))
	for _, result := range results {
		fmt.Printf("   - %s: %d votos (%.1f%%)\n", result.OptionText, result.VoteCount, result.Percentage)
	}
	fmt.Printf("\n")

	h.logger.Info().
		Uint("voting_id", votingID).
		Uint("resident_id", residentID).
		Uint("hp_id", hpID).
		Int("total_units", totalUnits).
		Int("units_voted", totalVoted).
		Int("total_votes", totalVotes).
		Msg("✅ [VOTACION PUBLICA] Detalle por unidad obtenido exitosamente")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Detalle de votación obtenido exitosamente",
		"data": gin.H{
			"units":         unitsResponse,
			"summary":       resultsResponse,
			"total_units":   totalUnits,
			"units_voted":   totalVoted,
			"units_pending": totalUnits - totalVoted,
			"total_votes":   totalVotes,
			"voting_id":     votingID,
		},
	})
}
