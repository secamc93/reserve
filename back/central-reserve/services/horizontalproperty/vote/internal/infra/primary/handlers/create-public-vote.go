package handlers

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/mapper"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"
	"central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// CreatePublicVoteRequest - Request para crear voto público
type CreatePublicVoteRequest struct {
	PropertyUnitID uint   `json:"property_unit_id"` // Opcional - viene del token
	Dni            string `json:"dni"`              // Opcional - viene del token
	VotingOptionID uint   `json:"voting_option_id" binding:"required" example:"1"`
}

// CreatePublicVote godoc
//
//	@Summary		Emitir voto (público)
//	@Description	Permite a un residente emitir su voto. Requiere token de autenticación de votación (VOTING_AUTH_TOKEN) obtenido después de validar el residente.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			Authorization	header		string					true	"Token de autenticación de votación (VOTING_AUTH_TOKEN - Bearer token)"
//	@Param			request			body		CreatePublicVoteRequest	true	"Datos del voto (opción requerida, DNI y unidad opcionales - vienen del token)"
//	@Success		201				{object}	object
//	@Failure		400				{object}	object
//	@Failure		401				{object}	object
//	@Failure		404				{object}	object
//	@Failure		409				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/vote [post]
func (h *VotingHandler) CreatePublicVote(c *gin.Context) {
	// Extraer token del header
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/create-public-vote.go - Token no proporcionado\n")
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

	// Validar token de autenticación de votación (VOTING_AUTH_TOKEN)
	// Este token se obtiene después de validar el residente
	jwtService := jwt.New(h.jwtSecret)
	authClaims, err := jwtService.ValidateVotingAuthToken(tokenString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/create-public-vote.go - Token de autenticación inválido: %v\n", err)
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
	hpID := authClaims.HPID
	groupID := authClaims.VotingGroupID
	residentID := authClaims.ResidentID
	propertyUnitID := authClaims.PropertyUnitID

	// Validar request
	var req CreatePublicVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/create-public-vote.go - Error validando request: %v\n", err)
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
	fmt.Printf("   Residente ID (del token): %d\n", residentID)
	fmt.Printf("   Unidad ID (del token): %d\n", propertyUnitID)
	fmt.Printf("   Opción seleccionada ID: %d\n", req.VotingOptionID)

	// Mostrar campos opcionales si se enviaron (se ignoran)
	if req.PropertyUnitID != 0 {
		fmt.Printf("   Unidad ID (enviada, ignorada): %d\n", req.PropertyUnitID)
	}
	if req.Dni != "" {
		fmt.Printf("   DNI (enviado, ignorado): %s\n", req.Dni)
	}

	fmt.Printf("   Token de autenticación validado correctamente\n\n")

	// Verificar si la unidad ya votó
	hasVoted, err := h.votingUseCase.HasUnitVoted(c.Request.Context(), votingID, propertyUnitID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/create-public-vote.go - Error verificando si ya votó: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Uint("property_unit_id", propertyUnitID).Msg("Error verificando voto existente")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error verificando voto",
			Error:   err.Error(),
		})
		return
	}

	if hasVoted {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/create-public-vote.go - Unidad ya votó: property_unit_id=%d, voting_id=%d\n", propertyUnitID, votingID)
		h.logger.Warn().Uint("voting_id", votingID).Uint("property_unit_id", propertyUnitID).Msg("Unidad ya emitió su voto")
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
		PropertyUnitID: propertyUnitID,
		VotingOptionID: req.VotingOptionID,
		IPAddress:      ipAddress,
		UserAgent:      userAgent,
	}

	// Crear voto
	created, err := h.votingUseCase.CreateVote(c.Request.Context(), voteDTO)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/create-public-vote.go - Error creando voto: %v\n", err)
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
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/create-public-vote.go - Error publicando voto en cache: %v\n", err)
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
	fmt.Printf("   Unidad ID: %d\n", propertyUnitID)
	fmt.Printf("   Opción seleccionada ID: %d\n", req.VotingOptionID)
	fmt.Printf("   Timestamp: %s\n\n", created.VotedAt.Format("2006-01-02 15:04:05"))

	h.logger.Info().
		Uint("vote_id", created.ID).
		Uint("voting_id", votingID).
		Uint("resident_id", residentID).
		Uint("property_unit_id", propertyUnitID).
		Uint("voting_option_id", req.VotingOptionID).
		Str("ip_address", ipAddress).
		Msg("✅ [VOTACION PUBLICA] Voto registrado exitosamente")

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Voto registrado exitosamente",
		"data":    voteResponse,
	})
}
