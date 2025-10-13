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

// GetPublicVotes godoc
//
//	@Summary		Listar votos de la votación (público)
//	@Description	Lista todos los votos emitidos. El frontend cruza con opciones y unidades.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			Authorization	header	string	true	"Token de autenticación de votación (Bearer token)"
//	@Success		200				{object}	object
//	@Failure		401				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/votes [get]
func (h *VotingHandler) GetPublicVotes(c *gin.Context) {

	// Obtener y validar token de autenticación de votación
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-votes.go - Token no proporcionado\n")
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
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-votes.go - Token inválido: %v\n", err)
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

	fmt.Printf("\n🗳️  [VOTACION PUBLICA - LISTANDO VOTOS]\n")
	fmt.Printf("   Votación ID: %d\n", votingID)
	fmt.Printf("   Residente ID: %d\n\n", residentID)

	// Obtener todos los votos de la votación
	votes, err := h.votingUseCase.ListVotesByVoting(c.Request.Context(), votingID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-votes.go - Error listando votos: voting_id=%d, error=%v\n", votingID, err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error listando votos")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo votos",
			Error:   err.Error(),
		})
		return
	}

	votesResponse := mapper.MapVoteDTOsToResponses(votes)

	fmt.Printf("✅ [VOTACION PUBLICA - VOTOS LISTADOS]\n")
	fmt.Printf("   Total de votos: %d\n\n", len(votes))

	h.logger.Info().
		Uint("voting_id", votingID).
		Uint("resident_id", residentID).
		Int("votes_count", len(votes)).
		Msg("✅ [VOTACION PUBLICA] Votos listados exitosamente")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Votos obtenidos exitosamente",
		"data":    votesResponse,
	})
}
