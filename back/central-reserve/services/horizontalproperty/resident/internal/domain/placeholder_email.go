package domain

import (
	"fmt"
	"strings"
)

// PlaceholderResidentEmail es el correo provisional de un residente importado sin correo. El correo
// es único en toda la plataforma, así que incluye la propiedad: la misma persona (mismo documento)
// puede ser residente de dos conjuntos. Sin documento, `fallback` lo hace único.
func PlaceholderResidentEmail(businessID uint, dni string, fallback string) string {
	seed := strings.ReplaceAll(strings.TrimSpace(dni), " ", "")
	if seed == "" {
		seed = fallback
	}
	return fmt.Sprintf("%s.%d@residente.local", strings.ToLower(seed), businessID)
}
