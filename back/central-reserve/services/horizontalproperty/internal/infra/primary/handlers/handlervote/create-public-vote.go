package handlervote

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// CreatePublicVoteRequest - Request para crear voto público
type CreatePublicVoteRequest struct {
	VotingOptionID uint `json:"voting_option_id" binding:"required" example:"1"`
}

// CreatePublicVote godoc
//
//	@Summary		Emitir voto (público)
//	@Description	Permite a un residente validado emitir su voto. Toda la información viene del token de autenticación.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			Authorization	header		string					true	"Token de autenticación de votación (Bearer token)"
//	@Param			request			body		CreatePublicVoteRequest	true	"Datos del voto"
//	@Success		201				{object}	object
//	@Failure		400				{object}	object
//	@Failure		401				{object}	object
//	@Failure		409				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/vote [post]
func (h *VotingHandler) CreatePublicVote(c *gin.Context) {
	// Extraer token del header
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Token no proporcionado\n")
		h.logger.Error().Msg("Token de autenticación requerido")
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

	// Validar token de autenticación de votación
	jwtService := sharedjwt.New(h.jwtSecret)
	authClaims, err := jwtService.ValidateVotingAuthToken(tokenString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Token inválido: %v\n", err)
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
	groupID := authClaims.VotingGroupID

	// Validar request
	var req CreatePublicVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Error validando request: %v\n", err)
		h.logger.Error().Err(err).Msg("Error validando datos del voto")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	fmt.Printf("\n🗳️ [VOTACION PUBLICA - EMITIENDO VOTO]\n")
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Grupo de Votación ID: %d\n", groupID)
	fmt.Printf("   Votación ID: %d\n", votingID)
	fmt.Printf("   Residente ID: %d\n", residentID)
	fmt.Printf("   Opción seleccionada ID: %d\n\n", req.VotingOptionID)

	// Verificar si ya votó
	hasVoted, err := h.votingUseCase.HasResidentVoted(c.Request.Context(), votingID, residentID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Error verificando si ya votó: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Uint("resident_id", residentID).Msg("Error verificando voto existente")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error verificando voto",
			Error:   err.Error(),
		})
		return
	}

	if hasVoted {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Residente ya votó: resident_id=%d, voting_id=%d\n", residentID, votingID)
		h.logger.Warn().Uint("voting_id", votingID).Uint("resident_id", residentID).Msg("Residente ya emitió su voto")
		c.JSON(http.StatusConflict, response.ErrorResponse{
			Success: false,
			Message: "Ya has emitido tu voto",
			Error:   "No puedes votar más de una vez en esta votación",
		})
		return
	}

	// Obtener IP y User-Agent
	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	// Crear DTO para el voto
	voteDTO := domain.CreateVoteDTO{
		VotingID:       votingID,
		ResidentID:     residentID,
		VotingOptionID: req.VotingOptionID,
		IPAddress:      ipAddress,
		UserAgent:      userAgent,
	}

	// Crear voto
	created, err := h.votingUseCase.CreateVote(c.Request.Context(), voteDTO)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Error creando voto: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Uint("resident_id", residentID).Msg("Error creando voto público")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error registrando voto",
			Error:   err.Error(),
		})
		return
	}

	// Publicar voto en el cache para SSE (tiempo real)
	if err := h.votingCache.PublishVote(votingID, *created); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Error publicando voto en cache: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error publicando voto en cache")
		// No retornamos error, el voto ya fue guardado en BD
	} else {
		fmt.Printf("📡 [VOTACION PUBLICA - VOTO PUBLICADO EN SSE]\n")
		fmt.Printf("   Cache actualizado para streaming en tiempo real\n\n")
	}

	voteResponse := mapper.MapVoteDTOToResponse(created)

	fmt.Printf("✅ [VOTACION PUBLICA - VOTO REGISTRADO]\n")
	fmt.Printf("   Voto ID: %d\n", created.ID)
	fmt.Printf("   Votación ID: %d\n", votingID)
	fmt.Printf("   Residente ID: %d\n", residentID)
	fmt.Printf("   Opción seleccionada ID: %d\n", req.VotingOptionID)
	fmt.Printf("   Timestamp: %s\n\n", created.VotedAt.Format("2006-01-02 15:04:05"))

	h.logger.Info().
		Uint("vote_id", created.ID).
		Uint("voting_id", votingID).
		Uint("resident_id", residentID).
		Uint("voting_option_id", req.VotingOptionID).
		Str("ip_address", ipAddress).
		Msg("✅ [VOTACION PUBLICA] Voto registrado exitosamente")

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Voto registrado exitosamente",
		"data":    voteResponse,
	})
}
