package entities

import (
	"sort"
	"time"
)

// DateLayout es el formato de una fecha de votación.
const DateLayout = "2006-01-02"

// MaxDatesPerPurchase limita cuántas fechas se compran de una vez.
const MaxDatesPerPurchase = 31

// colombia es la hora de Colombia (UTC-5, sin horario de verano): los días de votación son días
// calendario de Colombia.
var colombia = time.FixedZone("COT", -5*60*60)

// DateOf devuelve el día calendario en Colombia de un instante.
func DateOf(t time.Time) string {
	return t.In(colombia).Format(DateLayout)
}

// ParseDate valida una fecha "2006-01-02".
func ParseDate(s string) (time.Time, bool) {
	t, err := time.ParseInLocation(DateLayout, s, colombia)
	return t, err == nil
}

// DatesBetween lista los días calendario (Colombia) entre dos instantes, ambos incluidos, como
// máximo MaxDatesPerPurchase.
func DatesBetween(start, end time.Time) []string {
	s, _ := ParseDate(DateOf(start))
	e, _ := ParseDate(DateOf(end))
	var out []string
	for d := s; !d.After(e) && len(out) < MaxDatesPerPurchase; d = d.AddDate(0, 0, 1) {
		out = append(out, d.Format(DateLayout))
	}
	return out
}

// UniqueSorted quita repetidos y ordena.
func UniqueSorted(dates []string) []string {
	seen := map[string]bool{}
	var out []string
	for _, d := range dates {
		if !seen[d] {
			seen[d] = true
			out = append(out, d)
		}
	}
	sort.Strings(out)
	return out
}
