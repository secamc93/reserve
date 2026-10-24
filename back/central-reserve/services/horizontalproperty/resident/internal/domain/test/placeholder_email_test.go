package domain_test

import (
	"testing"

	"central_reserve/services/horizontalproperty/resident/internal/domain"
)

func TestPlaceholderResidentEmail_UnicoPorPropiedad(t *testing.T) {
	a := domain.PlaceholderResidentEmail(1, "1012 345", "x")
	b := domain.PlaceholderResidentEmail(2, "1012345", "x")
	if a == b {
		t.Fatalf("la misma persona en dos conjuntos debe tener correos distintos: %q", a)
	}
	if a != "1012345.1@residente.local" {
		t.Fatalf("correo = %q", a)
	}
	if got := domain.PlaceholderResidentEmail(3, "  ", "sin_dni_9"); got != "sin_dni_9.3@residente.local" {
		t.Fatalf("sin documento = %q", got)
	}
}
