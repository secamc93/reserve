package app_test

import (
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
)

func TestVotingDays_CuentaDiasCalendarioEnHoraDeColombia(t *testing.T) {
	d := func(y int, m time.Month, day, h int, loc *time.Location) time.Time { return time.Date(y, m, day, h, 0, 0, 0, loc) }
	cases := []struct {
		name       string
		start, end time.Time
		want       int
	}{
		{"misma mañana y noche", d(2026, 3, 14, 8, cot), d(2026, 3, 14, 23, cot), 1},
		{"pasa la medianoche", d(2026, 3, 14, 22, cot), d(2026, 3, 15, 1, cot), 2},
		{"tres días", d(2026, 3, 14, 8, cot), d(2026, 3, 16, 18, cot), 3},
		// 03:00 y 04:59 UTC del 1 de marzo siguen siendo 28 de febrero en Colombia: un solo día.
		{"medianoche UTC no parte el día", d(2026, 3, 1, 3, time.UTC), d(2026, 3, 1, 4, time.UTC), 1},
		{"cierre antes del inicio cuenta 1", d(2026, 3, 14, 8, cot), d(2026, 3, 13, 8, cot), 1},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := entities.VotingDays(c.start, c.end); got != c.want {
				t.Fatalf("VotingDays = %d, se esperaba %d", got, c.want)
			}
		})
	}
}
