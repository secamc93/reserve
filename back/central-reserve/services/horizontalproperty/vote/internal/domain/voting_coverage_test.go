package domain_test

import (
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestVotingCoverage_Covered(t *testing.T) {
	cases := []struct {
		name string
		cov  domain.VotingCoverage
		want bool
	}{
		{"sin nada no está cubierto", domain.VotingCoverage{Found: true}, false},
		{"día comprado", domain.VotingCoverage{Found: true, HasDay: true}, true},
		{"membresía vigente", domain.VotingCoverage{Found: true, HasMembership: true}, true},
		{"propiedad exenta", domain.VotingCoverage{Found: true, PropertyExempt: true}, true},
		{"administradora exenta", domain.VotingCoverage{Found: true, AdminExempt: true}, true},
		{"tablas sin migrar no bloquean", domain.VotingCoverage{Found: true, Unavailable: true}, true},
		{"votación inexistente la rechaza otra validación", domain.VotingCoverage{}, true},
	}
	for _, c := range cases {
		if got := c.cov.Covered(); got != c.want {
			t.Errorf("%s: Covered() = %v, se esperaba %v", c.name, got, c.want)
		}
	}
}

func TestVotingDate_DiaDeColombia(t *testing.T) {
	// 03:00 UTC del 15 de marzo todavía es el 14 en Colombia.
	if got := domain.VotingDate(time.Date(2099, 3, 15, 3, 0, 0, 0, time.UTC)); got != "2099-03-14" {
		t.Fatalf("VotingDate = %s, se esperaba 2099-03-14", got)
	}
}
