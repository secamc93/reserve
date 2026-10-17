package mappers_test

import (
	"testing"

	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/mappers"
)

func TestUnitLabel(t *testing.T) {
	cases := []struct{ number, block, want string }{
		{"12", "Casa", "Casa 12"},
		{"3", "Dúplex", "Dúplex 3"},
		{"1001", "Local", "Local 1001"},
		{"126", "", "126"},
		{"CASA 126", "Casa", "CASA 126"},
		{"", "Jardín", "Jardín"},
		{" 7 ", " Casa ", "Casa 7"},
	}
	for _, c := range cases {
		if got := mappers.UnitLabel(c.number, c.block); got != c.want {
			t.Errorf("UnitLabel(%q, %q) = %q, se esperaba %q", c.number, c.block, got, c.want)
		}
	}
}
