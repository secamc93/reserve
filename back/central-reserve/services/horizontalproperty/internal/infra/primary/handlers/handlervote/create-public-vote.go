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
	PropertyUnitID uint   `json:"property_unit_id" binding:"required" example:"1"`
	Dni            string `json:"dni" binding:"required" example:"123456789"`
	VotingOptionID uint   `json:"voting_option_id" binding:"required" example:"1"`
}

// CreatePublicVote godoc
//
//	@Summary		Emitir voto (público)
//	@Description	Permite a un residente emitir su voto validando DNI + unidad. Requiere token de votación pública.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			Authorization	header		string					true	"Token de votación pública (Bearer token)"
//	@Param			request			body		CreatePublicVoteRequest	true	"Datos del voto (unidad, DNI, opción)"
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

	// Validar token de votación pública
	jwtService := sharedjwt.New(h.jwtSecret)
	publicClaims, err := jwtService.ValidatePublicVotingToken(tokenString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Token inválido: %v\n", err)
		h.logger.Error().Err(err).Msg("Token de votación pública inválido")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de votación inválido",
			Error:   err.Error(),
		})
		return
	}

	// Extraer información del token
	votingID := publicClaims.VotingID
	hpID := publicClaims.HPID
	groupID := publicClaims.VotingGroupID

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
	fmt.Printf("   Unidad ID: %d\n", req.PropertyUnitID)
	fmt.Printf("   DNI: %s\n", req.Dni)
	fmt.Printf("   Opción seleccionada ID: %d\n", req.VotingOptionID)
	fmt.Printf("   Token decodificado correctamente\n\n")

	// Validar residente por DNI + unidad
	fmt.Printf("🔍 [VOTACION PUBLICA - VALIDANDO DNI]\n")
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Unidad ID: %d\n", req.PropertyUnitID)
	fmt.Printf("   DNI recibido: '%s'\n", req.Dni)
	fmt.Printf("   Validando...\n\n")

	resident, err := h.votingUseCase.ValidateResidentForVoting(c.Request.Context(), hpID, req.PropertyUnitID, req.Dni)
	if err != nil {
		status := http.StatusInternalServerError
		message := "Error validando residente"

		// Manejar errores específicos
		errorMsg := err.Error()
		if errorMsg == "residente no encontrado" {
			status = http.StatusNotFound
			message = "Residente no encontrado"
		} else if errorMsg == "residente inactivo" {
			status = http.StatusForbidden
			message = "Residente inactivo"
		}

		fmt.Fprintf(os.Stderr, "❌ [VOTACION PUBLICA - VALIDACION FALLIDA]\n")
		fmt.Fprintf(os.Stderr, "   Unidad ID: %d\n", req.PropertyUnitID)
		fmt.Fprintf(os.Stderr, "   DNI: '%s'\n", req.Dni)
		fmt.Fprintf(os.Stderr, "   Error: %v\n", err)
		fmt.Fprintf(os.Stderr, "   Status: %d\n", status)
		fmt.Fprintf(os.Stderr, "   Message: %s\n\n", message)

		h.logger.Error().Err(err).Uint("property_unit_id", req.PropertyUnitID).Str("dni", req.Dni).Msg("Error validando residente")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: message,
			Error:   err.Error(),
		})
		return
	}

	fmt.Printf("✅ [VOTACION PUBLICA - RESIDENTE VALIDADO]\n")
	fmt.Printf("   Residente ID: %d\n", resident.ID)
	fmt.Printf("   Nombre: %s\n", resident.Name)
	fmt.Printf("   Unidad: %s\n\n", resident.PropertyUnitNumber)

	propertyUnitID := req.PropertyUnitID

	// Verificar si la unidad ya votó
	hasVoted, err := h.votingUseCase.HasUnitVoted(c.Request.Context(), votingID, propertyUnitID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Error verificando si ya votó: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Uint("property_unit_id", propertyUnitID).Msg("Error verificando voto existente")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error verificando voto",
			Error:   err.Error(),
		})
		return
	}

	if hasVoted {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Unidad ya votó: property_unit_id=%d, voting_id=%d\n", propertyUnitID, votingID)
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
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-public-vote.go - Error creando voto: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Uint("resident_id", resident.ID).Msg("Error creando voto público")
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
	fmt.Printf("   Unidad ID: %d\n", propertyUnitID)
	fmt.Printf("   Opción seleccionada ID: %d\n", req.VotingOptionID)
	fmt.Printf("   Timestamp: %s\n\n", created.VotedAt.Format("2006-01-02 15:04:05"))

	h.logger.Info().
		Uint("vote_id", created.ID).
		Uint("voting_id", votingID).
		Uint("resident_id", resident.ID).
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
