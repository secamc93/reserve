package mappers

import "strings"

// UnitLabel arma el nombre visible de la unidad: bloque + número ("Casa 126", "Dúplex 4").
// Sin bloque, el número solo; si el número ya empieza por el bloque no lo repite.
// Es la misma regla que formatUnitLabel del front.
func UnitLabel(number, block string) string {
	n := strings.TrimSpace(number)
	b := strings.TrimSpace(block)
	if b == "" {
		return n
	}
	if n == "" {
		return b
	}
	if strings.HasPrefix(strings.ToLower(n), strings.ToLower(b)) {
		return n
	}
	return b + " " + n
}
