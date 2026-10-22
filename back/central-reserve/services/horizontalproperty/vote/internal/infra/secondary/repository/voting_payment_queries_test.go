package repository

import (
	"errors"
	"fmt"
	"testing"
)

// Regresión 2026-10-22: el código del cobro llegó a producción sin sus tablas y todos los votos
// fallaban. Un error de tabla inexistente no debe bloquear el voto; los demás errores sí.
func TestIsMissingTable_SoloReconoceTablaInexistente(t *testing.T) {
	missing := errors.New(`ERROR: relation "horizontal_property.voting_billing_settings" does not exist (SQLSTATE 42P01)`)
	if !isMissingTable(fmt.Errorf("envuelto: %w", missing)) {
		t.Fatal("una tabla inexistente debe reconocerse")
	}
	for _, err := range []error{nil, errors.New("connection refused"), errors.New("ERROR: syntax error (SQLSTATE 42601)")} {
		if isMissingTable(err) {
			t.Fatalf("%v no es una tabla inexistente", err)
		}
	}
}
