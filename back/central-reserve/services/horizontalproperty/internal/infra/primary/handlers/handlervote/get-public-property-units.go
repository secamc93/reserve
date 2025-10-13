package handlervote

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/horizontalproperty/internal/domain"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// GetPublicPropertyUnits godoc
//
//	@Summary		Obtener unidades de propiedad (público)
//	@Description	Obtiene las unidades de propiedad usando el token de votación pública. El HP ID viene en el token. Permite filtrar por número de unidad.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			Authorization	header	string	true	"Token de votación pública (Bearer token)"
//	@Param			number			query	string	false	"Filtrar por número de unidad (ej: 101, Apto 202)"
//	@Success		200				{object}	object
//	@Failure		401				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/property-units [get]
func (h *VotingHandler) GetPublicPropertyUnits(c *gin.Context) {

	// Obtener y validar token de votación pública
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-property-units.go - Token no proporcionado\n")
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Token de votación requerido",
			"error":   "Debe proporcionar el token de votación pública",
		})
		return
	}

	// Extraer token (remover "Bearer ")
	tokenString := authHeader
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	}

	jwtService := sharedjwt.New(h.jwtSecret)
	publicClaims, err := jwtService.ValidatePublicVotingToken(tokenString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-property-units.go - Token inválido: %v\n", err)
		h.logger.Error().Err(err).Msg("Token de votación pública inválido")
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Token de votación inválido",
			"error":   err.Error(),
		})
		return
	}

	// Extraer HP ID del token
	hpID := publicClaims.HPID

	// Obtener filtros de query params
	searchNumber := c.Query("number")

	fmt.Printf("\n🏢 [VOTACION PUBLICA - OBTENIENDO UNIDADES]\n")
	fmt.Printf("   HP ID: %d (desde token)\n", hpID)
	fmt.Printf("   Votación ID: %d\n", publicClaims.VotingID)
	fmt.Printf("   Grupo ID: %d\n", publicClaims.VotingGroupID)
	if searchNumber != "" {
		fmt.Printf("   Filtro por número: %s\n", searchNumber)
	}
	fmt.Printf("\n")

	// Obtener unidades de propiedad (todas, sin límite de paginación)
	filters := domain.PropertyUnitFiltersDTO{
		BusinessID: hpID,
		Number:     searchNumber,
		IsActive:   boolPtr(true),
		Page:       1,
		PageSize:   1000, // Sin límite - traer todas las unidades
	}

	fmt.Printf("🔍 [VOTACION PUBLICA - FILTROS DE BUSQUEDA]\n")
	fmt.Printf("   BusinessID: %d\n", filters.BusinessID)
	fmt.Printf("   Number filter: '%s'\n", filters.Number)
	fmt.Printf("   IsActive: %v\n", *filters.IsActive)
	fmt.Printf("   PageSize: %d\n\n", filters.PageSize)

	units, err := h.propertyUnitUseCase.ListPropertyUnits(c.Request.Context(), filters)

	fmt.Printf("📊 [VOTACION PUBLICA - RESULTADO DE BD]\n")
	fmt.Printf("   Error: %v\n", err)
	if err == nil {
		fmt.Printf("   Total en respuesta: %d\n", len(units.Units))
		fmt.Printf("   Total en BD: %d\n", units.Total)
		if len(units.Units) > 0 {
			fmt.Printf("   Primera unidad: ID=%d, Number='%s'\n", units.Units[0].ID, units.Units[0].Number)
			if len(units.Units) > 1 {
				fmt.Printf("   Última unidad: ID=%d, Number='%s'\n", units.Units[len(units.Units)-1].ID, units.Units[len(units.Units)-1].Number)
			}
		}
	}
	fmt.Printf("\n")
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-property-units.go - Error obteniendo unidades: hp_id=%d, error=%v\n", hpID, err)
		h.logger.Error().Err(err).Uint("hp_id", hpID).Msg("Error obteniendo unidades de propiedad")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Error obteniendo unidades",
			"error":   err.Error(),
		})
		return
	}

	// Simplificar respuesta: solo ID y número
	type SimpleUnit struct {
		ID     uint   `json:"id"`
		Number string `json:"number"`
	}

	simpleUnits := make([]SimpleUnit, len(units.Units))
	for i, unit := range units.Units {
		simpleUnits[i] = SimpleUnit{
			ID:     unit.ID,
			Number: unit.Number,
		}
	}

	fmt.Printf("✅ [VOTACION PUBLICA - UNIDADES OBTENIDAS]\n")
	fmt.Printf("   Total de unidades: %d\n", len(simpleUnits))
	if searchNumber != "" {
		fmt.Printf("   Resultados filtrados por: %s\n", searchNumber)
	}
	fmt.Printf("\n")

	logEvent := h.logger.Info().
		Uint("hp_id", hpID).
		Int("units_count", len(simpleUnits))
	if searchNumber != "" {
		logEvent.Str("filter_number", searchNumber)
	}
	logEvent.Msg("✅ [VOTACION PUBLICA] Unidades obtenidas exitosamente")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"units": simpleUnits,
		},
	})
}

func boolPtr(b bool) *bool {
	return &b
}
