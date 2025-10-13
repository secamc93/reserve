package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// PublicSSEVotingResults godoc
//
//	@Summary		Stream público de resultados de votación en tiempo real (SSE)
//	@Description	Establece una conexión SSE para recibir votos en tiempo real. Toda la información viene del token.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		text/event-stream
//	@Param			Authorization	header	string	true	"Token de autenticación de votación (Bearer token)"
//	@Success		200				{string}	string	"Event stream"
//	@Failure		401				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/voting-stream [get]
func (h *VotingHandler) PublicSSEVotingResults(c *gin.Context) {

	// Obtener token desde query string (EventSource no soporta headers personalizados)
	tokenString := c.Query("token")
	if tokenString == "" {
		// Intentar desde header como fallback
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				tokenString = authHeader[7:]
			} else {
				tokenString = authHeader
			}
		}
	}

	if tokenString == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/public-sse-voting-results.go - Token no proporcionado\n")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de autenticación requerido",
			Error:   "Debe proporcionar el token como query param (?token=...) o en header Authorization",
		})
		return
	}

	jwtService := sharedjwt.New(h.jwtSecret)
	authClaims, err := jwtService.ValidateVotingAuthToken(tokenString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/public-sse-voting-results.go - Token inválido: %v\n", err)
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

	fmt.Printf("\n📡 [SSE PUBLICO] Nueva conexión SSE\n")
	fmt.Printf("   Votación ID: %d\n", votingID)
	fmt.Printf("   Residente ID: %d\n", residentID)
	fmt.Printf("   HP ID: %d\n\n", hpID)

	// Configurar headers para SSE
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("X-Accel-Buffering", "no")

	h.logger.Info().Uint("voting_id", uint(votingID)).Uint("resident_id", residentID).Msg("Cliente SSE público conectado")

	// Suscribirse al cache de votación
	voteChan, err := h.votingCache.Subscribe(c.Request.Context(), votingID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/public-sse-voting-results.go - Error suscribiéndose al cache: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error suscribiéndose al cache")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error suscribiéndose a la votación",
			Error:   err.Error(),
		})
		return
	}

	defer func() {
		fmt.Printf("📡 [SSE PUBLICO] Conexión cerrada para votación %d, residente %d\n", votingID, residentID)
	}()

	// Enviar evento de conexión establecida
	c.SSEvent("connected", gin.H{
		"message":     "Conectado al stream de votación",
		"voting_id":   votingID,
		"resident_id": residentID,
	})
	c.Writer.Flush()

	// Enviar datos iniciales (preload) - votos existentes
	existingVotes, err := h.votingUseCase.ListVotesByVoting(c.Request.Context(), votingID)
	if err == nil && len(existingVotes) > 0 {
		votesResponse := mapper.MapVoteDTOsToResponses(existingVotes)

		c.SSEvent("initial_data", gin.H{
			"votes": votesResponse,
		})
		c.Writer.Flush()

		fmt.Printf("📊 [SSE PUBLICO] Precarga enviada: %d votos existentes\n", len(existingVotes))
	} else {
		// Enviar array vacío si no hay votos
		c.SSEvent("initial_data", gin.H{
			"votes": []interface{}{},
		})
		c.Writer.Flush()
		fmt.Printf("📊 [SSE PUBLICO] Precarga enviada: 0 votos\n")
	}

	// Mantener conexión abierta y enviar eventos
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-c.Request.Context().Done():
			return
		case <-ticker.C:
			// Heartbeat (mantener conexión viva)
			c.SSEvent("heartbeat", gin.H{"timestamp": time.Now().Unix()})
			c.Writer.Flush()
		case vote, ok := <-voteChan:
			if !ok {
				// Canal cerrado
				return
			}

			// Nuevo voto recibido - enviar simple (frontend hace el cruce)
			voteResponse := mapper.MapVoteDTOToResponse(&vote)
			c.SSEvent("new_vote", voteResponse)
			c.Writer.Flush()

			fmt.Printf("🗳️  [SSE PUBLICO] Nuevo voto transmitido\n")
			fmt.Printf("   Residente ID: %d\n", vote.ResidentID)
			fmt.Printf("   Opción ID: %d\n", vote.VotingOptionID)
			fmt.Printf("   Votación ID: %d\n\n", votingID)
		}
	}
}
