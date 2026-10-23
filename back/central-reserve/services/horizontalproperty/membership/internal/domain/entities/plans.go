package entities

import "time"

// DurationDays es lo que dura una membresía desde que se activa.
const DurationDays = 30

// PlanCustom es el código de las membresías a la medida que otorga el super admin (más de 20
// conjuntos, acuerdos especiales).
const PlanCustom = "CUSTOM"

// Plan es un plan de membresía a la venta.
type Plan struct {
	Code          string
	Name          string
	MaxProperties int
	PriceCOP      int64
}

// Plans es el catálogo (decisión del usuario, 2026-10-23).
var Plans = []Plan{
	{Code: "MONTH_1", Name: "Mes · 1 conjunto", MaxProperties: 1, PriceCOP: 200000},
	{Code: "ADMIN_3", Name: "Administradora · hasta 3 conjuntos", MaxProperties: 3, PriceCOP: 300000},
	{Code: "ADMIN_5", Name: "Administradora · hasta 5 conjuntos", MaxProperties: 5, PriceCOP: 450000},
	{Code: "ADMIN_10", Name: "Administradora · hasta 10 conjuntos", MaxProperties: 10, PriceCOP: 800000},
	{Code: "ADMIN_20", Name: "Administradora · hasta 20 conjuntos", MaxProperties: 20, PriceCOP: 1400000},
}

// PlanByCode busca un plan del catálogo.
func PlanByCode(code string) (Plan, bool) {
	for _, p := range Plans {
		if p.Code == code {
			return p, true
		}
	}
	return Plan{}, false
}

// Period devuelve el inicio y el fin de una membresía que se activa en start.
func Period(start time.Time) (time.Time, time.Time) {
	return start, start.Add(DurationDays * 24 * time.Hour)
}

// UniqueIDs quita repetidos y ceros conservando el orden.
func UniqueIDs(ids []uint) []uint {
	seen := map[uint]bool{}
	out := []uint{}
	for _, id := range ids {
		if id != 0 && !seen[id] {
			seen[id] = true
			out = append(out, id)
		}
	}
	return out
}
